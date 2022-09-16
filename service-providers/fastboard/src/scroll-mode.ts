import type { AnimationMode, Camera, Size, ViewMode } from "white-web-sdk";
import type { Storage, SyncedStore, WindowManager } from "@netless/fastboard";
import type { IServiceWhiteboardEvents } from "@netless/flat-services";

import { SideEffectManager } from "side-effect-manager";
import { combine, derive, ReadonlyVal, Val } from "value-enhancer";

// Helper function to write enum literals.
function enumLiteral<T extends string>(value: `${T}`): T {
    return value as T;
}

function clamp(x: number, min: number, max: number): number {
    return x < min ? min : x > max ? max : x;
}

const BASE_WIDTH = 1600;
const BASE_HEIGHT = BASE_WIDTH * 3;

export type ScrollStorageData = {
    /** Logical pixel on whiteboard based on BASE_WIDTH */
    scrollTop: number;
};

export class ScrollMode {
    public readonly sideEffect = new SideEffectManager();

    public readonly storage: Storage<ScrollStorageData>;

    public readonly _page$: ReadonlyVal<number>;

    private readonly _root$: Val<HTMLElement | null>;
    private readonly _whiteboard$: ReadonlyVal<HTMLElement | null>;
    private readonly _size$: Val<Size>;
    private readonly _scale$: ReadonlyVal<number>;
    private readonly _scrollTop$: Val<number>;

    public get root(): HTMLElement | null {
        return this._root$.value;
    }

    public get scrollTop(): number {
        return this._scrollTop$.value;
    }

    public get page(): number {
        return this._page$.value;
    }

    public setRoot(root: HTMLElement): void {
        this._root$.setValue(root);
    }

    public constructor(
        public readonly fastboard: { manager: WindowManager; syncedStore: SyncedStore },
        public readonly events: IServiceWhiteboardEvents,
    ) {
        this._root$ = new Val<HTMLElement | null>(null);

        if (process.env.NODE_ENV !== "production") {
            (window as any).scrollMode = this;
        }

        // 1. Turn off the default camera syncing behavior.
        this.sideEffect.add(() => {
            fastboard.manager.setViewMode(enumLiteral<ViewMode>("freedom"));
            return () => fastboard.manager.setViewMode(enumLiteral<ViewMode>("broadcaster"));
        });

        // 2. scrollTop$ = writable(0)
        this.storage = fastboard.syncedStore.connectStorage<ScrollStorageData>("scroll", {
            scrollTop: 0,
        });
        const scrollTop$ = new Val(this.storage.state.scrollTop);
        this._scrollTop$ = scrollTop$;
        this.sideEffect.push(
            this.storage.on("stateChanged", () => {
                scrollTop$.setValue(this.storage.state.scrollTop);
            }),
        );

        // 3. size$ = from(view.onSizeUpdated)
        const size$ = new Val<Size>(
            { width: 0, height: 0 },
            { compare: (a, b) => a.width === b.width && a.height === b.height },
        );
        this._size$ = size$;
        this.sideEffect.add(() => {
            const onSizeUpdated = (size: Size): void => {
                size$.setValue(size);
            };
            fastboard.manager.mainView.callbacks.on("onSizeUpdated", onSizeUpdated);
            return () => fastboard.manager.mainView.callbacks.off("onSizeUpdated", onSizeUpdated);
        });

        this.sideEffect.add(() => {
            const onCameraUpdated = (camera: Camera): void => {
                const halfWbHeight = this._size$.value.height / 2 / this._scale$.value;
                const scrollTop = camera.centerY;
                this.storage.setState({
                    scrollTop: clamp(scrollTop, halfWbHeight, BASE_HEIGHT - halfWbHeight),
                });
                this.events.emit("userScroll");
            };
            fastboard.manager.mainView.callbacks.on("onCameraUpdatedByDevice", onCameraUpdated);
            return () =>
                fastboard.manager.mainView.callbacks.off(
                    "onCameraUpdatedByDevice",
                    onCameraUpdated,
                );
        });

        // 4. scale$ = size$.width / BASE_WIDTH
        const scale$ = derive(size$, size => size.width / BASE_WIDTH);
        this._scale$ = scale$;

        const page$ = new Val(0);
        this.sideEffect.push(
            combine([scrollTop$, size$, scale$]).subscribe(([scrollTop, size, scale]) => {
                if (scale > 0) {
                    const wbHeight = size.height / scale;
                    page$.setValue(Math.max(scrollTop / wbHeight - 0.5, 0));
                    this.events.emit("scrollPage", page$.value);
                }
            }),
        );
        this._page$ = page$;

        // 5. bound$ = { contentMode: () => scale$, centerX: W / 2, centerY: H / 2, width: W, height: H }
        this.sideEffect.push(
            combine([scrollTop$, scale$]).subscribe(([scrollTop, scale]) => {
                this.updateBound(scrollTop, size$.value, scale);
            }),
        );

        // 6. $: scrollTo(scrollTop$)
        this.sideEffect.push(
            scrollTop$.subscribe(scrollTop => {
                fastboard.manager.mainView.moveCamera({
                    centerY: scrollTop,
                    animationMode: enumLiteral<AnimationMode>("immediately"),
                });
            }),
        );

        // 7. onwheel = () => { scrollTop$ += deltaY }
        const whiteboard$ = derive(this._root$, this.getWhiteboardElement);
        this._whiteboard$ = whiteboard$;
        this.sideEffect.push(
            whiteboard$.reaction(el => {
                if (el?.parentElement) {
                    this.sideEffect.addEventListener(
                        el.parentElement,
                        "wheel",
                        this.onWheel,
                        { capture: true, passive: false },
                        "wheel",
                    );
                }
            }),
        );

        this.sideEffect.push(
            scale$.reaction(scale => {
                if (scale > 0) {
                    this.sideEffect.flush("initScroll");
                    // XXX: wait window-manager's sync behavior then we reset the camera
                    this.sideEffect.setTimeout(this.initScroll, 0);
                }
            }),
            "initScroll",
        );
    }

    private initScroll = (): void => {
        const halfWbHeight = this._size$.value.height / 2 / this._scale$.value;
        const scrollTop = this._scrollTop$.value;
        // HACK: set a different value (+0.01) to trigger all effects above
        this._scrollTop$.setValue(
            clamp(scrollTop, halfWbHeight, BASE_HEIGHT - halfWbHeight) - 0.01,
        );
        this.events.emit("maxScrollPage", (BASE_HEIGHT - halfWbHeight) / halfWbHeight / 2 - 0.51);
    };

    private updateBound(scrollTop: number, { height }: Size, scale: number): void {
        if (scale > 0) {
            const { fastboard } = this;

            fastboard.manager.mainView.moveCameraToContain({
                originX: 0,
                originY: scrollTop,
                width: BASE_WIDTH,
                height: height / scale,
                animationMode: enumLiteral<AnimationMode>("immediately"),
            });

            fastboard.manager.mainView.setCameraBound({
                damping: 1,
                maxContentMode: () => scale,
                minContentMode: () => scale,
                centerX: BASE_WIDTH / 2,
                centerY: BASE_HEIGHT / 2,
                width: BASE_WIDTH,
                height: BASE_HEIGHT,
            });
        }
    }

    public dispose(): void {
        this.sideEffect.flushAll();
    }

    private getWhiteboardElement = (root: HTMLElement | null): HTMLElement | null => {
        const className = ".netless-window-manager-main-view";
        return root && root.querySelector(className);
    };

    private onWheel = (ev: WheelEvent): void => {
        const target = ev.target as HTMLElement | null;
        if (this.fastboard.manager.canOperate && this._whiteboard$.value?.contains(target)) {
            ev.preventDefault();
            ev.stopPropagation();
            const dy = ev.deltaY || 0;
            const { width } = this._size$.value;
            if (dy && width > 0) {
                const halfWbHeight = this._size$.value.height / 2 / this._scale$.value;
                const scrollTop = this._scrollTop$.value + dy / this._scale$.value;
                this.storage.setState({
                    scrollTop: clamp(scrollTop, halfWbHeight, BASE_HEIGHT - halfWbHeight),
                });
                this.events.emit("userScroll");
            }
        }
    };
}
