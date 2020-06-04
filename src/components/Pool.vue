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
                            <b-button @click="getMaps">sync</b-button>
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
    // watch: {
    //     pool() {
    //         this.pool.getMaps();
    //     }
    // },
    mounted() {
        this.$root.$on("delete-map", this.deleteBeatmap);
        this.$root.$on("upload-map", this.uploadBeatmap);
        this.$root.$on("t-log", this.logEvent);
        this.$root.$on("need-update", this.updatePool);
    },
    beforeDestroy() {
        this.$root.$off("delete-map", this.deleteBeatmap);
        this.$root.$off("upload-map", this.uploadBeatmap);
        this.$root.$off("t-log", this.logEvent);
        this.$root.$off("need-update", this.updatePool);
    },
    data: function() {
        return {
            loaded: false,
            hh: 0,
            // maps: [],
        };
    },
    asyncComputed: {
        maps: {
            async get() {
                if (!this.pool) return [];
                if (!this.pool.maps) await this.getMaps();
                return this.pool.maps.maps;
            },
            set(val) {
                console.log(val);
                this.pool.maps.maps = val;
                // console.log(this.pool.maps.maps);
                this.$forceUpdate();
            },
            // watch: ["hh","pool"]
        }
    },
    computed: {
        // maps: function() {
        //     if (!this.pool) return [];
        //     if (!this.pool.maps) return [];
        //     return this.pool.maps.maps;
        // },
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
                    // console.log('pool.mods.reduce',cur.mods)
                    const rawMod = modHelper.toEnum(cur.mods);
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
        async updatePool() {
            // this.hh += 1;
            // console.log("need update");
            // delete this.pool.maps;
            // this.$forceUpdate();
            // return this.getMaps();
            // return this.refreshMaps();
        },
        async getMaps() {
            console.log('get maps')
            if (this.pool) {
                // this.pool.maps = undefined
                await this.pool.getMaps();
                // console.log('get maps done')
                this.loaded = true;
                // return this.pool.maps.maps;
                this.maps = this.pool.maps.maps;
            } else {
                return [];
            }
        },
        splitListByMods: function(list) {
            return this.mods.reduce((acc, mod) => {
                const maps = list.filter(map => {
                    return modHelper.toEnum(map.mods) == modHelper.toEnum(mod);
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
            // const h = this.$createElement;
            // Create the title
            // const vNodesTitle = h("strong", { class: "mr-2" }, message);
            // return vNodesTitle;
            return <strong class="mr-2">{message}</strong>;
        },
        createJSONViewer(message) {
            // const h = this.$createElement;
            // // Create the message
            // const vNodesMsg = ()
            // return vNodesMsg
            return <VueJsonPretty data={message}></VueJsonPretty>;
        },
        popToast(vNodesMsg, vNodesTitle, { variant = "info", toster } = {}) {
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
        //             modHelper.toEnum(bm.mods) == modHelper.toEnum(mod) &&
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
        //             beatmap.mods,
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
                    mod: map.mods,
                    index: map.index
                }),
                this.createTitle("delete map"),
                {
                    variant: "danger"
                }
            );
            this.maps = this.maps.filter(bm => bm._id !== map._id);
            this.hh += 1;
        },
        async uploadBeatmap(map) {
            this.popToast(
                this.createJSONViewer({
                    id: map.id,
                    stage: map.stage,
                    mod: map.mods,
                    index: map.index
                }),
                this.createTitle("upload map"),
                {
                    variant: "info"
                }
            );
            this.maps.push(map);
            this.hh += 1;
        },
        async logEvent(e, title = "result", { variant = "info" } = {}) {
            console.log(e);
            this.popToast(
                this.createJSONViewer(JSON.parse(JSON.stringify(e))),
                this.createTitle(title),
                {
                    variant
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