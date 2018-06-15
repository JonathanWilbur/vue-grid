<template>
    <div class="vue-grid-layout" :style="style">
        <grid-item v-for="item in layout"
            :cols="12"
            :x="item.x"
            :y="item.y"
            :w="item.w"
            :h="item.h"
            :i="item.i"
            :key="item.i"
            :is-draggable="true"
            :is-resizable="true"
            :right-to-left="false"
            v-on:dragEvent="dragEvent"
            v-on:resizeEvent="resizeEvent">
            <span class="text">{{item.i}}</span>
            <slot></slot>
        </grid-item>
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
import { Vue, Component, Prop, Provide } from "vue-property-decorator";
import { getLayoutItem, compact, moveElement, LayoutItem } from "./utils";
import GridItemComponent from "./GridItem.vue";

@Component({
    components: {
        "GridItem": GridItemComponent
    }
})
export default class GridLayoutComponent extends Vue {

    @Provide("eventBus") eventBus : Vue = new Vue();
    @Prop({ default: true }) autoSize! : boolean;
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
    public isDragging : boolean = false;
    public isResizing : boolean = false;
    public placeholder = {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        i: ""
    };

    // TODO: Get rid of this.
    public mounted () : void {
        compact(this.layout, this.verticalCompact);
    }

    get style () : object {
        return {
            height: (this.height.toString() + "px")
        };
    }

    get width () : number {
        return this.$el.offsetWidth;
    }

    get height () : number {
        if (!this.autoSize) return 0; // REVIEW
        // public bottom (layout : Layout) : number {
        let max : number = 0;
        let bottomY : number;
        for (let i : number = 0, len : number = this.layout.length; i < len; i++) {
            bottomY = this.layout[i].y + this.layout[i].h;
            if (bottomY > max) max = bottomY;
        }
        // }
        return ((max * (this.rowHeight + this.margin[1])) + this.margin[1]);
    }

    public dragEvent (eventName : string, id : string, x : number, y : number, h : number, w : number) : void {
        if (eventName === "dragmove" || eventName === "dragstart") {
            this.placeholder.i = id;
            this.placeholder.x = x;
            this.placeholder.y = y;
            this.placeholder.w = w;
            this.placeholder.h = h;
            this.isDragging = true;
        } else
            this.isDragging = false;

        // TODO: Change layout to be a dictionary
        let l : LayoutItem = getLayoutItem(this.layout, id);
        l.x = x;
        l.y = y;
        this.layout = moveElement(this.layout, l, x, y, true);
        compact(this.layout, this.verticalCompact);
        // FIXME: Fix this ignoramus' issue:
        // needed because vue can't detect changes on array element properties
        this.eventBus.$emit("compact");
    }

    public resizeEvent (eventName : string, id : string, x : number, y : number, h : number, w : number) : void {
        if (eventName === "resizestart" || eventName === "resizemove") {
            this.placeholder.i = id;
            this.placeholder.x = x;
            this.placeholder.y = y;
            this.placeholder.w = w;
            this.placeholder.h = h;
            this.isResizing = true;
        } else
            this.isResizing = false;
        let l = getLayoutItem(this.layout, id);
        l.h = h;
        l.w = w;
        compact(this.layout, this.verticalCompact);
        this.eventBus.$emit("compact"); // REVIEW: Is this actually necessary?
    }

}
</script>

<style>
    .vue-grid-layout {
        position: relative;
        transition: height 200ms ease;
    }
</style>