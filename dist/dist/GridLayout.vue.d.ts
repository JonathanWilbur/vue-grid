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
}
