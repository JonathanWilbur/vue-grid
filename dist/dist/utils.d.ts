export interface LayoutItem {
    w: number;
    h: number;
    x: number;
    y: number;
    i: string;
    minW?: number;
    minH?: number;
    maxW?: number;
    maxH?: number;
    moved?: boolean;
    static?: boolean;
    isDraggable?: boolean;
    isResizable?: boolean;
}
export declare type Layout = Array<LayoutItem>;
/**
 * Get a layout item by ID. Used so we can override later on if necessary.
 *
 * @param  {Array}  layout Layout array.
 * @param  {String} id     ID
 * @return {LayoutItem}    Item at ID.
 */
export declare function getLayoutItem(layout: Layout, id: string): LayoutItem;
export declare function setTransform(top: number, left: number, width: number, height: number): Object;
/**
 * Just like the setTransform method, but instead it will return a negative value of right.
 *
 * @param top
 * @param right
 * @param width
 * @param height
 * @returns {{transform: string, WebkitTransform: string, MozTransform: string, msTransform: string, OTransform: string, width: string, height: string, position: string}}
 */
export declare function setTransformRtl(top: number, right: number, width: number, height: number): Object;
export declare function setTopLeft(top: number, left: number, width: number, height: number): Object;
/**
 * Just like the setTopLeft method, but instead, it will return a right property instead of left.
 *
 * @param top
 * @param right
 * @param width
 * @param height
 * @returns {{top: string, right: string, width: string, height: string, position: string}}
 */
export declare function setTopRight(top: number, right: number, width: number, height: number): Object;
export declare const IS_UNITLESS: {
    [key: string]: boolean;
};
