<template>
    <b-container fluid>
        <b-row v-if="pool">
            <b-col class="col-auto">
                <SideScrollNav :stages="stages" :mods="mods" :name="pool.name" />
            </b-col>
            <b-col>
                <div class="text-center mt-1 mb-1">
                    <b-button-toolbar>
                        <b-button-group>
                            <b-button>delete all maps</b-button>
                            <b-button>sync</b-button>
                        </b-button-group>
                    </b-button-toolbar>
                </div>

                <div
                    id="pool"
                    style="padding: 1em 0 0 0 ;height:calc(100vh - 10em);  overflow-y:auto"
                >
                    <NewMap
                        :key="`elo-new`"
                        :splitted="splitByStagesThenMods"
                        :mods="mods"
                        :newMap="true"
                        :api="api"
                        :pool="pool"
                        :presetMod="[]"
                        :newPool="emptyPool"
                        @bulk-return="bulkReturnList"
                    />
                    <Stage
                        v-for="(stage,stageName) in splitByStages"
                        :key="stageName"
                        :stage="stageName"
                        :list="stage"
                        :mods="mods"
                        :splitByStages="splitByStages"
                        :pool="pool"
                        style="overflow-x: hidden;"
                    />
                </div>
            </b-col>
        </b-row>
    </b-container>
</template>
<script>
const { default: VueJsonPretty } = require("vue-json-pretty");
const { default: Stage } = require("./Stage.vue");
const { default: SideScrollNav } = require("./SideScrollNav.vue");
const { default: NewMap } = require("./NewMap.vue");

const modHelper = require("../helpers/enum");
const { EloMap } = require("elo-mappool-client");

module.exports = {
    name: "Pool",
    props: ["pool"],
    components: {
        Stage,
        SideScrollNav,
        NewMap,
        VueJsonPretty
    },
    mounted() {
        this.$root.$on("delete-map", this.deleteBeatmap);
        this.$root.$on("upload-map", this.uploadBeatmap);
        this.$root.$on("t-log", this.logEvent);
    },
    beforeDestroy() {
        this.$root.$off("delete-map", this.deleteBeatmap);
        this.$root.$off("upload-map", this.uploadBeatmap);
        this.$root.$off("t-log", this.logEvent);
    },
    data: function() {
        return {
            loaded: false
        };
    },
    asyncComputed: {
        maps: async function() {
            return await this.refreshMaps();
        }
    },
    computed: {
        emptyPool: function() {
            if (this.maps !== null) {
                return this.maps.length == 0;
            } else return false;
        },
        api: function() {
            return this.pool.api;
        },
        stages: function() {
            if (this.maps !== null)
                return this.maps
                    .reduce((acc, cur) => {
                        const stage = cur.stage;
                        if (!acc.includes(stage)) {
                            acc.push(stage);
                        }
                        return acc;
                    }, [])
                    .sort();
            else return [];
        },
        stageList: function() {
            if (this.stages !== null)
                return this.stages.map(stage =>
                    this.maps.filter(map => map.stage == stage)
                );
            else return [];
        },
        mods: function() {
            let result;
            if (this.maps !== null) {
                result = this.maps.reduce((acc, cur) => {
                    // console.log('pool.mods.reduce',cur.mod)
                    const rawMod = modHelper.toEnum(cur.mod);
                    if (!acc.includes(rawMod)) {
                        acc.push(rawMod);
                    }
                    return acc;
                }, []);
                result.sort((a, b) => a - b);
                return result.map(mod => modHelper.toModList(mod));
            } else return [];
        },
        splitByStages: function() {
            if (this.stages !== null)
                return this.stages.reduce((acc, stage) => {
                    const maps = this.maps.filter(map => map.stage == stage);
                    acc[stage] = maps;
                    return acc;
                }, {});
            else return {};
        },
        splitByStagesThenMods: function() {
            return Object.entries(this.splitByStages).reduce(
                (acc, [stageName, maps]) => {
                    acc[stageName] = this.splitListByMods(maps);
                    return acc;
                },
                {}
            );
        }
    },
    methods: {
        async refreshMaps() {
            if (this.pool) {
                await this.pool.getMaps();
                this.loaded = true;
                return this.pool.maps.maps;
            } else {
                return [];
            }
        },
        splitListByMods: function(list) {
            return this.mods.reduce((acc, mod) => {
                const maps = list.filter(map => {
                    return modHelper.toEnum(map.mod) == modHelper.toEnum(mod);
                });
                acc[modHelper.toEnum(mod)] = this.createListFromArrayByIndex(
                    maps
                );
                return acc;
            }, {});
        },
        createListFromArrayByIndex: function(array) {
            return array.reduce((acc, map) => {
                const index = map.index;
                acc[index] = map;
                return acc;
            }, {});
        },
        async bulkReturnList(list) {
            console.log(list);
            const maps = list
                .map(map => {
                    if (!map.id) return;
                    return EloMap.create(map, this.pool, this.pool.api);
                })
                .filter(map => map);
            //actual upload routine
            //fake one
            const results = await Promise.all(maps.map(map => map.upload()));
            console.log({ maps, results });
            this.maps.push(...maps);
        },
        createTitle(message) {
            // Use a shorter name for this.$createElement
            const h = this.$createElement;
            // Create the title
            const vNodesTitle = h("strong", { class: "mr-2" }, message);
            return vNodesTitle;
        },
        createJSONViewer(message) {
            // const h = this.$createElement;
            // // Create the message
            // const vNodesMsg = ()
            // return vNodesMsg
            return <VueJsonPretty data={message}></VueJsonPretty>;
        },
        popToast(vNodesMsg, vNodesTitle, { variant= 'info', toster } = {}) {
            // Pass the VNodes as an array for message and title
            this.$bvToast.toast([vNodesMsg], {
                title: [vNodesTitle],
                solid: true,
                variant: variant,
                toster
            });
        },
        // relativeBeatmapExists(stage, mod, index) {
        //     return this.maps.find(
        //         bm =>
        //             bm.stage == stage &&
        //             modHelper.toEnum(bm.mod) == modHelper.toEnum(mod) &&
        //             bm.index == index
        //     );
        // },
        // async moveBeatmapForward(
        //     beatmap,
        //     autoUpdate = this.autoUpdate || true
        // ) {
        //     const index = beatmap.index;
        //     const target = beatmap.index - 1;
        //     if (index > 1) {
        //         const occupiedMap = this.relativeBeatmapExists(
        //             beatmap.stage,
        //             beatmap.mod,
        //             target
        //         );
        //         if (occupiedMap) {
        //             //switch two maps' index
        //             if (autoUpdate) await this.deleteBeatmap(occupiedMap);
        //             occupiedMap.index += 1;
        //             if (autoUpdate) await this.uploadBeatmap(occupiedMap);
        //         }
        //         if (autoUpdate) await this.deleteBeatmap(beatmap);
        //         beatmap.index -= 1;
        //         if (autoUpdate) await this.uploadBeatmap(beatmap);
        //     }
        // },
        async deleteBeatmap(map) {
            this.popToast(
                this.createJSONViewer({
                    id: map.id,
                    stage: map.stage,
                    mod: map.mod,
                    index: map.index
                }),
                this.createTitle("delete map"),
                {
                    variant: "danger"
                }
            );
        },
        async uploadBeatmap(map) {
            this.popToast(
                this.createJSONViewer({
                    id: map.id,
                    stage: map.stage,
                    mod: map.mod,
                    index: map.index
                }),
                this.createTitle("upload map"),
                {
                    variant: "info"
                }
            );
        },
        async logEvent(e,title = 'result',{variant = 'info'} = {}) {
            console.log(e);
            this.popToast(
                this.createJSONViewer(JSON.parse(JSON.stringify(e))),
                this.createTitle(title),
                {
                    variant,
                }
            );
        }
    }
};
</script>
<style>
/*.div {
    width: 100%
}*/
</style>