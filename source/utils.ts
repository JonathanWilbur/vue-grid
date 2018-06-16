export
interface LayoutItem {
	w : number,
	h : number,
	x : number,
	y : number,
	i : string
    minW? : number,
    minH? : number,
    maxW? : number,
    maxH? : number,
    moved? : boolean,
    static? : boolean,
    isDraggable? : boolean,
    isResizable? : boolean
};

export
type Layout = Array<LayoutItem>;

// FIXME: A dictionary would be better than this function.
/**
 * Get a layout item by ID. Used so we can override later on if necessary.
 *
 * @param  {Array}  layout Layout array.
 * @param  {String} id     ID
 * @return {LayoutItem}    Item at ID.
 */
export
function getLayoutItem (layout : Layout, id : string) : LayoutItem {
    for (let i : number = 0, len : number = layout.length; i < len; i++) {
        if (layout[i].i === id) return layout[i];
    }
    return { w: 0, h: 0, x: 0, y: 0, i: "" };
}

// REVIEW: Use more strictly-typed return value.
export
function setTransform (top : number, left : number, width : number, height : number) : Object {
    const translate = "translate3d(" + left + "px," + top + "px, 0)";
    // REVIEW: Are all these browser-specific transforms still necessary?
    return {
        transform: translate,
        WebkitTransform: translate,
        MozTransform: translate,
        msTransform: translate,
        OTransform: translate,
        width: width + "px",
        height: height + "px",
        position: 'absolute'
    };
}

// REVIEW: Use more strictly-typed return value.
/**
 * Just like the setTransform method, but instead it will return a negative value of right.
 *
 * @param top
 * @param right
 * @param width
 * @param height
 * @returns {{transform: string, WebkitTransform: string, MozTransform: string, msTransform: string, OTransform: string, width: string, height: string, position: string}}
 */
export
function setTransformRtl (top : number, right : number, width : number, height : number) : Object {
    const translate = "translate3d(" + right * -1 + "px," + top + "px, 0)";
    return {
        transform: translate,
        WebkitTransform: translate,
        MozTransform: translate,
        msTransform: translate,
        OTransform: translate,
        width: width + "px",
        height: height + "px",
        position: 'absolute'
    };
}

// REVIEW: Use more strictly-typed return value.
export
function setTopLeft (top : number, left : number, width : number, height : number) : Object {
    return {
        top: top + "px",
        left: left + "px",
        width: width + "px",
        height: height + "px",
        position: 'absolute'
    };
}

/**
 * Just like the setTopLeft method, but instead, it will return a right property instead of left.
 *
 * @param top
 * @param right
 * @param width
 * @param height
 * @returns {{top: string, right: string, width: string, height: string, position: string}}
 */
export
function setTopRight (top : number, right : number, width : number, height : number) : Object {
    return {
        top: top + "px",
        right: right + "px",
        width: width + "px",
        height: height + "px",
        position: 'absolute'
    };
}

export
const IS_UNITLESS : { [ key : string ] : boolean } = {
    animationIterationCount: true,
    boxFlex: true,
    boxFlexGroup: true,
    boxOrdinalGroup: true,
    columnCount: true,
    flex: true,
    flexGrow: true,
    flexPositive: true,
    flexShrink: true,
    flexNegative: true,
    flexOrder: true,
    gridRow: true,
    gridColumn: true,
    fontWeight: true,
    lineClamp: true,
    lineHeight: true,
    opacity: true,
    order: true,
    orphans: true,
    tabSize: true,
    widows: true,
    zIndex: true,
    zoom: true,

    // SVG-related properties
    fillOpacity: true,
    stopOpacity: true,
    strokeDashoffset: true,
    strokeOpacity: true,
    strokeWidth: true
};