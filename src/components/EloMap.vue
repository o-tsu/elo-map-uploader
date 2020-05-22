<template>
    <b-col>
        <b-overlay :show="!ready" rounded="sm">
            <b-card
                v-bind:img-src="img"
                img-alt="Image"
                img-top
                no-body
                tag="article"
                style="min-width: 27em;"
                @mouseover="hoverCard(true)"
                @mouseleave="hoverCard(false)"
                class="overflow-hidden mb-2"
            >
                <template v-slot:header>
                    <h6 style="overflow: hidden;text-overflow: ellipsis;">
                        {{ strMapName }}
                    </h6>
                    <b-badge pill class="mr-1">{{relativeIndex}}</b-badge>
                    <KVBadge
                        v-for="(section,sectionName,index) in difficultyBreakdown"
                        :key="`${absoluteIndex}-${sectionName}`"
                        :list="section"
                        pill
                        :variant="variant(index)"
                    ></KVBadge>
                </template>
                <b-collapse v-model="hover">
                    <b-card-body>
                        <span v-html="text"></span>
                        <br />
                        <!-- when hover -->

                        <b-button-group>
                            <b-button
                                v-for="(list,index) in {objects: beatmap.objects,length: readableLength}"
                                :key="`collapse-button-for-${absoluteIndex}-${index}`"
                                v-b-toggle="`collapse-${absoluteIndex}-${index}`"
                                variant="primary"
                            >{{index}}</b-button>
                        </b-button-group>
                        <!-- not hovered -->
                        <b-collapse :visible="!hover"></b-collapse>
                    </b-card-body>
                    <b-collapse
                        v-for="(list,index) in {objects: beatmap.objects,length: readableLength}"
                        :key="`collapse-${absoluteIndex}-${index}`"
                        :id="`collapse-${absoluteIndex}-${index}`"
                        class="mt-2"
                    >
                        <KVList :list="list" />
                    </b-collapse>
                </b-collapse>

                <b-collapse v-model="hover">
                    <b-card-footer>
                        <!-- :style="{visibility: hover ? 'visible' : 'hidden'}" -->
                        <b-button-toolbar justify>
                            <b-button-group class="mx-1">
                                <b-button @click.once="moveToStart()">
                                    <b-icon-chevron-double-left />
                                </b-button>
                                <b-button @click.once="moveForward()">
                                    <b-icon-chevron-left />
                                </b-button>
                            </b-button-group>
                            <b-button-group>
                                <!-- <b-button :id="`edit-${absoluteIndex}-${index}`" variant="primary">edit</b-button> -->
                                <EditMap
                                    :api="beatmap.api"
                                    :confirmVariant="confirmVariant"
                                    :beatmap="beatmap"
                                    :absoluteIndex="absoluteIndex"
                                    :mods="mods"
                                    :stages="stages"
                                    @edit-return="editReturnMap"
                                    @popup-visible="onPopUpEvent(true)"
                                    @popup-hidden="onPopUpEvent(false)"
                                >
                                    <template v-slot:buttonContent>Edit</template>
                                    <template v-slot:title>
                                        Edit:
                                        <br />
                                        {{strMapName}}
                                    </template>
                                    <template v-slot:confirm>update</template>
                                </EditMap>
                                <!--                                 <b-button variant="warning">update</b-button> -->
                                <b-button variant="danger" @click.once="deleteMap()">Delete</b-button>
                                <b-dropdown text="Move To">
                                    <b-dropdown-group
                                        v-for="(stage,stageName) in splitted"
                                        :header="stageName"
                                        :key="`moveTo-${stageName}`"
                                    >
                                        <b-dropdown-item
                                            v-for="(modName,index) in mods"
                                            :key="`moveTo-${stageName}-${modName.join('')}-${index}`"
                                            @click.once="moveToOtherBracket(stageName,modName)"
                                        >{{modName.join("")}}</b-dropdown-item>
                                    </b-dropdown-group>
                                </b-dropdown>
                            </b-button-group>
                            <b-button-group class="mx-1">
                                <b-button @click.once="moveBackward()">
                                    <b-icon-chevron-right />
                                </b-button>
                                <b-button @click.once="moveToEnd()">
                                    <b-icon-chevron-double-right />
                                </b-button>
                            </b-button-group>
                        </b-button-toolbar>
                    </b-card-footer>
                </b-collapse>
            </b-card>
        </b-overlay>
    </b-col>
</template>
<script>
// const { EloMap } = require('elo-mappool-client');
const modHelper = require("../helpers/enum");
// const defaultString = {
//     type: String,
//     default: 'loading',
// }
// const defatulBoolean = {
//     type: Boolean,
//     default: false,
// }
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
const { default: KVBadge } = require("./KVBadge");
const { default: EditMap } = require("./EditMapPopUp");

module.exports = {
    name: "Beatmap",
    props: {
        mods: defaultArray,
        sameMods: defaultArray,

        highestIndexInMods: defaultObject,
        sameStage: defaultObject,
        splitted: defaultObject,
        beatmap: defaultObject,
        clickDelay: {
            type: [Boolean, Number],
            default: false
        }
    },
    components: {
        KVList,
        KVBadge,
        EditMap
    },
    data: function() {
        return {
            hover: false,
            hoverDeactivateDelay: undefined,
            onPopUp: false,
            onPopUpDelay: undefined,
            confirmVariant: "warning",
            autoUpdate: true
        };
    },
    mounted: async function() {
        await this.beatmap.banchoResult();
    },
    computed: {
        img: function() {
            if (this.beatmap.banchoResultReady)
                return `https://assets.ppy.sh/beatmaps/${this.beatmap.beatmapSetId}/covers/card.jpg`;
            else
                return `https://via.placeholder.com/400x100?text=@Explosive...`;
        },
        strMapName: function() {
            // ${this.beatmap.artist} - 
            if (this.beatmap.banchoResultReady)
                return `${this.beatmap.title} [${this.beatmap.version}]`;
            else return "等爆炸消息...";
        },
        relativeIndex: function() {
            if (this.beatmap.banchoResultReady)
                return `${this.beatmap.mod.join("")}${this.beatmap.index}`;
            else return "no map";
        },
        text: function() {
            if (this.hover) {
                return "点开看看三维";
            } else {
                return "";
            }
        },
        absoluteIndex: function() {
            if (this.beatmap.banchoResultReady) {
                return `bm-${this.beatmap.id}-${
                    this.beatmap.stage
                }-${this.beatmap.mod.join("")}${this.beatmap.index}`;
            } else return "no index";
        },
        readableLength: function() {
            if (this.beatmap.banchoResultReady)
                return Object.entries(this.beatmap.length).reduce(
                    (acc, [key, value]) => {
                        acc[key] = this.forHumans(value);
                        return acc;
                    },
                    {}
                );
        },
        highestSameModIndex: function() {
            return this.highestIndexInMods[this.enumMapMod];
        },
        stages: function() {
            return Object.keys(this.splitted);
        },
        ready: function() {
            return (this.beatmap && this.beatmap.banchoResultReady) || false;
        },
        difficultyBreakdown: function() {
            if (this.beatmap.banchoResultReady) {
                const d = this.beatmap.difficulty;

                return {
                    diff: {
                        CS: d.size,
                        OD: d.overall,
                        AR: d.approach,
                        HP: d.drain
                    },
                    stars: {
                        "🌟": d.rating.toPrecision(2),
                        "🎯": d.aim.toPrecision(2),
                        "💪🏻": d.speed.toPrecision(2)
                    }
                };
            } else {
                return {};
            }
        },
        enumMapMod: function() {
            return modHelper.toEnum(this.beatmap.mod);
        }
    },
    methods: {
        /**
         * Translates seconds into human readable format of seconds, minutes, hours, days, and years
         *
         * @param  {number} seconds The number of seconds to be processed
         * @return {string}         The phrase describing the the amount of time
         */
        forHumans: function(seconds) {
            var levels = [
                [Math.floor(seconds / 31536000), "years"],
                [Math.floor((seconds % 31536000) / 86400), "days"],
                [Math.floor(((seconds % 31536000) % 86400) / 3600), "hours"],
                [
                    Math.floor((((seconds % 31536000) % 86400) % 3600) / 60),
                    "minutes"
                ],
                [(((seconds % 31536000) % 86400) % 3600) % 60, "seconds"]
            ];
            var returntext = "";

            for (var i = 0, max = levels.length; i < max; i++) {
                if (levels[i][0] === 0) continue;
                returntext +=
                    " " +
                    levels[i][0] +
                    " " +
                    (levels[i][0] === 1
                        ? levels[i][1].substr(0, levels[i][1].length - 1)
                        : levels[i][1]);
            }
            return returntext.trim();
        },
        deleteMap: function() {
            return this.delete();
        },
        //index -=1
        moveForward: async function(autoUpdate = this.autoUpdate || true) {
            const index = this.beatmap.index;
            const last = index - 1;
            if (index > 1) {
                //target index occupied by some map.
                const occupiedMap = this.sameMods.find(
                    map => map.index == last
                );
                if (occupiedMap) {
                    //switch two maps' index
                    if (autoUpdate) await this.delete(occupiedMap);
                    occupiedMap.index += 1;
                    if (autoUpdate) await this.upload(occupiedMap);
                }
                if (autoUpdate) await this.delete();
                this.beatmap.index -= 1;
                if (autoUpdate) await this.upload();
                return;
            } else {
                return;
            }
        },
        //index +=1
        moveBackward: async function(autoUpdate = this.autoUpdate || true) {
            const index = this.beatmap.index;
            const next = index + 1;
            const _highestSameModIndex = this.highestSameModIndex;
            if (index < _highestSameModIndex) {
                //target index occupied by some map.
                const occupiedMap = this.sameMods.find(
                    map => map.index == next
                );
                if (occupiedMap) {
                    //switch two maps' index
                    if (autoUpdate) await this.delete(occupiedMap);
                    occupiedMap.index -= 1;
                    if (autoUpdate) await this.upload(occupiedMap);
                }
                if (autoUpdate) await this.delete();
                this.beatmap.index += 1;
                if (autoUpdate) await this.upload();
            } else {
                return;
            }
        },
        moveToStart: async function(autoUpdate = this.autoUpdate || true) {
            const index = this.beatmap.index;
            if (index > 1) {
                if (autoUpdate) await this.delete();
                this.beatmap.index = -1;

                this.sameMods
                    .filter(map => map.index >= 1 && map.index <= index)
                    .map(async map => {
                        if (autoUpdate) await this.delete(map);
                        map.index += 1;
                        if (autoUpdate) await this.upload(map);
                    });
                this.beatmap.index = 1;
                this.upload();
            } else {
                return;
            }
        },
        moveToEnd: async function(autoUpdate = this.autoUpdate || true) {
            const index = this.beatmap.index;
            const _highestSameModIndex = this.highestSameModIndex;
            if (index < _highestSameModIndex) {
                if (autoUpdate) await this.delete();
                this.beatmap.index = -1;

                this.sameMods
                    .filter(
                        map =>
                            map.index <= _highestSameModIndex &&
                            map.index > index
                    )
                    .map(async map => {
                        if (autoUpdate) await this.delete(map);
                        map.index -= 1;
                        if (autoUpdate) await this.upload(map);
                    });
                this.beatmap.index = _highestSameModIndex;
                this.upload();
            } else {
                return;
            }
        },
        moveToOtherBracket: async function(
            stage,
            mod,
            autoUpdate = this.autoUpdate || true
        ) {
            if (
                this.beatmap.stage == stage &&
                modHelper.toEnum(this.beatmap.mod) == modHelper.toEnum(mod)
            ) {
                return;
            }
            if (autoUpdate) this.delete();
            this.moveToEnd(false);
            this.beatmap.stage = stage;
            this.beatmap.mod = mod;
            this.beatmap.index = this.getNewIndexInStageMod(stage, mod);
            //dest[destLength + 1] = this.beatmap;

            if (autoUpdate) this.upload();
        },

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

        onPopUpEvent: function(on) {
            if (on) {
                clearTimeout(this.onPopUpDelay);
                this.onPopUp = true;
            } else {
                //this.onPopUpDelay = setTimeout(() => this.onPopUp = false, 300)
                this.onPopUp = false;
            }
        },
        getNewIndexInStageMod: function(stage, mod) {
            let index = this.getStageModHighestIndex(stage, mod);
            console.info(`got new index for map:`, this.strMapName, index);
            return index + 1;
        },
        getStageModHighestIndex(stage, mod) {
            const dest = this.splitted[stage]
                ? this.splitted[stage][modHelper.toEnum(mod)]
                : undefined;
            const highest = dest ? Math.max(...dest.map(map => map.index)) : 0;
            return highest;
        },
        editReturnMap: function(beatmap) {
            this.delete();
            const modChanged = beatmap.modChanged;
            delete beatmap.modChanged;

            this.beatmap = Object.assign(this.beatmap, beatmap);
            if (modChanged) {
                this.index = this.getNewIndexInStageMod(
                    beatmap.stage,
                    beatmap.mod
                );
            }
            this.beatmap.banchoResult();

            this.upload();
        },
        delete: function(map = this.beatmap) {
            console.warn("delete map:", {
                id: map.id,
                stage: map.stage,
                mod: map.mod,
                index: map.index
            });
        },
        upload: function(map = this.beatmap) {
            console.warn("upload map:", {
                id: map.id,
                stage: map.stage,
                mod: map.mod,
                index: map.index
            });
        },
        resort: function() {
            for (let mods in this.sameStage) {
                mods = Object.entries(mods).reduce((acc, map) => {
                    acc[map.index] = map;
                    return acc;
                });
            }
        },
        variant: function(modifier) {
            const choice = ["primary", "success"];
            const length = choice.length;
            const leftOver = modifier % length;
            return choice[leftOver];
        }
    }
};
</script>