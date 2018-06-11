<template>
    <div ref="item" class="vue-grid-layout" :style="mergedStyle">
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { bottom, compact, getLayoutItem, moveElement, LayoutItem } from "./utils";
// import {getBreakpointFromWidth, getColsFromBreakpoint, findOrGenerateResponsiveLayout, generateResponsiveLayout} from './responsiveUtils';
import GridItemComponent from "./GridItem.vue";

// REVIEW: These libraries will never support TypeScript.
// import * as elementResizeDetectorMaker from "element-resize-detector";
// let elementResizeDetectorMaker = require("element-resize-detector");

@Component({
    components: {
        "GridItem": GridItemComponent
    }
})
export default class ResponsiveGridLayoutComponent extends Vue {

    @Prop() autoSize : boolean = true;
    @Prop() colNum : number = 0;
    @Prop() rowHeight : number = 150;
    @Prop() maxRows : number = Infinity;
    @Prop() margin : [number, number] = [10, 10];
    @Prop() isDraggable : boolean = true;
    @Prop() isResizable : boolean = true;
    @Prop() isMirrored : boolean = false;
    @Prop() useCssTransforms : boolean = true;
    @Prop() verticalCompact : boolean = true;
    @Prop() layout! : LayoutItem[];

    public $children! : GridItemComponent[]; // REVIEW: We'll see how this goes...

    public originalCols? : number = undefined;
    public width? : number = undefined;
    public mergedStyle : object = {};
    public lastLayoutLength : number = 0;

    public $refs!: {
        item : HTMLElement
    }

    public beforeDestroy () : void {
        window.removeEventListener("resize", this.onWindowResize);
    }

    public mounted () : void {
        let self = this;
        this.$nextTick(function () {
            // validateLayout(this.layout); // FIXME:
            this.originalCols = this.colNum;
            window.onload = function() {
                self.onWindowResize();
                window.addEventListener('resize', self.onWindowResize);
                compact(self.layout, self.verticalCompact);
                self.updateHeight();
                self.$nextTick(function() {
                    // let erd = elementResizeDetectorMaker({ strategy: "scroll" });
                    // erd.listenTo(self.$refs.item, function() {
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
        if (this.width != undefined && this.width > 768) {
            this.colNum = this.originalCols || 0; // NOTE: I made the code change of adding the '|| 0' here.
        } else {
            this.colNum = 2;
        }

        /** FIXME:
         * This is going to entail a big architecture change in this library...
         */
        this.$nextTick(() => {
            this.$children.forEach((child) => {
                // child.updateWidth(this.width);
            });
            this.updateHeight();
            compact(this.layout, this.verticalCompact);
        });
    }

    @Watch("layout")
    public onLayoutChange () : void {
        if (this.layout !== undefined && this.layout.length !== this.lastLayoutLength) {
            this.lastLayoutLength = this.layout.length;
            compact(this.layout, this.verticalCompact);

            /** FIXME:
             * This is going to entail a big architecture change in this library...
             */
            let self = this;
            this.$children.forEach(function(child) {
                // child.updateWidth(self.width);
            });

            this.updateHeight();
        }
    }

    public onWindowResize () : void {
        if (this.$refs !== null && this.$refs.item !== null)
            this.width = this.$refs.item.offsetWidth;
    }

    public updateHeight () : void {
        this.mergedStyle = {
            height: this.containerHeight()
        };
    }

    // TODO: Make this return a number, and append the px as necessary.
    public containerHeight () : string {
        if (!this.autoSize) return ""; // REVIEW
        return bottom(this.layout) * (this.rowHeight + this.margin[1]) + this.margin[1] + 'px';
    }

    public dragEvent (eventName : string, id : string, x : number, y : number) : void {
        let self = this;
        let l = getLayoutItem(this.layout, id);
        this.layout = moveElement(this.layout, l, x, y, true);
        compact(this.layout, this.verticalCompact);

        /** FIXME:
         * This is going to entail a big architecture change in this library...
         */
        this.$children.forEach(function(child) {
            // child.compact(self.layout);
        });
        this.updateHeight();
    }

    public resizeEvent (eventName : string, id : string, x : number, y : number) : void {
        let self = this;
        compact(this.layout, this.verticalCompact);

        /** FIXME:
         * This is going to entail a big architecture change in this library...
         */
        this.$children.forEach(function(child) {
            // child.compact(self.layout);
        });
        this.updateHeight();
    }

}
</script>

<style>
    .vue-grid-layout {
        position: relative;
        transition: height 200ms ease;
    }
</style>