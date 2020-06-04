<template>
    <span>
        <span>
            <!-- Our triggering (target) element -->
            <b-button :id="`bulk-${bulkIndex}`" variant="primary" ref="button">
                <slot name="buttonContent">click</slot>
            </b-button>
        </span>
        <!-- Output from the popover interaction -->
        <!--         <b-card title="Returned values:" v-if="textareaReturn && modReturn">
            <p class="card-text" style="max-width: 20rem;">
                Name: <strong>{{ textareaReturn }}</strong><br>
                Color: <strong>{{ modReturn }}</strong>
            </p>
        </b-card>-->
        <!-- Our popover title and content render container -->
        <!-- We use placement 'auto' so popover fits in the best spot on viewport -->
        <!-- We specify the same container as the trigger button, so that popover is close to button -->
        <b-popover
            :target="`bulk-${bulkIndex}`"
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
                    label="Stream"
                    :label-for="`bulk-${bulkIndex}-textarea`"
                    label-cols="3"
                    :state="textareastate"
                    class="mb-1"
                    description="MapPool stream data"
                    invalid-feedback="This field is required"
                >
                    <b-form-textarea
                        ref="textarea"
                        :id="`bulk-${bulkIndex}-textarea`"
                        v-model="textarea"
                        :state="textareastate"
                        size="sm"
                        rows="30"
                    ></b-form-textarea>
                </b-form-group>
                <b-alert show class="small">
                    <strong>Bulk read status:</strong>
                    <br />success:
                    <strong>{{textareastate}}</strong>
                    <br />read:
                    <strong>{{this.list.length}}</strong>
                    maps
                </b-alert>
                <b-button @click="onClose" size="sm" variant="danger" class="mr-1">Cancel</b-button>
                <b-button @click="onOk" :variant="confirmVariant" size="sm">
                    <slot :variant="confirmVariant" name="confirm">Ok</slot>
                </b-button>
            </div>
        </b-popover>
    </span>
</template>
<script>
const Reader = require("../helpers/bulkReader");

export default {
    name: "BulkUpload",
    data() {
        return {
            textareaInputDelay: undefined,
            textarea: "",
            textareastate: null,
            popoverShow: false,
            list: [],
        };
    },
    props: [
        'confirmVariant'
    ],
    computed: {
        bulkIndex : function(){
            return Math.floor(Math.random() * 1000000)
        }
    },
    watch: {
        textarea(val) {
            if (val) {
                try{
                    const r = new Reader(val);
                    this.list = r.toList();
                    this.textareastate = true;
                } catch(e){
                    this.textareastate = false;
                    this.list = [];
                }
            }
        }
    },
    methods: {
        onClose() {
            this.popoverShow = false;
            clearTimeout(this.textareaInputDelay);
        },
        onOk() {
            if (!this.textarea) {
                this.textareastate = false;
            }
            if (this.textarea) {
                this.onClose();
                // Return our popover form results
                // this.textareaReturn = this.textarea;
                // this.selectorReturn = this.selector;
                // const apiMap = await this.api.apiGetMap({ id: this.textarea, m: this.beatmap.mods });
                this.$emit("bulk-return", this.list);
            }
        },
        onShow() {
            this.$emit("popup-visible");
        },
        onShown() {
            // Called just after the popover has been shown
            // Transfer focus to the first input
            this.focusRef(this.$refs.textarea);
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