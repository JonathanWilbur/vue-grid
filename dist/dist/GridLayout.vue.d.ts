import { Vue } from "vue-property-decorator";
import { LayoutItem } from "./utils";
export default class GridLayoutComponent extends Vue {
    autoSize: boolean;
    colNum: number;
    rowHeight: number;
    maxRows: number;
    margin: [number, number];
    isDraggable: boolean;
    isResizable: boolean;
    isMirrored: boolean;
    useCssTransforms: boolean;
    verticalCompact: boolean;
    layoutReference: LayoutItem[];
    layout: LayoutItem[];
    isDragging: boolean;
    isResizing: boolean;
    placeholder: {
        x: number;
        y: number;
        w: number;
        h: number;
        i: string;
    };
    mounted(): void;
    readonly style: object;
    readonly width: number;
    readonly height: number;
    dragEvent(eventName: string, id: string, x: number, y: number, h: number, w: number): void;
    resizeEvent(eventName: string, id: string, x: number, y: number, h: number, w: number): void;
    /**
    * Given a layout, compact it. This involves going down each y coordinate and removing gaps
    * between items.
    */
    private compact;
    private compactItem;
    /**
     * Returns the first item this layout collides with.
     * It doesn't appear to matter which order we approach this from, although
     * perhaps that is the wrong thing to do.
     *
     * @param  {Object} layoutItem Layout item.
     * @return {Object|undefined}  A colliding layout item, or undefined.
     */
    private getFirstCollision;
    /**
     * Given two layoutitems, check if they collide.
     *
     * @return {Boolean}   True if colliding.
     */
    private collides;
}
