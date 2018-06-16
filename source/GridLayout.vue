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
import { getLayoutItem, moveElement, LayoutItem, Layout } from "./utils";
import GridItemComponent from "./GridItem.vue";

@Component({
    components: {
        "GridItem": GridItemComponent
    }
})
export default class GridLayoutComponent extends Vue {

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
    @Prop({ default: [] }) layoutReference! : LayoutItem[];
    public layout : LayoutItem[] = this.layoutReference;
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
        this.compact();
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
        let max : number = 0;
        let bottomY : number;
        for (let i : number = 0, len : number = this.layout.length; i < len; i++) {
            bottomY = this.layout[i].y + this.layout[i].h;
            if (bottomY > max) max = bottomY;
        }
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
        this.compact();
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
        this.compact();
    }

    /**
    * Given a layout, compact it. This involves going down each y coordinate and removing gaps
    * between items.
    */
    private compact () : void {
        // Statics go in the compareWith array right away so items flow around them.
        const compareWith : LayoutItem[] = this.layout.filter((l : LayoutItem) => l.static);
        for (let i : number = 0; i < this.layout.length; i++) {
            if (!this.layout[i].static) {
                // I think this does not update, because the same object reference is returned.
                this.layout[i] = this.compactItem(compareWith, this.layout[i]);
                compareWith.push(this.layout[i]);
            }
            this.layout[i].moved = false; // Clear moved flag, if it exists.
        }
        this.$children.forEach((child) => child.$emit("compact")); // TODO: Get the list to update in a more Vue-like way.
    }

    // NOTE: Used in only 1 place
    private compactItem (compareWith : Layout, l : LayoutItem) : LayoutItem {
        if (this.verticalCompact)
            // Move the element up as far as it can go without colliding.
            while (l.y > 0 && !this.getFirstCollision(compareWith, l)) l.y--;

        // Move it down, and keep moving it down if it's colliding.
        let collides;
        while((collides = this.getFirstCollision(compareWith, l)))
            l.y = collides.y + collides.h;

        return l;
    }

    /**
     * Returns the first item this layout collides with.
     * It doesn't appear to matter which order we approach this from, although
     * perhaps that is the wrong thing to do.
     *
     * @param  {Object} layoutItem Layout item.
     * @return {Object|undefined}  A colliding layout item, or undefined.
     */
    private getFirstCollision (layout : Layout, layoutItem : LayoutItem) : LayoutItem | null {
        for (let i : number = 0; i < layout.length; i++)
            if (this.collides(layout[i], layoutItem)) return layout[i];
        return null;
    }

    /**
     * Given two layoutitems, check if they collide.
     *
     * @return {Boolean}   True if colliding.
     */
    private collides (l1 : LayoutItem, l2 : LayoutItem) : boolean {
        if (l1 === l2) return false; // same element
        if (l1.x + l1.w <= l2.x) return false; // l1 is left of l2
        if (l1.x >= l2.x + l2.w) return false; // l1 is right of l2
        if (l1.y + l1.h <= l2.y) return false; // l1 is above l2
        if (l1.y >= l2.y + l2.h) return false; // l1 is below l2
        return true; // boxes overlap
    }

}
</script>

<style>
    .vue-grid-layout {
        position: relative;
        transition: height 200ms ease;
    }
</style>