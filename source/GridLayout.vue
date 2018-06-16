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
            :i="placeholder.i"
            :use-css-transforms="useCssTransforms"
            :margin="margin"
            :max-rows="maxRows"
            :placeholder="true"
            v-on:dragEvent="dragEvent"
            v-on:resizeEvent="resizeEvent">
            <!-- REVIEW THIS ^ -->
        </grid-item>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { getLayoutItem, LayoutItem, Layout } from "./utils";
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
            this.placeholder = { i: id, x: x, y: y, w: w, h: h };
            this.isDragging = true;
        } else
            this.isDragging = false;

        // TODO: Change layout to be a dictionary
        let l : LayoutItem = getLayoutItem(this.layout, id);
        // l.x = x;
        // l.y = y;
        Vue.set(l, "x", x);
        Vue.set(l, "y", y);
        // this.layout = moveElement(this.layout, l, x, y, true);
        // Vue.set(this, "layout", moveElement(this.layout, l, x, y, true))
        this.moveElement(l, x, y, true);
        this.compact();
    }

    public resizeEvent (eventName : string, id : string, x : number, y : number, h : number, w : number) : void {
        if (eventName === "resizestart" || eventName === "resizemove") {
            this.placeholder = { i: id, x: x, y: y, w: w, h: h };
            this.isResizing = true;
        } else
            this.isResizing = false;
        let l = getLayoutItem(this.layout, id);
        // l.h = h;
        // l.w = w;
        Vue.set(l, "h", h);
        Vue.set(l, "w", w);
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

    /**
     * Move an element. Responsible for doing cascading movements of other elements.
     *
     * @param  {Array}      layout Full layout to modify.
     * @param  {LayoutItem} l      element to move.
     * @param  {number}     [x]    X position in grid units.
     * @param  {number}     [y]    Y position in grid units.
     * @param  {boolean}    [isUserAction] If true, designates that the item we're moving is
     *                                     being dragged/resized by th euser.
     */
    private moveElement (l : LayoutItem, x? : number, y? : number, isUserAction? : boolean) : void {
        if (l.static) return;
        if (l.y === y && l.x === x) return;

        const movingUp = (y && (l.y > y)); // REVIEW: Do you need the first condition?

        // This is quite a bit faster than extending the object
        if (typeof l.x === 'undefined') l.x = x || 0; // REVIEW
        if (typeof l.y === 'undefined') l.y = y || 0; // REVIEW
        l.moved = true;

        // If this collides with anything, move it.
        // When doing this comparison, we have to sort the items we compare with
        // to ensure, in the case of multiple collisions, that we're getting the
        // nearest collision.
        // let sorted = sortLayoutItemsByRowCol(layout);
        let sorted = this.layout;
        if (movingUp) sorted = sorted.reverse();
        const collisions = this.getAllCollisions(sorted, l);

        // Move each item that collides away from this element.
        for (let i = 0, len = collisions.length; i < len; i++) {
            const collision = collisions[i];
            if (collision.moved) continue; // So we can't infinite loop
            // This makes it feel a bit more precise by waiting to swap for just a bit when moving up.
            if (l.y > collision.y && l.y - collision.y > collision.h / 4) continue;
            // Don't move static items - we have to move *this* element away
            if (collision.static) {
                this.moveElementAwayFromCollision(collision, l, isUserAction);
            } else {
                this.moveElementAwayFromCollision(l, collision, isUserAction);
            }
        }
    }

    private getAllCollisions (layout : Layout, layoutItem : LayoutItem) : Array<LayoutItem> {
        return layout.filter((l) => this.collides(l, layoutItem));
    }

    /**
     * This is where the magic needs to happen - given a collision, move an element away from the collision.
     * We attempt to move it up if there's room, otherwise it goes below.
     *
     * @param  {Array} layout            Full layout to modify.
     * @param  {LayoutItem} collidesWith Layout item we're colliding with.
     * @param  {LayoutItem} itemToMove   Layout item we're moving.
     * @param  {Boolean} [isUserAction]  If true, designates that the item we're moving is being dragged/resized
     *                                   by the user.
     */
    private moveElementAwayFromCollision (collidesWith : LayoutItem, itemToMove : LayoutItem, isUserAction? : boolean) : void {

        // If there is enough space above the collision to put this element, move it there.
        // We only do this on the main collision as this can get funky in cascades and cause
        // unwanted swapping behavior.
        if (isUserAction) {
            // Make a mock item so we don't modify the item here, only modify in moveElement.
            const fakeItem: LayoutItem = {
                x: itemToMove.x,
                y: itemToMove.y,
                w: itemToMove.w,
                h: itemToMove.h,
                i: '-1'
            };

            fakeItem.y = Math.max(collidesWith.y - itemToMove.h, 0);

            if (!this.getFirstCollision(this.layout, fakeItem))
                this.moveElement(itemToMove, undefined, fakeItem.y);
        }

        // Previously this was optimized to move below the collision directly, but this can cause problems
        // with cascading moves, as an item may actually leapflog a collision and cause a reversal in order.
        this.moveElement(itemToMove, undefined, itemToMove.y + 1);
    }

}
</script>

<style>
    .vue-grid-layout {
        position: relative;
        transition: height 200ms ease;
    }
    .vue-grid-placeholder {
        background: red;
        opacity: 0.2;
        transition-duration: 100ms;
        z-index: 200;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        -o-user-select: none;
        user-select: none;
    }
</style>