import { Vue } from "vue-property-decorator";
import { LayoutItem } from "./utils";
export default class GridLayoutComponent extends Vue {
    eventBus: Vue;
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
    layout: LayoutItem[];
    width: number;
    mergedStyle: object;
    lastLayoutLength: number;
    isDragging: boolean;
    isResizing: boolean;
    placeholder: {
        x: number;
        y: number;
        w: number;
        h: number;
        i: string;
    };
    $refs: {
        item: HTMLElement;
    };
    created(): void;
    mounted(): void;
    onWidthChange(): void;
    layoutUpdate(): void;
    onWindowResize(): void;
    readonly height: number;
    dragEvent(eventName: string, id: string, x: number, y: number, h: number, w: number): void;
    resizeEvent(eventName: string, id: string, x: number, y: number, h: number, w: number): void;
}
