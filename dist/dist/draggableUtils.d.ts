import { InteractEvent } from "interactjs";
export declare function getControlPosition(evt: InteractEvent): {
    x: number;
    y: number;
};
export declare type CoreData = {
    x: number;
    y: number;
    lastX: number;
    lastY: number;
    deltaX: number;
    deltaY: number;
};
export declare function createCoreData(lastX: number, lastY: number, x: number, y: number): CoreData;
