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
    eventBus: Vue;
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
    cols: number;
    dragIgnoreFrom: string;
    dragAllowFrom: string;
    resizeIgnoreFrom: string;
    margin: [number, number];
    maxRows: number;
    useCssTransforms: boolean;
    isDragging: boolean;
    dragging?: Position;
    isResizing: boolean;
    resizing?: Size;
    lastX: number;
    lastY: number;
    lastW: number;
    lastH: number;
    style: object;
    dragEventSet: boolean;
    resizeEventSet: boolean;
    previousW: number;
    previousH: number;
    previousX: number;
    previousY: number;
    innerX: number;
    innerY: number;
    innerW: number;
    innerH: number;
    interactObj?: Interactable;
    mounted(): void;
    onYChanged(newVal: number): void;
    createStyle(): void;
    handleResize(event: InteractEvent): void;
    handleDrag(event: InteractEvent): void;
    calcPosition(x: number, y: number, w: number, h: number): Position;
    /**
    * Translate x and y coordinates from pixels to grid units.
    * @param  {number} top  Top position (relative to parent) in pixels.
    * @param  {number} left Left position (relative to parent) in pixels.
    * @return {object} x and y in grid units.
    */
    calcXY(top: number, left: number): {
        x: number;
        y: number;
    };
    calcColWidth(): number;
    /**
    * Given a height and width in pixel values, calculate grid units.
    * @param  {Number} height Height in pixels.
    * @param  {Number} width  Width in pixels.
    * @return {Object} w, h as grid units.
    */
    calcWH(height: number, width: number): {
        w: number;
        h: number;
    };
    compact(): void;
}
