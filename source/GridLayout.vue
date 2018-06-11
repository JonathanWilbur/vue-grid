<template>
    <div ref="item" class="vue-grid-layout" :style="mergedStyle">
        <slot></slot>
        <grid-item class="vue-grid-placeholder"
            v-show="isDragging"
            :x="placeholder.x"
            :y="placeholder.y"
            :w="placeholder.w"
            :h="placeholder.h"
            :i="placeholder.i">
        </grid-item>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch, Provide } from "vue-property-decorator";
import { bottom, compact, getLayoutItem, moveElement, LayoutItem, LayoutItemRequired } from "./utils"; // Rem
import GridItemComponent from "./GridItem.vue";

// REVIEW: These libraries will never support TypeScript.
// import elementResizeDetectorMaker from "element-resize-detector";
// import "element-resize-detector" as elementResizeDetectorMaker;

@Component({
    components: {
        "GridItem": GridItemComponent
    }
})
export default class GridLayoutComponent extends Vue {

    @Provide("eventBus") eventBus : Vue = new Vue();

    public autoSize : boolean = true;
    @Prop({ default: 12 }) colNum! : number;

    @Prop({ default: 0 }) rowHeight! : number;
    @Prop({ default: Infinity }) maxRows! : number;
    @Prop({ default: [ 10, 10 ]}) margin! : [number, number];

    @Prop({ default: true }) isDraggable! : boolean;
    @Prop({ default: false }) isResizable! : boolean;
    @Prop({ default: false }) isMirrored! : boolean;
    @Prop({ default: true }) useCssTransforms! : boolean;
    @Prop({ default: true }) verticalCompact! : boolean;
    @Prop({ default: [] }) layout! : LayoutItem[];

    public width : number = 0;
    public mergedStyle : object = {};
    public lastLayoutLength : number = 0;
    public isDragging : boolean = false;
    public placeholder : LayoutItemRequired = {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        i: ""
    };

    public $refs!: {
        item : HTMLElement
    }

    public resizeEventHandler (eventType : string, i : string, x : number, y : number, h : number, w : number) : void {
        this.resizeEvent(eventType, i, x, y, h, w);
    }

    public dragEventHandler (eventType : string, i : string, x : number, y : number, h : number, w : number) : void {
        this.dragEvent(eventType, i, x, y, h, w);
    }

    public created () : void {
        // this._provided.eventBus = new Vue();
        // this.eventBus = this._provided.eventBus;
        this.eventBus.$on('resizeEvent', this.resizeEventHandler);
        this.eventBus.$on('dragEvent', this.dragEventHandler);
    }

    public beforeDestroy () : void {
        this.eventBus.$off('resizeEvent', this.resizeEventHandler);
        this.eventBus.$off('dragEvent', this.dragEventHandler);
        window.removeEventListener("resize", this.onWindowResize);
    }

    public mounted () : void {
        let self = this;

        /* REVIEW:
         * Come to think of it: are all of these $nextTick calls here as a
         * shitty workaround to a potential race condition?
        */
        this.$nextTick(function () {
            // validateLayout(this.layout); // TODO: Replace this.

            this.$nextTick(function() {
                if (self.width === null) {
                    self.onWindowResize();
                    window.addEventListener('resize', self.onWindowResize);
                }
                compact(self.layout, self.verticalCompact);

                self.updateHeight();
                self.$nextTick(function () {
                    // let erd = elementResizeDetectorMaker({ strategy: "scroll" });
                    // erd.listenTo(self.$refs.item, function () {
                    //     self.onWindowResize();
                    // });
                    self.$refs.item.addEventListener("onresize", function () {
                        self.onWindowResize();
                    });
                });
            });

            window.onload = function() {
                if (self.width === null) {
                    self.onWindowResize();
                    //self.width = self.$el.offsetWidth;
                    window.addEventListener('resize', self.onWindowResize);
                }
                compact(self.layout, self.verticalCompact);

                self.updateHeight();
                self.$nextTick(function () {
                    // let erd = elementResizeDetectorMaker({ strategy: "scroll" });
                    // erd.listenTo(self.$refs.item, function () {
                    //     self.onWindowResize();
                    // });
                    self.$refs.item.addEventListener("onresize", function () {
                        self.onWindowResize();
                    });
                });
            };
        });
    }

    @Watch("width")
    public onWidthChange () : void {
        this.$nextTick(function () {
            this.eventBus.$emit("updateWidth", this.width);
            this.updateHeight();
        });
    }

    @Watch("layout")
    public onLayoutChange () : void {
        this.layoutUpdate();
    }

    @Watch("colNum")
    public onColNumChange (val : number) : void {
        this.eventBus.$emit("setColNum", val);
    }

    @Watch("rowHeight")
    public onRowHeightChange () : void {
        this.eventBus.$emit("setRowHeight", this.rowHeight);
    }

    @Watch("isDraggable")
    public onIsDraggableChange () : void {
        this.eventBus.$emit("setDraggable", this.isDraggable);
    }

    @Watch("isResizable")
    public onIsResizableChange () : void {
        this.eventBus.$emit("setResizable", this.isResizable);
    }

    public layoutUpdate () : void {
        if (this.layout !== undefined) {
            if (this.layout.length !== this.lastLayoutLength) {
                //console.log("### LAYOUT UPDATE!");
                this.lastLayoutLength = this.layout.length;
            }
            compact(this.layout, this.verticalCompact);
            this.eventBus.$emit("updateWidth", this.width);
            this.updateHeight();
        }
    }

    public updateHeight () : void {
        this.mergedStyle = {
            height: this.containerHeight()
        };
    }

    public onWindowResize () : void {
        if (this.$refs !== null && this.$refs.item !== null && this.$refs.item !== undefined) {
            this.width = this.$refs.item.offsetWidth;
        }
    }

    public containerHeight () : string {
        if (!this.autoSize) return "0px"; // REVIEW
        return bottom(this.layout) * (this.rowHeight + this.margin[1]) + this.margin[1] + 'px';
    }

    public dragEvent (eventName : string, id : string, x : number, y : number, h : number, w : number) : void {
        if (eventName === "dragmove" || eventName === "dragstart") {
            this.placeholder.i = id;
            this.placeholder.x = x;
            this.placeholder.y = y;
            this.placeholder.w = w;
            this.placeholder.h = h;
            this.$nextTick(function() {
                this.isDragging = true;
            });
            this.eventBus.$emit("updateWidth", this.$el.clientWidth); // REVIEW: Why?
        } else {
            this.$nextTick(function() {
                this.isDragging = false;
            });
        }

        let l : LayoutItem = getLayoutItem(this.layout, id);
        l.x = x;
        l.y = y;

        // Move the element to the dragged location.
        this.layout = moveElement(this.layout, l, x, y, true);
        compact(this.layout, this.verticalCompact);
        // needed because vue can't detect changes on array element properties
        this.eventBus.$emit("compact");
        this.updateHeight();
        if (eventName === 'dragend') this.$emit('layout-updated', this.layout);
    }

    public resizeEvent (eventName : string, id : string, x : number, y : number, h : number, w : number) : void {
        if (eventName === "resizestart" || eventName === "resizemove") {
            this.placeholder.i = id;
            this.placeholder.x = x;
            this.placeholder.y = y;
            this.placeholder.w = w;
            this.placeholder.h = h;
            this.$nextTick(function() {
                this.isDragging = true;
            });
            //this.$broadcast("updateWidth", this.width);
            this.eventBus.$emit("updateWidth", this.width);

        } else {
            this.$nextTick(function() {
                this.isDragging = false;
            });
        }
        let l = getLayoutItem(this.layout, id);
        l.h = h;
        l.w = w;
        compact(this.layout, this.verticalCompact);
        this.eventBus.$emit("compact");
        this.updateHeight();
        if (eventName === 'resizeend') this.$emit('layout-updated', this.layout);
    }

}
</script>

<style>
    .vue-grid-layout {
        position: relative;
        transition: height 200ms ease;
    }
</style>