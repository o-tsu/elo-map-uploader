<template>
    <div>
        <div v-for="(maps,modEnum) in splitByMods" :key="`elo-${stage}-${toModStr(modEnum)}`">
            <h3 :id="`elo-${stage}-${toModStr(modEnum)}`">
                <b-badge variant="primary">{{toModStr(modEnum)}}</b-badge>
                <b-badge variant="light">{{maps.length}} maps</b-badge>
                <!-- <b-button v-b-toggle="`collapse-${stage}-${mods[index]}`"><span class="when-opened">Fold</span>
                <span class="when-closed">Unfold</span></b-button>-->
            </h3>
            <!-- :id="`collapse-${stage}-${mods[index]}`" -->
            <!-- <b-collapse visible> -->
            <b-row align-v="stretch" >
                <Beatmap
                    v-for="(map) in maps"
                    :key="`elo-${stage}-${toModStr(modEnum)}-${map.index}-${map.id}`"
                    v-bind="map"
                    :beatmap="map"
                    :sameMods="maps"
                    :sameStage="splitByMods"
                    :splitted="splitByStagesThenMods"
                    :mods="mods"
                    :highestIndexInMods="highestIndexInMods"
                />
                <NewMap
                    :key="`elo-${stage}-${toModStr(modEnum)}-new`"
                    :sameMods="maps"
                    :sameStage="splitByMods"
                    :splitted="splitByStagesThenMods"
                    :mods="mods"
                    :newMap="true"
                    :pool="pool"
                    :api="pool.api"
                    :presetMod="toMods(modEnum)"
                    :highestIndexInMods="highestIndexInMods"
                />
            </b-row>
            <!-- </b-collapse> -->
        </div>
    </div>
</template>
<script>
const { default: Beatmap } = require("./EloMap.vue");
const { default: NewMap } = require("./NewMap.vue");

const modHelper = require("../helpers/enum");
// const { MapList } = require('elo-mappool-client');
module.exports = {
    name: "MapList",
    props: ["list", "mods", "stage", "splitByStages", "pool"],
    components: {
        Beatmap,
        NewMap,
    },
    computed: {
        splitByMods: function() {
            return this.splitListByMods(this.list);
        },
        countMaps: function() {
            return this.list.length;
        },
        splitByStagesThenMods: function() {
            return Object.entries(this.splitByStages).reduce(
                (acc, [stageName, maps]) => {
                    acc[stageName] = this.splitListByMods(maps);
                    return acc;
                },
                {}
            );
        },
        highestIndexInMods: function() {
            return Object.entries(this.splitByMods).reduce(
                (acc, [enumMod, maps]) => {
                    acc[enumMod] = this.higestIndexOf(maps);
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
                maps.sort((a,b) => a.index - b.index);
                acc[modHelper.toEnum(mod)] = maps;
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
        toMods: function(num) {
            return modHelper.toModList(num);
        },
        toModStr: function(num) {
            return this.toMods(num).join("");
        },
        higestIndexOf(maps) {
            return Math.max(...maps.map(map => map.index));
        }
    }
};
</script>
<style>
h3::before {
    display: block;
    content: " ";
    margin-top: -4rem;
    height: 4rem;
    visibility: hidden;
    pointer-events: none;
}
</style>