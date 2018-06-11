import { Position, Size } from './utils';
import { Vue } from "vue-property-decorator";
import { Interactable, InteractEvent } from "interactjs";
export default class GridItemComponent extends Vue {
    eventBus: Vue;
    isDraggable: boolean;
    isResizable: boolean;
    minH: number;
    minW: number;
    maxH: number;
    maxW: number;
    x: number;
    y: number;
    w: number;
    h: number;
    i: string;
    dragIgnoreFrom: string;
    dragAllowFrom: string;
    resizeIgnoreFrom: string;
    cols: number;
    containerWidth: number;
    rowHeight: number;
    margin: [number, number];
    maxRows: number;
    draggable: boolean;
    resizable: boolean;
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
    rtl: boolean;
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
    updateWidthHandler(width: number): void;
    /**
     * REVIEW: Something is screwy here: In the original library, the layout
     * argument is passed into compact, but compact() does not use it...
     * At least, it looks that way.
     */
    compactHandler(): void;
    setDraggableHandler(isDraggable: boolean): void;
    setResizableHandler(isResizable: boolean): void;
    setRowHeightHandler(rowHeight: number): void;
    directionchangeHandler(): void;
    setColNum(numberString: string): void;
    created(): void;
    beforeDestroy(): void;
    mounted(): void;
    onIsDraggableChanged(): void;
    onDraggableChanged(): void;
    onIsResizableChanged(): void;
    onResizableChanged(): void;
    onRowHeightChanged(): void;
    onColsChanged(): void;
    onContainerWidthChanged(): void;
    onXChanged(newVal: number): void;
    onYChanged(newVal: number): void;
    onHChanged(newVal: number): void;
    onWChanged(newVal: number): void;
    onRTLChanged(): void;
    resizableHandleClass(): string;
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
    updateWidth(width: number, colNum?: number): void;
    compact(): void;
}
