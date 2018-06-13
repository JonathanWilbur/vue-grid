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
    beforeDestroy(): void;
    mounted(): void;
    onWidthChange(): void;
    layoutUpdate(): void;
    updateHeight(): void;
    onWindowResize(): void;
    containerHeight(): string;
    dragEvent(eventName: string, id: string, x: number, y: number, h: number, w: number): void;
    resizeEvent(eventName: string, id: string, x: number, y: number, h: number, w: number): void;
}
