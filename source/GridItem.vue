<template>
    <div ref="item"
        class="vue-grid-item"
        :class="{ 'vue-resizable' : resizable, 'resizing' : isResizing, 'vue-draggable-dragging' : isDragging, 'cssTransforms' : useCssTransforms, 'render-rtl' : rtl, 'disable-userselect': isDragging }"
        :style="style">
        <slot></slot>
        <span v-if="resizable" ref="handle" :class="resizableHandleClass"></span>
    </div>
</template>

<script lang="ts">
import { setTopLeft, setTopRight, setTransformRtl, setTransform, Position, Size } from './utils';
import { getControlPosition, createCoreData, CoreData } from './draggableUtils';
import { Vue, Component, Prop, Inject, Watch } from "vue-property-decorator";
import { Interactable, InteractEvent } from "interactjs"; // FIXME: Add DraggableOptions when v1.4.0 comes out.
import * as interact from "interactjs/index";

@Component({})
export default class GridItemComponent extends Vue {

    @Inject() eventBus! : Vue; // REVIEW

    @Prop({ default: false }) public isDraggable! : boolean; // not required
    @Prop({ default: false }) public isResizable! : boolean; // not required
    @Prop({ default: 1 }) public minH! : number; // not required, default 1
    @Prop({ default: 1 }) public minW! : number; // not required, default 1
    @Prop({ default: Infinity }) public maxH! : number; // not required, default Infinity
    @Prop({ default: Infinity }) public maxW! : number; // not required, default Infinity
    @Prop() public x! : number; // required
    @Prop() public y! : number; // required
    @Prop() public w! : number; // required
    @Prop() public h! : number; // required
    @Prop() public i! : string; // required

    // REVIEW: These could be better data types.
    @Prop({ default: "a, button" }) public dragIgnoreFrom! : string; // not required, default 'a, button'
    @Prop({ default: "" }) public dragAllowFrom! : string; // not required, default ""
    @Prop({ default: "a, button" }) public resizeIgnoreFrom! : string; // not required, default 'a, button'

    public cols : number = 1;
    public containerWidth : number = 100;
    public rowHeight : number = 30;
    public margin : [ number, number ] = [10, 10];
    public maxRows : number = Infinity;
    public draggable : boolean = false;
    public resizable : boolean = false;
    public useCssTransforms : boolean = true;
    public isDragging : boolean = false;
    public dragging? : Position = undefined;
    public isResizing : boolean = false;
    public resizing? : Size = undefined;
    public lastX : number = NaN;
    public lastY : number = NaN;
    public lastW : number = NaN;
    public lastH : number = NaN;
    public style : object = {};
    public rtl : boolean = false;
    public dragEventSet : boolean = false;
    public resizeEventSet : boolean = false;
    public previousW : number = 0;
    public previousH : number = 0;
    public previousX : number = 0;
    public previousY : number = 0;
    public innerX : number = this.x;
    public innerY : number = this.y;
    public innerW : number = this.w;
    public innerH : number = this.h;

    public interactObj? : Interactable;

    public updateWidthHandler (width : number) : void {
        this.updateWidth(width);
    }

    /**
     * REVIEW: Something is screwy here: In the original library, the layout
     * argument is passed into compact, but compact() does not use it...
     * At least, it looks that way.
     */
    public compactHandler () : void {
        this.compact();
    }

    public setDraggableHandler (isDraggable : boolean) : void {
        this.draggable = isDraggable;
    }

    public setResizableHandler (isResizable : boolean) : void {
        this.resizable = isResizable;
    }

    public setRowHeightHandler (rowHeight : number) : void {
        this.rowHeight = rowHeight;
    }

    // REVIEW: It looks like "dir" is unused...
    public directionchangeHandler () : void {
        let direction : string = (document.dir !== undefined) ?
            document.dir :
            (document.getElementsByTagName("html")[0].getAttribute("dir") || "");
        this.rtl = (direction === "rtl");
        this.compact();
    }

    // TODO: Make this take a number instead.
    public setColNum (numberString : string) : void {
        this.cols = parseInt(numberString);
    }

    public created () : void {
        let self = this;
        this.eventBus.$on('updateWidth', self.updateWidthHandler);
        this.eventBus.$on('compact', self.compactHandler);
        this.eventBus.$on('setDraggable', self.setDraggableHandler);
        this.eventBus.$on('setResizable', self.setResizableHandler);
        this.eventBus.$on('setRowHeight', self.setRowHeightHandler);
        this.eventBus.$on('directionchange', self.directionchangeHandler);
        this.eventBus.$on('setColNum', self.setColNum)

        // REVIEW: Why don't we just call directionchangeHandler, created above?
        let direction = (document.dir !== undefined) ?
            document.dir :
            document.getElementsByTagName("html")[0].getAttribute("dir");
        this.rtl = (direction === "rtl");
    }

    public beforeDestroy () : void {
        let self = this;
        //Remove listeners
        this.eventBus.$off('updateWidth', self.updateWidthHandler);
        this.eventBus.$off('compact', self.compactHandler);
        this.eventBus.$off('setDraggable', self.setDraggableHandler);
        this.eventBus.$off('setResizable', self.setResizableHandler);
        this.eventBus.$off('setRowHeight', self.setRowHeightHandler);
        this.eventBus.$off('directionchange', self.directionchangeHandler);
        this.eventBus.$off('setColNum', self.setColNum);
    }

    /* REVIEW:
     * This really reeks of very bad code. All of these properties should be
     * set by the parent via props.
     */
    public mounted () : void {
        // this.cols = this.$parent.$data.colNum; // Unfortunately, it has to be this way, for right now.
        this.cols = this.$parent.$props.colNum; // REVIEW: Can these be data instead?
        this.rowHeight = this.$parent.$props.rowHeight; // REVIEW: Can these be data instead?
        this.containerWidth = this.$parent.$el.clientWidth; // REVIEW: I changed this from 'width'
        this.margin = this.$parent.$props.margin;
        this.maxRows = this.$parent.$props.maxRows;
        // FIXME: I changed code here. These will be required as props now.
        this.draggable = this.isDraggable; // REVIEW: Why?
        this.resizable = this.isResizable; // REVIEW: Why?
        this.useCssTransforms = this.$parent.$props.useCssTransforms;
        this.createStyle();
    }

    // REVIEW: Why this recursion?
    @Watch('isDraggable')
    public onIsDraggableChanged () : void {
        this.draggable = this.isDraggable;
    }

    @Watch('draggable')
    public onDraggableChanged () : void {
        if (this.interactObj === null || this.interactObj === undefined)
            this.interactObj = interact(this.$refs.item);

        if (this.draggable) {
            // FIXME: Uncomment when InteractJS 1.4.0 comes out.
            // let opts = {
            //     ignoreFrom: this.dragIgnoreFrom,
            //     allowFrom: this.dragAllowFrom
            // };
            let opts = {};
            this.interactObj.draggable(opts);
            if (!this.dragEventSet) {
                this.dragEventSet = true;
                this.interactObj.on(['dragstart', 'dragmove', 'dragend'], (event : InteractEvent) => {
                    this.handleDrag(event);
                });
            }
            // let list = new Liste
        } else {
            // FIXME: Uncomment when InteractJS 1.4.0 comes out.
            // this.interactObj.draggable({
            //     enabled: false
            // });
        }
    }

    // REVIEW: Why this recursion?
    @Watch('isResizable')
    public onIsResizableChanged () : void {
        this.resizable = this.isResizable;
    }

    @Watch('resizable')
    public onResizableChanged () : void {
        let self = this;
        if (this.interactObj === null || this.interactObj === undefined) {
            this.interactObj = interact(this.$refs.item);
        }
        if (this.resizable) {
            let opts = {
                preserveAspectRatio: false,
                edges: {
                    left: false,
                    right: "." + this.resizableHandleClass,
                    bottom: "." + this.resizableHandleClass,
                    top: false
                },
                ignoreFrom: this.resizeIgnoreFrom
            };

            this.interactObj.resizable(opts);
            if (!this.resizeEventSet) {
                this.resizeEventSet = true;
                this.interactObj
                    .on(['resizestart', 'resizemove', 'resizeend'], (event : InteractEvent) => {
                        self.handleResize(event);
                    });
            }
        } else {
            // FIXME: Uncomment when InteractJS 1.4.0 comes out.
            // this.interactObj.resizable({
            //     enabled: false
            // });
        }
    }

    @Watch('rowHeight')
    public onRowHeightChanged () : void {
        this.createStyle();
    }

    @Watch('cols')
    public onColsChanged () : void {
        this.createStyle();
    }

    @Watch('containerWidth')
    public onContainerWidthChanged () : void {
        this.createStyle();
    }

    @Watch('x')
    public onXChanged (newVal : number) : void {
        this.innerX = newVal;
        this.createStyle();
    }

    @Watch('y')
    public onYChanged (newVal : number) : void {
        this.innerY = newVal;
        this.createStyle();
    }

    @Watch('h')
    public onHChanged (newVal : number) : void {
        this.innerH = newVal;
        this.createStyle();
    }

    @Watch('w')
    public onWChanged (newVal : number) : void {
        this.innerW = newVal;
        this.createStyle();
    }

    @Watch('rtl')
    public onRTLChanged () : void {
        this.createStyle();
    }

    // public renderRtl () : boolean {
    //     return ((this.$parent.$props.isMirrored) ? !this.rtl : this.rtl);
    // }

    public resizableHandleClass () : string {
        if (this.rtl) {
            return 'vue-resizable-handle vue-rtl-resizable-handle';
        } else {
            return 'vue-resizable-handle';
        }
    }

    public createStyle () : void {

        if (this.x + this.w > this.cols) {
            this.innerX = 0;
            this.innerW = ((this.w > this.cols) ? this.cols : this.w);
        } else {
            this.innerX = this.x;
            this.innerW = this.w;
        }

        let pos = this.calcPosition(this.innerX, this.innerY, this.innerW, this.innerH);

        // REVIEW: I added '&& this.dragging' here.
        if (this.isDragging && this.dragging) {
            pos.top = this.dragging.top;
            if (this.rtl) {
                pos.right = this.dragging.left;
            } else {
                pos.left = this.dragging.left;
            }
        }

        // REVIEW: I added '&& this.resizing' here.
        if (this.isResizing && this.resizing) {
            pos.width = this.resizing.width;
            pos.height = this.resizing.height;
        }

        // REVIEW: I added all of the (pos.whatever || 0) here.
        let style;
        if (this.useCssTransforms) {
            if (this.rtl) {
                style = setTransformRtl(pos.top, (pos.right || 0), (pos.width || 0), (pos.height || 0));
            } else {
                style = setTransform(pos.top, (pos.left || 0), (pos.width || 0), (pos.height || 0));
            }

        } else {
            if (this.rtl) {
                style = setTopRight(pos.top, (pos.right || 0), (pos.width || 0), (pos.height || 0));
            } else {
                style = setTopLeft(pos.top, (pos.left || 0), (pos.width || 0), (pos.height || 0));
            }
        }

        this.style = style;
    }

    public handleResize (event : InteractEvent) : void {
        const position = getControlPosition(event);
        // Get the current drag point from the event. This is used as the offset.
        if (position == null) return; // not possible but satisfies flow
        const { x, y } = position;

        const newSize : Size = {
            width: 0,
            height: 0
        };

        let pos : Position;
        switch (event.type) {
            case "resizestart":
                this.previousW = this.innerW;
                this.previousH = this.innerH;
                pos = this.calcPosition(this.innerX, this.innerY, this.innerW, this.innerH);
                // REVIEW: I added the '|| 0'
                newSize.width = (pos.width || 0);
                newSize.height = (pos.height || 0);
                this.resizing = newSize;
                this.isResizing = true;
                break;
            case "resizemove":
                if (!this.resizing) return;
                const coreEvent : CoreData = createCoreData(this.lastW, this.lastH, x, y);
                if (this.rtl) {
                    newSize.width = this.resizing.width - coreEvent.deltaX;
                } else {
                    newSize.width = this.resizing.width + coreEvent.deltaX;
                }
                newSize.height = this.resizing.height + coreEvent.deltaY;

                this.resizing = newSize;
                break;
            case "resizeend":
                pos = this.calcPosition(this.innerX, this.innerY, this.innerW, this.innerH);
                // REVIEW: I added the '|| 0'
                newSize.width = pos.width || 0;
                newSize.height = pos.height || 0;
                this.resizing = undefined;
                this.isResizing = false;
                break;
        }

        // Get new WH
        let newPos = this.calcWH(newSize.height, newSize.width);
        if (newPos.w < this.minW) newPos.w = this.minW;
        if (newPos.w > this.maxW) newPos.w = this.maxW;
        if (newPos.h < this.minH) newPos.h = this.minH;
        if (newPos.h > this.maxH) newPos.h = this.maxH;
        if (newPos.h < 1) newPos.h = 1;
        if (newPos.w < 1) newPos.w = 1;
        this.lastW = x;
        this.lastH = y;

        if (this.innerW !== newPos.w || this.innerH !== newPos.h)
            this.$emit("resize", this.i, newPos.h, newPos.w, newSize.height, newSize.width);

        if (event.type === "resizeend" && (this.previousW !== this.innerW || this.previousH !== this.innerH))
            this.$emit("resized", this.i, newPos.h, newPos.w, newSize.height, newSize.width);

        this.eventBus.$emit("resizeEvent", event.type, this.i, this.innerX, this.innerY, newPos.h, newPos.w);
    }

    public handleDrag (event : InteractEvent) : void {
        if (this.isResizing) return;
        const position = getControlPosition(event);
        // Get the current drag point from the event. This is used as the offset.
        if (position === null) return; // not possible but satisfies flow
        const {x, y} = position;
        // let shouldUpdate = false;
        const newPosition = {
            top: 0,
            left: 0
        };

        switch (event.type) {
            case "dragstart":
                this.previousX = this.innerX;
                this.previousY = this.innerY;

                let parentRect = event.target.offsetParent.getBoundingClientRect();
                let clientRect = event.target.getBoundingClientRect();
                if (this.rtl) {
                    newPosition.left = (clientRect.right - parentRect.right) * -1;
                } else {
                    newPosition.left = clientRect.left - parentRect.left;
                }
                newPosition.top = clientRect.top - parentRect.top;
                this.dragging = newPosition;
                this.isDragging = true;
                break;
            case "dragend":
                if (!this.isDragging) return;
                parentRect = event.target.offsetParent.getBoundingClientRect();
                clientRect = event.target.getBoundingClientRect();
                if (this.rtl) {
                    newPosition.left = (clientRect.right - parentRect.right) * -1;
                } else {
                    newPosition.left = clientRect.left - parentRect.left;
                }
                newPosition.top = clientRect.top - parentRect.top;
                this.dragging = undefined;
                this.isDragging = false;
                // shouldUpdate = true;
                break;
            case "dragmove":
                if (!this.dragging) return;
                const coreEvent : CoreData = createCoreData(this.lastX, this.lastY, x, y);
                // REVIEW: I added the '|| 0'.
                if (this.rtl) {
                    newPosition.left = (this.dragging.left || 0) - coreEvent.deltaX;
                } else {
                    newPosition.left = (this.dragging.left || 0) + coreEvent.deltaX;
                }
                newPosition.top = this.dragging.top + coreEvent.deltaY;
                this.dragging = newPosition;
                break;
        }

        // Get new XY
        let pos : { x : number, y : number };
        if (this.rtl) {
            pos = this.calcXY(newPosition.top, newPosition.left);
        } else {
            pos = this.calcXY(newPosition.top, newPosition.left);
        }

        this.lastX = x;
        this.lastY = y;

        if (this.innerX !== pos.x || this.innerY !== pos.y)
            this.$emit("move", this.i, pos.x, pos.y);

        if (event.type === "dragend" && (this.previousX !== this.innerX || this.previousY !== this.innerY))
            this.$emit("moved", this.i, pos.x, pos.y);

        this.eventBus.$emit("dragEvent", event.type, this.i, pos.x, pos.y, this.innerH, this.innerW);
    }

    // FIXME: Improve the specificity of the return type.
    public calcPosition (x : number, y : number, w : number, h : number) : Position {
        const colWidth = this.calcColWidth();
        let out : Position;
        if (this.rtl) {
            out = {
                right: Math.round(colWidth * x + (x + 1) * this.margin[0]),
                top: Math.round(this.rowHeight * y + (y + 1) * this.margin[1]),
                width: w === Infinity ? w : Math.round(colWidth * w + Math.max(0, w - 1) * this.margin[0]),
                height: h === Infinity ? h : Math.round(this.rowHeight * h + Math.max(0, h - 1) * this.margin[1])
            };
        } else {
            out = {
                left: Math.round(colWidth * x + (x + 1) * this.margin[0]),
                top: Math.round(this.rowHeight * y + (y + 1) * this.margin[1]),
                width: w === Infinity ? w : Math.round(colWidth * w + Math.max(0, w - 1) * this.margin[0]),
                height: h === Infinity ? h : Math.round(this.rowHeight * h + Math.max(0, h - 1) * this.margin[1])
            };
        }

        return out;
    }

    // FIXME: Improve the specificity of the return type.
    /**
    * Translate x and y coordinates from pixels to grid units.
    * @param  {number} top  Top position (relative to parent) in pixels.
    * @param  {number} left Left position (relative to parent) in pixels.
    * @return {object} x and y in grid units.
    */
    public calcXY (top : number, left : number) : { x : number, y : number } {
        const colWidth = this.calcColWidth();
        let x = Math.round((left - this.margin[0]) / (colWidth + this.margin[0]));
        let y = Math.round((top - this.margin[1]) / (this.rowHeight + this.margin[1]));
        x = Math.max(Math.min(x, this.cols - this.innerW), 0);
        y = Math.max(Math.min(y, this.maxRows - this.innerH), 0);
        return {x, y};
    }

    public calcColWidth () : number {
        let colWidth = (this.containerWidth - (this.margin[0] * (this.cols + 1))) / this.cols;
        return colWidth;
    }

    // FIXME: Improve the specificity of the return type.
    /**
    * Given a height and width in pixel values, calculate grid units.
    * @param  {Number} height Height in pixels.
    * @param  {Number} width  Width in pixels.
    * @return {Object} w, h as grid units.
    */
    public calcWH (height : number, width : number) : { w : number, h : number } {
        const colWidth = this.calcColWidth();
        let w = Math.round((width + this.margin[0]) / (colWidth + this.margin[0]));
        let h = Math.round((height + this.margin[1]) / (this.rowHeight + this.margin[1]));
        w = Math.max(Math.min(w, this.cols - this.innerX), 0);
        h = Math.max(Math.min(h, this.maxRows - this.innerY), 0);
        return {w, h};
    }

    public updateWidth (width : number, colNum? : number) : void {
        this.containerWidth = width;
        if (colNum !== undefined && colNum !== null) {
            this.cols = colNum;
        }
    }

    // REVIEW: What is the point of this?
    public compact () : void {
        this.createStyle();
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

    .vue-grid-item.vue-grid-placeholder {
        background: red;
        opacity: 0.2;
        transition-duration: 100ms;
        z-index: 2;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        -o-user-select: none;
        user-select: none;
    }

    .vue-grid-item > .vue-resizable-handle {
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

    .vue-grid-item > .vue-rtl-resizable-handle {
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