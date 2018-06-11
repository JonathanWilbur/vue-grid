export
interface LayoutItemRequired {
	w : number,
	h : number,
	x : number,
	y : number,
	i : string
};

export
interface LayoutItem extends LayoutItemRequired {
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

export
type Position = {
    left? : number,
    right? : number,
    top : number,
    width? : number,
    height? : number
};

export
type DragCallbackData = {
    node : HTMLElement,
    x : number,
    y : number,
    deltaX : number,
    deltaY : number,
    lastX : number,
    lastY : number
};

export
interface DragEvent extends DragCallbackData {
    e: Event
};

export
type Size = {
    width : number,
    height : number
};

export
type ResizeEvent = {
    e : Event,
    node: HTMLElement,
    size: Size
};

// const isProduction = process.env.NODE_ENV === 'production';

/**
 * Return the bottom coordinate of the layout.
 *
 * @param  {Array} layout Layout array.
 * @return {Number}       Bottom coordinate.
 */
export
function bottom (layout : Layout) : number {
    let max : number = 0;
    let bottomY : number;
    for (let i : number = 0, len : number = layout.length; i < len; i++) {
        bottomY = layout[i].y + layout[i].h;
        if (bottomY > max) max = bottomY;
    }
    return max;
}

export
function cloneLayout (layout : Layout) : Layout {
    const newLayout : Layout = Array(layout.length);
    for (let i : number = 0, len : number = layout.length; i < len; i++) {
        newLayout[i] = cloneLayoutItem(layout[i]);
    }
    return newLayout;
}

// Fast path to cloning, since this is monomorphic
export function cloneLayoutItem(layoutItem: LayoutItem): LayoutItem {
    return JSON.parse(JSON.stringify(layoutItem));
}

/**
 * Given two layoutitems, check if they collide.
 *
 * @return {Boolean}   True if colliding.
 */
export
function collides (l1 : LayoutItem, l2 : LayoutItem) : boolean {
    if (l1 === l2) return false; // same element
    if (l1.x + l1.w <= l2.x) return false; // l1 is left of l2
    if (l1.x >= l2.x + l2.w) return false; // l1 is right of l2
    if (l1.y + l1.h <= l2.y) return false; // l1 is above l2
    if (l1.y >= l2.y + l2.h) return false; // l1 is below l2
    return true; // boxes overlap
}

/**
 * Given a layout, compact it. This involves going down each y coordinate and removing gaps
 * between items.
 *
 * @param  {Array} layout Layout.
 * @param  {Boolean} verticalCompact Whether or not to compact the layout
 *   vertically.
 * @return {Array}       Compacted Layout.
 */
export
function compact (layout : Layout, verticalCompact : boolean) : Layout {
    // Statics go in the compareWith array right away so items flow around them.
    const compareWith = getStatics(layout);
    // We go through the items by row and column.
    const sorted = sortLayoutItemsByRowCol(layout);
    // Holding for new items.
    const out = Array(layout.length);

    for (let i : number = 0, len : number = sorted.length; i < len; i++) {
        let l = sorted[i];

        // Don't move static elements
        if (!l.static) {
            l = compactItem(compareWith, l, verticalCompact);

            // Add to comparison array. We only collide with items before this one.
            // Statics are already in this array.
            compareWith.push(l);
        }

        // Add to output array to make sure they still come out in the right order.
        out[layout.indexOf(l)] = l;
        l.moved = false; // Clear moved flag, if it exists.
    }

    return out;
}

/**
 * Compact an item in the layout.
 */
export
function compactItem (compareWith : Layout, l : LayoutItem, verticalCompact : boolean) : LayoutItem {

    if (verticalCompact) {
        // Move the element up as far as it can go without colliding.
        while (l.y > 0 && !getFirstCollision(compareWith, l)) {
            l.y--;
        }
    }

    // Move it down, and keep moving it down if it's colliding.
    let collides;
    while((collides = getFirstCollision(compareWith, l))) {
        l.y = collides.y + collides.h;
    }

    return l;
}

/**
 * Given a layout, make sure all elements fit within its bounds.
 *
 * @param  {Array} layout Layout array.
 * @param  {Number} bounds Number of columns.
 */
export
function correctBounds (layout : Layout, bounds : { cols : number }) : Layout {

    const collidesWith = getStatics(layout);

    for (let i = 0, len = layout.length; i < len; i++) {
        const l = layout[i];

        // If it overflows right
        if ((l.x + l.w) > bounds.cols) l.x = (bounds.cols - l.w);

        // If it overflows left
        if (l.x < 0) {
            l.x = 0;
            l.w = bounds.cols;
        }

        if (!l.static)
            collidesWith.push(l);
        else {
            // If this is static and collides with other statics, we must move it down.
            // We have to do something nicer than just letting them overlap.
            while(getFirstCollision(collidesWith, l)) {
                l.y++;
            }
        }
    }

    return layout;
}

// REVIEW: A dictionary may be better than this function.
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

/**
 * Returns the first item this layout collides with.
 * It doesn't appear to matter which order we approach this from, although
 * perhaps that is the wrong thing to do.
 *
 * @param  {Object} layoutItem Layout item.
 * @return {Object|undefined}  A colliding layout item, or undefined.
 */
export
function getFirstCollision (layout : Layout, layoutItem : LayoutItem): LayoutItem | null {
    for (let i : number = 0, len : number = layout.length; i < len; i++) {
        if (collides(layout[i], layoutItem)) return layout[i];
    }
    return null;
}

export
function getAllCollisions (layout : Layout, layoutItem : LayoutItem) : Array<LayoutItem> {
    return layout.filter((l) => collides(l, layoutItem));
}

/**
 * Get all static elements.
 * @param  {Array} layout Array of layout objects.
 * @return {Array}        Array of static layout items..
 */
export
function getStatics (layout : Layout) : Array<LayoutItem> {
    return layout.filter((l) => l.static);
}

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
export
function moveElement (layout : Layout, l : LayoutItem, x? : number, y? : number, isUserAction? : boolean) : Layout {

    if (l.static) return layout;

    // Short-circuit if nothing to do.
    //if (l.y === y && l.x === x) return layout;

    const movingUp = y && l.y > y;

    // This is quite a bit faster than extending the object
    if (typeof l.x === 'undefined') l.x = x || 0;
    if (typeof l.y === 'undefined') l.y = y || 0;
    l.moved = true;

    // If this collides with anything, move it.
    // When doing this comparison, we have to sort the items we compare with
    // to ensure, in the case of multiple collisions, that we're getting the
    // nearest collision.
    let sorted = sortLayoutItemsByRowCol(layout);
    if (movingUp) sorted = sorted.reverse();
    const collisions = getAllCollisions(sorted, l);

    // Move each item that collides away from this element.
    for (let i = 0, len = collisions.length; i < len; i++) {
        const collision = collisions[i];

        // Short circuit so we can't infinite loop
        if (collision.moved) continue;

        // This makes it feel a bit more precise by waiting to swap for just a bit when moving up.
        if (l.y > collision.y && l.y - collision.y > collision.h / 4) continue;

        // Don't move static items - we have to move *this* element away
        if (collision.static) {
            layout = moveElementAwayFromCollision(layout, collision, l, isUserAction);
        } else {
            layout = moveElementAwayFromCollision(layout, l, collision, isUserAction);
        }
    }

    return layout;
}

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
export
function moveElementAwayFromCollision (layout : Layout, collidesWith : LayoutItem, itemToMove : LayoutItem, isUserAction? : boolean) : Layout {

    // If there is enough space above the collision to put this element, move it there.
    // We only do this on the main collision as this can get funky in cascades and cause
    // unwanted swapping behavior.
    if (isUserAction) {
        // Make a mock item so we don't modify the item here, only modify in moveElement.
        const fakeItem: LayoutItem = {
            x: itemToMove.x,
            y: itemToMove.y,
            w: itemToMove.w,
            h: itemToMove.h,
            i: '-1'
        };

        fakeItem.y = Math.max(collidesWith.y - itemToMove.h, 0);

        if (!getFirstCollision(layout, fakeItem))
            return moveElement(layout, itemToMove, undefined, fakeItem.y);
    }

    // Previously this was optimized to move below the collision directly, but this can cause problems
    // with cascading moves, as an item may actually leapflog a collision and cause a reversal in order.
    return moveElement(layout, itemToMove, undefined, itemToMove.y + 1);
}

// REVIEW: Is this really necessary?
/**
 * Helper to convert a number to a percentage string.
 *
 * @param  {Number} num Any number
 * @return {String}     That number as a percentage.
 */
export
function perc (num : number) : string {
    return ((num * 100) + '%');
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
function setTopLeft (top : number, left : number, width : number, height : number): Object {
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


/**
 * Get layout items sorted from top left to right and down.
 *
 * @return {Array} Array of layout objects.
 * @return {Array}        Layout, sorted static items first.
 */
export
function sortLayoutItemsByRowCol (layout : Layout) : Layout {
    let ret : Layout = [];
    return ret.concat(layout).sort(function(a, b) {
        if (a.y > b.y || (a.y === b.y && a.x > b.x)) {
            return 1;
        }
        return -1;
    });
}

// REVIEW: Is this necessary if you use TypeScript?
/**
 * Validate a layout. Throws errors.
 *
 * @param  {Array}  layout        Array of layout items.
 * @param  {String} [contextName] Context name for errors.
 * @throw  {Error}                Validation error.
 */
// export
// function validateLayout (layout : Layout, contextName : string) : void {

//     contextName = contextName || "Layout";

//     const subProps = ['x', 'y', 'w', 'h'];

//     if (!Array.isArray(layout))
//         throw new Error(contextName + " must be an array!");

//     for (let i : number = 0, len : number = layout.length; i < len; i++) {

//         const item = layout[i];
//         for (let j : number = 0; j < subProps.length; j++) {
//             if (typeof item[subProps[j]] !== 'number')
//                 throw new Error('VueGridLayout: ' + contextName + '[' + i + '].' + subProps[j] + ' must be a number!');
//         }

//         if (item.i && typeof item.i !== 'string')
//             throw new Error('VueGridLayout: ' + contextName + '[' + i + '].i must be a string!');

//         if (item.static !== undefined && typeof item.static !== 'boolean')
//             throw new Error('VueGridLayout: ' + contextName + '[' + i + '].static must be a boolean!');

//     }
// }

// REVIEW: I don't think this is necessary at all. This is React stuff.
// export
// function autoBindHandlers (el : Object, fns : Array<string>) : void {
//     fns.forEach((key) => el[key] = el[key].bind(el));
// }

// REVIEW: Is this necessary?
/**
 * Convert a JS object to CSS string. Similar to React's output of CSS.
 * @param obj
 * @returns {string}
 */
// export
// function createMarkup (obj : object) : string {
//     let keys = Object.keys(obj);
//     if (!keys.length) return '';
//     let i : number, len : number = keys.length;
//     let result : string = '';

//     for (i = 0; i < len; i++) {
//         let key = keys[i];
//         let val = obj[key];
//         result += hyphenate(key) + ':' + addPx(key, val) + ';';
//     }

//     return result;
// }


/* The following list is defined in React's core */
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

/**
 * Will add px to the end of style values which are Numbers.
 * @param name
 * @param value
 * @returns {*}
 */
export
function addPx (name : string, value : number) : string {
    if ((name in IS_UNITLESS) && IS_UNITLESS[name]) {
        return (value + 'px');
    } else {
        return value.toString();
    }
}

export
const hyphenateRE = /([a-z\d])([A-Z])/g;

/**
 * Hyphenate a camelCase string.
 *
 * @param {String} str
 * @return {String}
 */
export
function hyphenate (str : string) {
    return str.replace(hyphenateRE, '$1-$2').toLowerCase();
}

// REVIEW: Usage. This might be a candidate for replacement with a dictionary.
// REVIEW: ... or just deletion.
// export
// function findItemInArray (array, property, value) {
//     for (let i : number = 0; i < array.length; i++)
//         if (array[i][property] == value)
//             return true;

//     return false;
// }

// export
// function findAndRemove(array, property, value) {
//     array.forEach(function (result, index) {
//         if (result[property] === value) {
//             //Remove from array
//             array.splice(index, 1);
//         }
//     });
// }