import { InteractEvent } from "interactjs";

// TODO: These imports are only used by GridItem, so they could be made methods of that.

// Get {x, y} positions from event.
export
function getControlPosition (evt : InteractEvent) : { x : number, y : number } {
    const offsetParent = ((evt.target ? (<HTMLElement>evt.target).offsetParent : false) || document.body);
    const offsetParentRect = (<HTMLElement>evt.target).offsetParent === document.body ? { left: 0, top: 0 } : offsetParent.getBoundingClientRect();
    return {
        x: (evt.clientX + offsetParent.scrollLeft - offsetParentRect.left),
        y: (evt.clientY + offsetParent.scrollTop - offsetParentRect.top)
    };
}

// TODO: Could you omit the deltas, or make them properties, or create them from a constructor?
export
type CoreData = {
    x : number,
    y : number,
    lastX : number,
    lastY : number,
    deltaX : number,
    deltaY : number
};

// Create an data object exposed by <DraggableCore>'s events
export
function createCoreData (lastX : number, lastY : number, x : number, y : number) : CoreData {
    if (isNaN(lastX) || isNaN(lastY)) { // If this is our first move
        return {
            deltaX: 0,
            deltaY: 0,
            lastX: x,
            lastY: y,
            x: x,
            y: y
        };
    } else {
        return {
            deltaX: (x - lastX),
            deltaY: (y - lastY),
            lastX: lastX,
            lastY: lastY,
            x: x,
            y: y
        };
    }
}