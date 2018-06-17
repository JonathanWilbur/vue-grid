<template>
    <div
        class="vue-grid-item"
        :class="{ 'vue-resizable' : isResizable, 'resizing' : isResizing, 'vue-draggable-dragging' : isDragging, 'cssTransforms' : useCssTransforms, 'render-rtl' : rightToLeft, 'disable-userselect': isDragging }"
        :style="style">
        <slot></slot>
        <span v-if="isResizable" ref="handle" class="vue-resizable-handle"></span>
    </div>
</template>

<script lang="ts">
import { setTopLeft, setTopRight, setTransformRtl, setTransform } from './utils';
import { getControlPosition, createCoreData, CoreData } from './draggableUtils';
import { Vue, Component, Prop } from "vue-property-decorator";
import { Interactable, InteractEvent } from "interactjs"; // FIXME: Add DraggableOptions when v1.4.0 comes out.
import * as interact from "interactjs/index";

export
type Size = {
    width : number,
    height : number
};

export
type Position = {
    left? : number,
    right? : number,
    top : number,
    width? : number,
    height? : number
};

@Component({})
export default class GridItemComponent extends Vue {

    @Prop()                         public x! : number;
    @Prop()                         public y! : number;
    @Prop()                         public w! : number;
    @Prop()                         public h! : number;
    @Prop()                         public i! : string;
    @Prop({ default: 1 })           public minH! : number;
    @Prop({ default: 1 })           public minW! : number;
    @Prop({ default: Infinity })    public maxH! : number;
    @Prop({ default: Infinity })    public maxW! : number;
    @Prop({ default: false })       public isDraggable! : boolean;
    @Prop({ default: false })       public isResizable! : boolean;
    @Prop({ default: false })       public rightToLeft! : boolean;
    @Prop({ default: 30 })          public rowHeight! : number;
    @Prop()                         public columnWidth! : number; // This has to be calculated on the fly.
    @Prop({ default: 12 })          public cols! : number;
    @Prop({ default: false })       public placeholder! : boolean;
    @Prop({ default: Infinity })    public maxRows! : number;
    @Prop({ default: true })        public useCssTransforms! : boolean;
    @Prop({ default: 10 })          public horizontalMargin! : number;
    @Prop({ default: 10 })          public verticalMargin! : number;

    // REVIEW: These could be better data types.
    @Prop({ default: "a, button" }) public dragIgnoreFrom! : string;
    @Prop({ default: "" }) public dragAllowFrom! : string;
    @Prop({ default: "a, button" }) public resizeIgnoreFrom! : string;

    public isDragging : boolean = false;
    public dragging? : Position = undefined; // FIXME: Deceptive name
    public isResizing : boolean = false;
    public resizing? : Size = undefined; // FIXME: Deceptive name

    // TODO: Make these props, and rename them to "previous"
    public lastX : number = NaN;
    public lastY : number = NaN;
    public lastW : number = NaN;
    public lastH : number = NaN;

    public interactObj? : Interactable;

    /* REVIEW:
     * This really reeks of very bad code. All of these properties should be
     * set by the parent via props.
     */
    public mounted () : void {
        this.interactObj = interact(this.$el);

        if (this.isDraggable) {
            // FIXME: Uncomment when InteractJS 1.4.0 comes out.
            // let opts = {
            //     ignoreFrom: this.dragIgnoreFrom,
            //     allowFrom: this.dragAllowFrom
            // };
            let opts = {};
            this.interactObj.draggable(opts);
            this.interactObj.on('dragstart', this.handleDragStart);
            this.interactObj.on('dragmove', this.handleDragMove);
            this.interactObj.on('dragend', this.handleDragEnd);
        }

        if (this.isResizable) {
            // FIXME: Uncomment the settings below when InteractJS 1.4.0 comes out.
            this.interactObj.resizable({
                // preserveAspectRatio: false,
                edges: {
                    left: false,
                    right: ".vue-resizable-handle",
                    bottom: ".vue-resizable-handle",
                    top: false
                },
                // ignoreFrom: this.resizeIgnoreFrom
            });
            this.interactObj.on('resizestart', this.handleResizeStart);
            this.interactObj.on('resizemove', this.handleResizeMove);
            this.interactObj.on('resizeend', this.handleResizeEnd);
        }
    }

    get style () : object {
        let pos = this.position();
        // { // See the TODO above this.position.
        //     let pos2 = this.calcPosition(this.x, this.y, this.w, this.h);
        //     console.assert(pos.height === pos2.height,  "height:    l:" + pos.height + " r:" + pos2.height);
        //     console.assert(pos.left === pos2.left,      "left:      l:" + pos.left + " r:" + pos2.left);
        //     console.assert(pos.right === pos2.right,    "right:     l:" + pos.right + " r:" + pos2.right);
        //     console.assert(pos.top === pos2.top,        "top:       l:" + pos.top + " r:" + pos2.top);
        //     console.assert(pos.width === pos2.width,    "width:     l:" + pos.width + " r:" + pos2.width);
        // }

        if (this.isDragging && this.dragging) {
            pos.top = this.dragging.top;
            if (this.rightToLeft) {
                pos.right = this.dragging.left;
            } else {
                pos.left = this.dragging.left;
            }
        }

        if (this.isResizing && this.resizing) {
            pos.width = this.resizing.width;
            pos.height = this.resizing.height;
        }

        if (this.useCssTransforms) {
            if (this.rightToLeft) {
                return setTransformRtl(pos.top, (pos.right || 0), (pos.width || 0), (pos.height || 0));
            } else {
                return setTransform(pos.top, (pos.left || 0), (pos.width || 0), (pos.height || 0));
            }
        } else {
            if (this.rightToLeft) {
                return setTopRight(pos.top, (pos.right || 0), (pos.width || 0), (pos.height || 0));
            } else {
                return setTopLeft(pos.top, (pos.left || 0), (pos.width || 0), (pos.height || 0));
            }
        }
    }

    // @Emit("resize") See: https://github.com/kaorun343/vue-property-decorator/issues/103
    public handleResizeStart (event : InteractEvent) : void {
        this.isResizing = true;
        const { x, y } = getControlPosition(event);
        let newWidth : number = this.gridAlignedWidthInPixels;
        let newHeight : number = this.gridAlignedHeightInPixels;
        this.resizing = { width: newWidth, height: newHeight };
        let newPos = this.calcWH(newHeight, newWidth);

        // TODO: Move this to calcWH
        if (newPos.w < this.minW) newPos.w = this.minW;
        if (newPos.w > this.maxW) newPos.w = this.maxW;
        if (newPos.h < this.minH) newPos.h = this.minH;
        if (newPos.h > this.maxH) newPos.h = this.maxH;
        if (newPos.h < 1) newPos.h = 1;
        if (newPos.w < 1) newPos.w = 1;

        this.lastW = x;
        this.lastH = y;
        this.$emit("resizeEvent", event.type, this.i, this.x, this.y, newPos.h, newPos.w);
    }

    public handleResizeMove (event : InteractEvent) : void {
        if (!this.resizing) return;
        const { x, y } = getControlPosition(event);
        const newSize : Size = { width: 0, height: 0 };
        const coreEvent : CoreData = createCoreData(this.lastW, this.lastH, x, y);
        if (this.rightToLeft) newSize.width = (this.resizing.width - coreEvent.deltaX);
        else newSize.width = (this.resizing.width + coreEvent.deltaX);
        newSize.height = this.resizing.height + coreEvent.deltaY;
        this.resizing = newSize;
        let newPos = this.calcWH(newSize.height, newSize.width);
        if (newPos.w < this.minW) newPos.w = this.minW;
        if (newPos.w > this.maxW) newPos.w = this.maxW;
        if (newPos.h < this.minH) newPos.h = this.minH;
        if (newPos.h > this.maxH) newPos.h = this.maxH;
        if (newPos.h < 1) newPos.h = 1;
        if (newPos.w < 1) newPos.w = 1;
        this.lastW = x;
        this.lastH = y;
        this.$emit("resizeEvent", event.type, this.i, this.x, this.y, newPos.h, newPos.w);
    }

    public handleResizeEnd (event : InteractEvent) : void {
        this.isResizing = false;
        this.resizing = undefined;
        const { x, y } = getControlPosition(event);
        let newWidth : number = this.gridAlignedWidthInPixels;
        let newHeight : number = this.gridAlignedHeightInPixels;
        let newPos = this.calcWH(newHeight, newWidth);
        if (newPos.w < this.minW) newPos.w = this.minW;
        if (newPos.w > this.maxW) newPos.w = this.maxW;
        if (newPos.h < this.minH) newPos.h = this.minH;
        if (newPos.h > this.maxH) newPos.h = this.maxH;
        if (newPos.h < 1) newPos.h = 1;
        if (newPos.w < 1) newPos.w = 1;
        this.lastW = x;
        this.lastH = y;
        this.$emit("resizeEvent", event.type, this.i, this.x, this.y, newPos.h, newPos.w);
    }

    public handleDragStart (event : InteractEvent) : void {
        if (this.isResizing) return;
        this.isDragging = true;
        const {x, y} = getControlPosition(event);
        const newPosition = { top: 0, left: 0 };
        let parentRect : any = event.target.offsetParent.getBoundingClientRect();
        let clientRect : any = event.target.getBoundingClientRect();
        newPosition.left = (clientRect.left - parentRect.left);
        if (this.rightToLeft) newPosition.left *= -1;
        newPosition.top = (clientRect.top - parentRect.top);
        this.dragging = newPosition;
        let pos : { x : number, y : number } = this.calcXY(newPosition.top, newPosition.left);
        this.lastX = x;
        this.lastY = y;
        this.$emit("dragEvent", event.type, this.i, pos.x, pos.y, this.h, this.w);
    }

    public handleDragMove (event : InteractEvent) : void {
        if (this.isResizing) return;
        const {x, y} = getControlPosition(event);
        const newPosition = { top: 0, left: 0 };
        if (!this.dragging) return;
        const coreEvent : CoreData = createCoreData(this.lastX, this.lastY, x, y);
        if (this.rightToLeft) newPosition.left = ((this.dragging.left || 0) - coreEvent.deltaX);
        else newPosition.left = ((this.dragging.left || 0) + coreEvent.deltaX);
        newPosition.top = this.dragging.top + coreEvent.deltaY;
        this.dragging = newPosition;
        let pos : { x : number, y : number } = this.calcXY(newPosition.top, newPosition.left);
        this.lastX = x;
        this.lastY = y;
        this.$emit("dragEvent", event.type, this.i, pos.x, pos.y, this.h, this.w);
    }

    /* NOTE:
     * When this.dragging = false; is put before the
     * `if (!this.isDragging) return;` line, the app behaves the same way that
     * it behaves when the position method below is converted to a getter.
    */
    public handleDragEnd (event : InteractEvent) : void {
        if (this.isResizing) return;
        if (!this.isDragging) return;
        this.isDragging = false;
        this.dragging = undefined;
        const {x, y} = getControlPosition(event);
        const newPosition = { top: 0, left: 0 };
        let parentRect : any = event.target.offsetParent.getBoundingClientRect();
        let clientRect : any = event.target.getBoundingClientRect();
        newPosition.left = (clientRect.left - parentRect.left);
        if (this.rightToLeft) newPosition.left *= -1;
        newPosition.top = clientRect.top - parentRect.top;
        let pos : { x : number, y : number } = this.calcXY(newPosition.top, newPosition.left);
        this.lastX = x;
        this.lastY = y;
        this.$emit("dragEvent", event.type, this.i, pos.x, pos.y, this.h, this.w);
    }

    /* TODO:
    * Make this a property some time in the future, when it works. As of right
    * now, there is a strange issue where making this a property--even without
    * changing a single line of code--makes the grid-snapping stop working for
    * some reason.
    *
    * Here is what I know about this issue:
    * * The inputs are the same for both the getter and method.
    * * The outputs are NOT the same for both the getter and method.
    * * Changing the name of the getter to something else does not resolve the issue.
    * * Returning the output of the method equivalent does not resolve the issue.
    *   * i.e. `get position () : void { return this.calcPosition(); }`
    *
    * My current suspicion is that it has something to do with how Vue handles
    * updates from getters. Methods have to be called, but computed properties
    * changing may be making parts of the code run unintentionally.
    *
    */
    public position () : Position {
        // TODO: Use one return statement, if possible
        if (this.rightToLeft) {
            return {
                right: Math.round(this.columnWidth * this.x + (this.x + 1) * this.horizontalMargin),
                top: Math.round(this.rowHeight * this.y + (this.y + 1) * this.verticalMargin),
                width: this.w === Infinity ? this.w : Math.round(this.columnWidth * this.w + Math.max(0, this.w - 1) * this.horizontalMargin),
                height: this.h === Infinity ? this.h : Math.round(this.rowHeight * this.h + Math.max(0, this.h - 1) * this.verticalMargin)
            };
        } else {
            return {
                left: Math.round(this.columnWidth * this.x + (this.x + 1) * this.horizontalMargin),
                top: Math.round(this.rowHeight * this.y + (this.y + 1) * this.verticalMargin),
                width: this.w === Infinity ? this.w : Math.round(this.columnWidth * this.w + Math.max(0, this.w - 1) * this.horizontalMargin),
                height: this.h === Infinity ? this.h : Math.round(this.rowHeight * this.h + Math.max(0, this.h - 1) * this.verticalMargin)
            };
        }
    }

    get gridAlignedRightPositionInPixels () : number {
        return Math.round(this.columnWidth * this.x + (this.x + 1) * this.horizontalMargin);
    }

    get gridAlignedLeftPositionInPixels () : number {
        return Math.round(this.columnWidth * this.x + (this.x + 1) * this.horizontalMargin);
    }

    get gridAlignedTopPositionInPixels () : number {
        return Math.round(this.rowHeight * this.y + (this.y + 1) * this.verticalMargin);
    }

    get gridAlignedWidthInPixels () : number {
        return (this.w === Infinity ? this.w : Math.round(this.columnWidth * this.w + Math.max(0, this.w - 1) * this.horizontalMargin));
    }

    get gridAlignedHeightInPixels () : number {
        return (this.h === Infinity ? this.h : Math.round(this.rowHeight * this.h + Math.max(0, this.h - 1) * this.verticalMargin));
    }

    /**
    * Translate this.x and y coordinates from pixels to grid units.
    * @param  {number} top  Top position (relative to parent) in pixels.
    * @param  {number} left Left position (relative to parent) in pixels.
    * @return {object} x and y in grid units.
    */
    private calcXY (top : number, left : number) : { x : number, y : number } {
        let x = Math.round((left - this.horizontalMargin) / (this.columnWidth + this.horizontalMargin));
        let y = Math.round((top - this.verticalMargin) / (this.rowHeight + this.verticalMargin));
        x = Math.max(Math.min(x, this.cols - this.w), 0);
        y = Math.max(Math.min(y, this.maxRows - this.h), 0);
        return { x, y };
    }

    /**
    * Given a height and width in pixel values, calculate grid units.
    * @param  {Number} height Height in pixels.
    * @param  {Number} width  Width in pixels.
    * @return {Object} w, h as grid units.
    */
    private calcWH (height : number, width : number) : { w : number, h : number } {
        let w = Math.round((width + this.horizontalMargin) / (this.columnWidth + this.horizontalMargin));
        let h = Math.round((height + this.verticalMargin) / (this.rowHeight + this.verticalMargin));
        w = Math.max(Math.min(w, this.cols - this.x), 0);
        h = Math.max(Math.min(h, this.maxRows - this.y), 0);
        return { w, h };
    }

}
</script>

<style>
    .vue-grid-item {
        transition: all 200ms ease;
        transition-property: left, top, right;
        /* add right for rtl */
    }

    .vue-grid-item.cssTransforms {
        transition-property: transform;
        left: 0;
        right: auto;
    }

    .vue-grid-item.cssTransforms.render-rtl {
        left: auto;
        right: 0;
    }

    .vue-grid-item.resizing {
        opacity: 0.6;
        z-index: 3;
    }

    .vue-grid-item.vue-draggable-dragging {
        transition:none;
        z-index: 3;
    }

    .vue-grid-item > .vue-resizable-handle.rtl {
        position: absolute;
        width: 20px;
        height: 20px;
        bottom: 0;
        right: 0;
        background: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pg08IS0tIEdlbmVyYXRvcjogQWRvYmUgRmlyZXdvcmtzIENTNiwgRXhwb3J0IFNWRyBFeHRlbnNpb24gYnkgQWFyb24gQmVhbGwgKGh0dHA6Ly9maXJld29ya3MuYWJlYWxsLmNvbSkgLiBWZXJzaW9uOiAwLjYuMSAgLS0+DTwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DTxzdmcgaWQ9IlVudGl0bGVkLVBhZ2UlMjAxIiB2aWV3Qm94PSIwIDAgNiA2IiBzdHlsZT0iYmFja2dyb3VuZC1jb2xvcjojZmZmZmZmMDAiIHZlcnNpb249IjEuMSINCXhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHhtbDpzcGFjZT0icHJlc2VydmUiDQl4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjZweCIgaGVpZ2h0PSI2cHgiDT4NCTxnIG9wYWNpdHk9IjAuMzAyIj4NCQk8cGF0aCBkPSJNIDYgNiBMIDAgNiBMIDAgNC4yIEwgNCA0LjIgTCA0LjIgNC4yIEwgNC4yIDAgTCA2IDAgTCA2IDYgTCA2IDYgWiIgZmlsbD0iIzAwMDAwMCIvPg0JPC9nPg08L3N2Zz4=');
        background-position: bottom right;
        padding: 0 3px 3px 0;
        background-repeat: no-repeat;
        background-origin: content-box;
        box-sizing: border-box;
        cursor: se-resize;
    }

    .vue-grid-item > .vue-resizable-handle.rtl {
        bottom: 0;
        left: 0;
        background: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAuMDAwMDAwMDAwMDAwMDAyIiBoZWlnaHQ9IjEwLjAwMDAwMDAwMDAwMDAwMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KIDwhLS0gQ3JlYXRlZCB3aXRoIE1ldGhvZCBEcmF3IC0gaHR0cDovL2dpdGh1Yi5jb20vZHVvcGl4ZWwvTWV0aG9kLURyYXcvIC0tPgogPGc+CiAgPHRpdGxlPmJhY2tncm91bmQ8L3RpdGxlPgogIDxyZWN0IGZpbGw9Im5vbmUiIGlkPSJjYW52YXNfYmFja2dyb3VuZCIgaGVpZ2h0PSIxMiIgd2lkdGg9IjEyIiB5PSItMSIgeD0iLTEiLz4KICA8ZyBkaXNwbGF5PSJub25lIiBvdmVyZmxvdz0idmlzaWJsZSIgeT0iMCIgeD0iMCIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIgaWQ9ImNhbnZhc0dyaWQiPgogICA8cmVjdCBmaWxsPSJ1cmwoI2dyaWRwYXR0ZXJuKSIgc3Ryb2tlLXdpZHRoPSIwIiB5PSIwIiB4PSIwIiBoZWlnaHQ9IjEwMCUiIHdpZHRoPSIxMDAlIi8+CiAgPC9nPgogPC9nPgogPGc+CiAgPHRpdGxlPkxheWVyIDE8L3RpdGxlPgogIDxsaW5lIGNhbnZhcz0iI2ZmZmZmZiIgY2FudmFzLW9wYWNpdHk9IjEiIHN0cm9rZS1saW5lY2FwPSJ1bmRlZmluZWQiIHN0cm9rZS1saW5lam9pbj0idW5kZWZpbmVkIiBpZD0ic3ZnXzEiIHkyPSItNzAuMTc4NDA3IiB4Mj0iMTI0LjQ2NDE3NSIgeTE9Ii0zOC4zOTI3MzciIHgxPSIxNDQuODIxMjg5IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlPSIjMDAwIiBmaWxsPSJub25lIi8+CiAgPGxpbmUgc3Ryb2tlPSIjNjY2NjY2IiBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z181IiB5Mj0iOS4xMDY5NTciIHgyPSIwLjk0NzI0NyIgeTE9Ii0wLjAxODEyOCIgeDE9IjAuOTQ3MjQ3IiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiLz4KICA8bGluZSBzdHJva2UtbGluZWNhcD0idW5kZWZpbmVkIiBzdHJva2UtbGluZWpvaW49InVuZGVmaW5lZCIgaWQ9InN2Z183IiB5Mj0iOSIgeDI9IjEwLjA3MzUyOSIgeTE9IjkiIHgxPSItMC42NTU2NCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2U9IiM2NjY2NjYiIGZpbGw9Im5vbmUiLz4KIDwvZz4KPC9zdmc+);
        background-position: bottom left;
        padding-left: 3px;
        background-repeat: no-repeat;
        background-origin: content-box;
        cursor: sw-resize;
        right: auto;
    }

    .vue-grid-item.disable-userselect {
        user-select: none;
    }
</style>