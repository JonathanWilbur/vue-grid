import { Vue } from "vue-property-decorator";
import { LayoutItem } from "./utils";
import GridItemComponent from "./GridItem.vue";
export default class ResponsiveGridLayoutComponent extends Vue {
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
    $children: GridItemComponent[];
    originalCols?: number;
    width?: number;
    mergedStyle: object;
    lastLayoutLength: number;
    $refs: {
        item: HTMLElement;
    };
    beforeDestroy(): void;
    mounted(): void;
    onWidthChange(): void;
    onLayoutChange(): void;
    onWindowResize(): void;
    updateHeight(): void;
    containerHeight(): string;
    dragEvent(eventName: string, id: string, x: number, y: number): void;
    resizeEvent(eventName: string, id: string, x: number, y: number): void;
}
