<template>
    <b-col>
        <b-overlay :show="true" rounded="sm">
            <!-- template for newMap -->
            <template v-slot:overlay>
                <div class="text-center">
                    <EditMap
                        :presetMod="presetMod"
                        :api="api"
                        :newMap="newMap"
                        :confirmVariant="confirmVariant"
                        :mods="mods"
                        :stages="stages"
                        @edit-return="editReturnMap"
                        @popup-visible="onPopUpEvent(true)"
                        @popup-hidden="onPopUpEvent(false)"
                        class="mr-1"
                    >
                        <template v-slot:buttonContent>add</template>
                        <template v-slot:title>add new map</template>
                        <template v-slot:confirm>add</template>
                    </EditMap>
                    <BulkMap
                        v-if="newPool"
                        :api="api"
                        confirmVariant="primary"
                        @bulk-return="bulkReturnList"
                    >
                        <template v-slot:buttonContent>Bulk Upload</template>
                        <template v-slot:title>Bulk upload tool</template>
                        <template v-slot:confirm>upload</template>
                    </BulkMap>
                </div>
            </template>
            <!-- end template -->
            <b-card
                tag="article"
                class="mb-2"
                style="min-width: 24em;"
                @mouseover="hoverCard(true)"
                @mouseleave="hoverCard(false)"
            >
                <b-card-text>加张新图。。。</b-card-text>
            </b-card>
        </b-overlay>
    </b-col>
</template>
<script>
const { EloMap } = require("elo-mappool-client");
const modHelper = require("../helpers/enum");
// const defaultString = {
//     type: String,
//     default: 'loading',
// }
const defaultBoolean = {
    type: Boolean,
    default: false
};
// const defaultNumber = {
//     type: [Number, String],
//     default: -1,
// }
const defaultObject = {
    type: Object,
    default: () => ({})
};
const defaultArray = {
    type: Array,
    default: () => []
};

const { default: KVList } = require("./KVList");
const { default: EditMap } = require("./EditMapPopUp");
const { default: BulkMap } = require("./BulkUploadTool");

module.exports = {
    name: "NewMap",
    props: {
        api: defaultObject,
        pool: defaultObject,
        mods: defaultArray,

        splitted: defaultObject,

        newMap: defaultBoolean,
        beatmap: defaultObject,
        presetMod: defaultArray,
        newPool: defaultBoolean
    },
    components: {
        KVList,
        EditMap,
        BulkMap
    },
    data: function() {
        return {
            hover: false,
            hoverDeactivateDelay: undefined,
            onPopUp: false,
            onPopUpDelay: undefined,
            confirmVariant: "primary"
        };
    },
    computed: {
        stages: function() {
            return Object.keys(this.splitted);
        }
    },
    methods: {
        hoverCard(on) {
            if (on) {
                clearTimeout(this.hoverDeactivateDelay);
                this.hover = true;
            } else {
                if (!this.onPopUp) {
                    this.hoverDeactivateDelay = setTimeout(
                        () => (this.hover = false),
                        300
                    );
                }
            }
        },
        strMapName: function(map) {
            return `${map.artist} - ${map.title} [${map.version}]`;
        },
        onPopUpEvent: function(on) {
            if (on) {
                clearTimeout(this.onPopUpDelay);
                this.onPopUp = true;
            } else {
                //this.onPopUpDelay = setTimeout(() => this.onPopUp = false, 300)
                this.onPopUp = false;
            }
        },
        getNewIndexInStageMod: function(newMap, stage, mod) {
            let index = this.getStageModIndexLength(stage, mod);
            const dest = this.splitted[stage]
                ? this.splitted[stage][modHelper.toEnum(mod)]
                : undefined;
            console.log("dest", dest);
            if (!dest) {
                index = 1;
                // } else if (Object.values(dest).find((map) => newMap == map)) {
                //     return map.index;
            } else {
                while (dest[index] && index < 999) {
                    index += 1;
                }
            }
            console.info(
                `got new index for map:`,
                this.strMapName(newMap),
                index
            );
            return index;
        },
        getStageModIndexLength(stage, mod) {
            const dest = this.splitted[stage]
                ? this.splitted[stage][modHelper.toEnum(mod)]
                : undefined;
            const destLength = dest ? Object.keys(dest).length : 0;
            return destLength;
        },
        editReturnMap: async function(beatmap) {
            this.$root.$emit("t-log",beatmap, "new map returned bm");
            const map = EloMap.create(beatmap, this.pool, this.pool.api);
            await map.banchoResult();
            map.index = this.getNewIndexInStageMod(
                map,
                beatmap.stage,
                beatmap.mods
            );
            this.$root.$emit("t-log",map.toApiStruct(), "created bm");
            
            this.pool.maps.maps.push(map);
            // this.upload(map);
            const result = await map.upload()
            // console.log(result,'upload new map result');
            this.$root.$emit("t-log", result,'upload new map result');
        },
        bulkReturnList: function(list) {
            this.$emit("bulk-return", list);
        }
    }
};
</script>