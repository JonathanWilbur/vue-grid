import { Vue } from "vue-property-decorator";
import { Interactable, InteractEvent } from "interactjs";
export declare type Size = {
    width: number;
    height: number;
};
export declare type Position = {
    left?: number;
    right?: number;
    top: number;
    width?: number;
    height?: number;
};
export default class GridItemComponent extends Vue {
    x: number;
    y: number;
    w: number;
    h: number;
    i: string;
    minH: number;
    minW: number;
    maxH: number;
    maxW: number;
    isDraggable: boolean;
    isResizable: boolean;
    rightToLeft: boolean;
    rowHeight: number;
    columnWidth: number;
    cols: number;
    placeholder: boolean;
    maxRows: number;
    useCssTransforms: boolean;
    horizontalMargin: number;
    verticalMargin: number;
    dragIgnoreFrom: string;
    dragAllowFrom: string;
    resizeIgnoreFrom: string;
    isDragging: boolean;
    dragging?: Position;
    isResizing: boolean;
    resizing?: Size;
    lastX: number;
    lastY: number;
    lastW: number;
    lastH: number;
    interactObj?: Interactable;
    mounted(): void;
    readonly style: object;
    handleResizeStart(event: InteractEvent): void;
    handleResizeMove(event: InteractEvent): void;
    handleResizeEnd(event: InteractEvent): void;
    handleDragStart(event: InteractEvent): void;
    handleDragMove(event: InteractEvent): void;
    handleDragEnd(event: InteractEvent): void;
    position(): Position;
    readonly gridAlignedRightPositionInPixels: number;
    readonly gridAlignedLeftPositionInPixels: number;
    readonly gridAlignedTopPositionInPixels: number;
    readonly gridAlignedWidthInPixels: number;
    readonly gridAlignedHeightInPixels: number;
    /**
    * Translate this.x and y coordinates from pixels to grid units.
    * @param  {number} top  Top position (relative to parent) in pixels.
    * @param  {number} left Left position (relative to parent) in pixels.
    * @return {object} x and y in grid units.
    */
    private calcXY;
    /**
    * Given a height and width in pixel values, calculate grid units.
    * @param  {Number} height Height in pixels.
    * @param  {Number} width  Width in pixels.
    * @return {Object} w, h as grid units.
    */
    private calcWH;
}
