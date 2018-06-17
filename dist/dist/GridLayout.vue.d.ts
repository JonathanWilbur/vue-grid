import { Vue } from "vue-property-decorator";
import { LayoutItem } from "./utils";
export default class GridLayoutComponent extends Vue {
    autoSize: boolean;
    colNum: number;
    rowHeight: number;
    width: number;
    maxRows: number;
    horizontalMargin: number;
    verticalMargin: number;
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
    readonly height: number;
    readonly columnWidth: number;
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
     * @return {Boolean}   True if colliding.
     */
    private collides;
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
    private moveElement;
    private getAllCollisions;
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
    private moveElementAwayFromCollision;
}
