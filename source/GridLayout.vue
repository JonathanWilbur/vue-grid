<template>
    <div ref="item" class="vue-grid-layout" :style="mergedStyle">
        <slot></slot>
        <grid-item class="vue-grid-placeholder"
            v-show="isDragging || isResizing"
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
import { bottom, getLayoutItem, compact, moveElement, LayoutItem } from "./utils";
import GridItemComponent from "./GridItem.vue";

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

    @Prop({ default: true }) isDraggable! : boolean; // This is literally not even used.
    @Prop({ default: false }) isResizable! : boolean; // Neither is this.
    @Prop({ default: false }) isMirrored! : boolean; // Or this.
    @Prop({ default: true }) useCssTransforms! : boolean; // Or this.
    @Prop({ default: true }) verticalCompact! : boolean; // REVIEW: What does this even do?
    @Prop({ default: [] }) layout! : LayoutItem[];

    public width : number = Infinity;
    public mergedStyle : object = {};
    public lastLayoutLength : number = 0;
    public isDragging : boolean = false;
    public isResizing : boolean = false;
    public placeholder = {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        i: ""
    };

    public $refs!: {
        item : HTMLElement;
    }

    public created () : void {
        this.eventBus.$on('resizeEvent', this.resizeEvent);
        this.eventBus.$on('dragEvent', this.dragEvent);
    }

    // public beforeDestroy () : void {
    //     this.eventBus.$off('resizeEvent', this.resizeEvent);
    //     this.eventBus.$off('dragEvent', this.dragEvent);
    //     window.removeEventListener("resize", this.onWindowResize);
    // }

    public mounted () : void {
        if (this.width === Infinity) {
            this.onWindowResize();
            window.addEventListener('resize', this.onWindowResize);
        }
        compact(this.layout, this.verticalCompact);
        this.mergedStyle = { height: (this.height.toString() + "px") };
        this.$refs.item.addEventListener("onresize", this.onWindowResize);
    }

    @Watch("width")
    public onWidthChange () : void {
        this.eventBus.$emit("updateWidth", this.width);
        this.mergedStyle = { height: (this.height.toString() + "px") };
    }

    @Watch("layout")
    public layoutUpdate () : void {
        if (this.layout.length !== this.lastLayoutLength)
            this.lastLayoutLength = this.layout.length;
        compact(this.layout, this.verticalCompact);
        this.eventBus.$emit("updateWidth", this.width);
        this.mergedStyle = { height: (this.height.toString() + "px") };
    }

    public onWindowResize () : void {
        if (this.$refs !== null && this.$refs.item !== null && this.$refs.item !== undefined)
            this.width = this.$refs.item.offsetWidth;
    }

    get height () : number {
        if (!this.autoSize) return 0; // REVIEW
        return ((bottom(this.layout) * (this.rowHeight + this.margin[1])) + this.margin[1]);
    }

    public dragEvent (eventName : string, id : string, x : number, y : number, h : number, w : number) : void {
        if (eventName === "dragmove" || eventName === "dragstart") {
            this.placeholder.i = id;
            this.placeholder.x = x;
            this.placeholder.y = y;
            this.placeholder.w = w;
            this.placeholder.h = h;
            this.isDragging = true;
            this.eventBus.$emit("updateWidth", this.$el.clientWidth); // REVIEW: Why?
        } else
            this.isDragging = false;

        // TODO: Change layout to be a dictionary
        let l : LayoutItem = getLayoutItem(this.layout, id);
        l.x = x;
        l.y = y;

        // Move the element to the dragged location.
        this.layout = moveElement(this.layout, l, x, y, true);
        compact(this.layout, this.verticalCompact);
        // FIXME: Fix this ignoramus' issue:
        // needed because vue can't detect changes on array element properties
        this.eventBus.$emit("compact");
        this.mergedStyle = { height: (this.height.toString() + "px") };
        if (eventName === 'dragend') this.$emit('layout-updated', this.layout);
    }

    public resizeEvent (eventName : string, id : string, x : number, y : number, h : number, w : number) : void {
        if (eventName === "resizestart" || eventName === "resizemove") {
            this.placeholder.i = id;
            this.placeholder.x = x;
            this.placeholder.y = y;
            this.placeholder.w = w;
            this.placeholder.h = h;
            this.isResizing = true;
            this.eventBus.$emit("updateWidth", this.width);
        } else
            this.isResizing = false;
        let l = getLayoutItem(this.layout, id);
        l.h = h;
        l.w = w;
        compact(this.layout, this.verticalCompact);
        this.eventBus.$emit("compact");
        this.mergedStyle = { height: (this.height.toString() + "px") };
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