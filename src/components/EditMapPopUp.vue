<template>
    <span>
        <span>
            <!-- Our triggering (target) element -->
            <b-button :id="`edit-${editIndex}`" variant="primary" ref="button">
                <slot name="buttonContent">click</slot>
            </b-button>
        </span>
        <!-- Output from the popover interaction -->
        <!--         <b-card title="Returned values:" v-if="bidReturn && modReturn">
            <p class="card-text" style="max-width: 20rem;">
                Name: <strong>{{ bidReturn }}</strong><br>
                Color: <strong>{{ modReturn }}</strong>
            </p>
        </b-card>-->
        <!-- Our popover title and content render container -->
        <!-- We use placement 'auto' so popover fits in the best spot on viewport -->
        <!-- We specify the same container as the trigger button, so that popover is close to button -->
        <b-popover
            :target="`edit-${editIndex}`"
            triggers="click"
            :show.sync="popoverShow"
            placement="auto"
            container="my-container"
            ref="popover"
            @show="onShow"
            @shown="onShown"
            @hidden="onHidden"
        >
            <template v-slot:title>
                <b-button @click="onClose" class="close" aria-label="Close">
                    <span class="d-inline-block" aria-hidden="true">&times;</span>
                </b-button>
                <slot name="title">title</slot>
            </template>
            <div>
                <b-form-group
                    label="bid"
                    :label-for="`edit-${editIndex}-bid`"
                    label-cols="3"
                    :state="bidstate"
                    class="mb-1"
                    description="Beatmap Id"
                    invalid-feedback="This field is required"
                >
                    <b-form-input
                        ref="bid"
                        :id="`edit-${editIndex}-bid`"
                        v-model="bid"
                        :state="bidstate"
                        size="sm"
                    ></b-form-input>
                </b-form-group>
                <b-form-group
                    label="Stage"
                    :label-for="`edit-${editIndex}-stage`"
                    label-cols="3"
                    :state="stagestate"
                    class="mb-1"
                    description="stage"
                    invalid-feedback="This field is required"
                >
                    <b-form-select
                        :id="`edit-${editIndex}-stage`"
                        v-model="stage"
                        :state="stagestate"
                        :options="existStages"
                        size="sm"
                    ></b-form-select>
                </b-form-group>
                <!-- <b-form-group label="Mod" :label-for="`edit-${editIndex}-mod`" label-cols="3" :state="modstate" class="mb-1" description="mod" invalid-feedback="This field is required">
                    <b-form-select :id="`edit-${editIndex}-mod`" v-model="mod" :state="modstate" size="sm" multiple :options="existMods"></b-form-select>
                </b-form-group>-->
                <b-form-group
                    label="Mod"
                    :label-for="`edit-${editIndex}-mod`"
                    label-cols="3"
                    :state="modstate"
                    class="mb-1"
                    description="mod"
                    invalid-feedback="This field is required"
                >
                    <b-form-checkbox-group
                        :id="`edit-${editIndex}-mod`"
                        v-model="mod"
                        :state="modstate"
                        :options="existMods"
                    ></b-form-checkbox-group>
                </b-form-group>
                <b-form-group
                    label="Index"
                    :label-for="`edit-${editIndex}-index`"
                    label-cols="3"
                    :state="indexstate"
                    class="mb-1"
                    description="NM<1>⬅️this!"
                    invalid-feedback="This' not right"
                >
                    <b-form-input
                        type="number"
                        :disabled="disableIndex"
                        ref="index"
                        :id="`edit-${editIndex}-index`"
                        v-model="index"
                        :state="indexstate"
                        size="sm"
                    ></b-form-input>
                </b-form-group>
                <b-form-group
                    label="Selector"
                    :label-for="`edit-${editIndex}-selector`"
                    label-cols="3"
                    :state="selectorstate"
                    class="mb-1"
                    description="Who picked this map?"
                    invalid-feedback="This field is required"
                >
                    <b-form-input
                        ref="selector"
                        :id="`edit-${editIndex}-selector`"
                        v-model="selector"
                        :state="selectorstate"
                        size="sm"
                    ></b-form-input>
                </b-form-group>
                <b-alert show class="small">
                    <strong>Beatmap Preview:</strong>
                    <br />Set:
                    <strong>{{ previewMap.artist }} - {{ previewMap.title }}</strong>
                    <br />Version:
                    <strong>{{ previewMap.version }}</strong>
                    <br />Status:
                    <strong>{{ previewMap.approvalStatus }}</strong>
                </b-alert>
                <b-button @click="onClose" size="sm" variant="danger" class="mr-1">Cancel</b-button>
                <b-button @click="onOk" :variant="variant" size="sm">
                    <slot :variant="confirmVariant" name="confirm">Ok</slot>
                </b-button>
            </div>
        </b-popover>
    </span>
</template>
<script>
const modHelper = require("../helpers/enum");
export default {
    name: "EditMap",
    data() {
        return {
            bidInputDelay: undefined,
            bid: "",
            bidstate: null,
            mod: [],
            modstate: null,
            stage: "",
            stagestate: null,
            index: 99999,
            indexstate: null,
            selector: "",
            selectorstate: null,
            popoverShow: false,
            previewMap: {
                atrist: "...",
                title: "...",
                version: "..."
            },
            createdMap: {},
            newStageSelectvalue: {
                text: "- New -",
                value: Symbol("newStage")
            },
            createdStage: []
        };
    },
    props: [
        "beatmap",
        "absoluteIndex",
        "mods",
        "stages",
        "confirmVariant",
        "api",
        "newMap",
        "presetMod"
    ],
    computed: {
        existStages: function() {
            return [
                { text: "- Choose 1 -", value: "" },
                ...this.stages,
                ...this.createdStage,
                this.newStageSelectvalue
            ];
        },
        existMods: function() {
            return ["NM", "HR", "DT", "HD", "TB"];
        },
        variant: function() {
            return this.confirmVariant || `primary`;
        },
        editIndex: function() {
            return (
                (this.absoluteIndex || 0) + Math.floor(Math.random() * 10000)
            );
        },
        modChanged: function() {
            if (!this.beatmap) return true;
            else
                return (
                    modHelper.toEnum(this.mods) !==
                    modHelper.toEnum(this.beatmap.mods)
                );
        },
        disableIndex: function() {
            return this.modsChanged || this.newMap;
        }
    },
    watch: {
        bid(val) {
            if (val) {
                this.bidstate = true;
                if (this.bidInputDelay) {
                    clearTimeout(this.bidInputDelay);
                }
                setTimeout(async () => {
                    this.previewMap = await this.api.apiGetMap({ id: val });
                }, 500);
            }
        },
        mod(val) {
            if (val) {
                // console.log(val)
                this.modstate = true;
                if (this.newMap) {
                    return true;
                } else if (!this.enableIndexInput && this.modsChanged) {
                    this.index = 114514;
                } else {
                    this.index = this.beatmap.index;
                }
                // if (!this.existMods.find(mods => {
                //         modHelper.toEnum([mods]) == modHelper.toEnum(val)
                //     })) {
                //     console.log('creating new mods', val);
                // }
            }
        },
        index(val) {
            if (val) {
                this.indexstate = true;
            }
        },
        stage(val) {
            if (val == this.newStageSelectvalue.value) {
                const stage = prompt("Enter title of your new stage:", "gf");
                this.stagestate = true;
                this.createdStage.push(stage);
                this.stage = stage;
            }
            if (val) {
                this.stagestate = true;
            }
        },
        selector(val) {
            if (val) {
                this.selectorstate = true;
            }
        }
    },
    methods: {
        onClose() {
            this.popoverShow = false;
            clearTimeout(this.bidInputDelay);
        },
        onOk() {
            if (!this.bid) {
                this.bidstate = false;
            }
            if (!this.mods) {
                this.modstate = false;
            }
            if (!this.stage) {
                this.stagestate = false;
            }
            if (!this.index && !this.newMap) {
                this.indexstate = false;
            }
            if (!this.selector) {
                this.selector = false;
            }
            if (
                this.bid &&
                this.mod &&
                this.stage &&
                this.index &&
                this.selector
            ) {
                this.onClose();
                // Return our popover form results
                // this.bidReturn = this.bid;
                // this.selectorReturn = this.selector;
                // const apiMap = await this.api.apiGetMap({ id: this.bid, m: this.beatmap.mods });
                this.$emit("edit-return", {
                    id: this.bid,
                    stage: this.stage,
                    mods: this.mod,
                    index: parseInt(this.index),
                    selector: this.selector,
                    modChanged: this.modsChanged
                });
            }
        },
        onShow() {
            // This is called just before the popover is shown
            // Reset our popover form variables
            this.bid = !this.newMap ? this.beatmap.id : "";
            this.mod = !this.newMap ? this.beatmap.mods : this.presetMod;
            this.stage = !this.newMap ? this.beatmap.stage : "";
            this.index = !this.newMap ? this.beatmap.index : 99999;
            this.selector = !this.newMap
                ? this.beatmap.selector
                : this.api.user.id || -1;
            this.bidstate = null;
            this.modstate = null;
            this.stagestate = null;
            this.indexstate = null;
            this.selectorstate = null;
            // this.bidReturn = ''
            // this.modsReturn = ''
            // this.selectorReturn = ''
            this.$emit("popup-visible");
        },
        onShown() {
            // Called just after the popover has been shown
            // Transfer focus to the first input
            this.focusRef(this.$refs.bid);
        },
        onHidden() {
            // Called just after the popover has finished hiding
            // Bring focus back to the button
            this.focusRef(this.$refs.button);
            this.$emit("popup-hidden");
        },
        focusRef(ref) {
            // Some references may be a component, functional component, or plain element
            // This handles that check before focusing, assuming a `focus()` method exists
            // We do this in a double `$nextTick()` to ensure components have
            // updated & popover positioned first
            this.$nextTick(() => {
                this.$nextTick(() => {
                    (ref.$el || ref).focus();
                });
            });
        }
    }
};
</script>