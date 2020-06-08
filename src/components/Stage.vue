<template>
    <div>
        <h2 :id="`elo-${stage}`" class="pb-4">
            <b-badge variant="primary">{{stage}}</b-badge>
            <b-badge variant="light">{{countMaps}} maps</b-badge>
            <b-button v-b-toggle="`collapse-${stage}`">
                <span class="when-opened">Fold</span>
                <span class="when-closed">Unfold</span>
            </b-button>
        </h2>
        <b-collapse :id="`collapse-${stage}`" visible>
            <MapList
                :stage="stage"
                :list="list"
                :mods="mods"
                :splitByStages="splitByStages"
                :pool="pool"
            />
        </b-collapse>
    </div>
</template>
<script>
const { default: MapList } = require("./MapList.vue");
module.exports = {
    name: "Stage",
    props: ["list", "mods", "stage", "splitByStages", "pool"],
    computed: {
        countMaps: function() {
            return this.list.length;
        }
    },
    components: {
        MapList
    }
};
</script>
<style>
h2::before {
    display: block;
    content: " ";
    margin-top: -3.5rem;
    height: 3.5rem;
    visibility: hidden;
    pointer-events: none;
}
.collapsed > .when-opened,
:not(.collapsed) > .when-closed {
    display: none;
}
</style>