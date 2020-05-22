<template>
    <b-container fluid>
        <b-row v-if="pool"  >
            <b-col class="col-auto">
                <SideScrollNav :stages="stages" :mods="mods" :name="pool.name" />
            </b-col>
            <b-col>
                <div id="pool" style="padding: 1em 0 0 0 ;height:calc(100vh - 5em);  overflow-y:auto">
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
                    />
                </div>
            </b-col>
        </b-row>
    </b-container>
</template>
<script>
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
        NewMap
    },
    data: function() {
        return {
            loaded: false
        };
    },
    asyncComputed: {
        maps: async function() {
            if (this.pool) {
                await this.pool.getMaps();
                this.loaded = true;
                return this.pool.maps.maps;
            } else {
                return [];
            }
        }
    },
    computed: {
        emptyPool: function() {
            if (this.maps !== null) {
                console.log(this.maps.length);
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
        bulkReturnList: function(list) {
            console.log(list);
            const maps = list
                .map(map => {
                    if (!map.id) return;
                    return EloMap.create(map, this.pool, this.pool.api);
                })
                .filter(map => map);
            //actual upload routine
            //fake one
            console.log(maps);
            this.maps.push(...maps);
        }
    }
};
</script>
<style>
/*.div {
    width: 100%
}*/
</style>