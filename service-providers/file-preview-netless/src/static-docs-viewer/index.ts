import styles from "./style.css?inline";

import { derive, ReadonlyVal, Val } from "value-enhancer";
import { Disposable } from "side-effect-manager";
import { DocsViewer, DocsViewerPage, PageRenderer, Stepper } from "@netless/app-docs-viewer";
import { IServiceFilePreview, CloudFile, FileResourceType } from "@netless/flat-services";
import { queryConvertingTaskStatus } from "@netless/flat-service-provider-file-convert-netless";
import { ConvertingTaskStatus, Region } from "@netless/flat-server-api";
import { clamp, isSameRect, isSameSize, Rect, Size } from "../utils";

export class StaticDocsViewer implements IServiceFilePreview {
    public disposable = new Disposable();
    public pagesScrollTop$: Val<number>;
    public pages$: Val<DocsViewerPage[]>;
    public pagesSize$: ReadonlyVal<Size>;
    public readonly$: Val<boolean>;

    public pageRenderer: PageRenderer;
    public viewer: DocsViewer;
    public stepper: Stepper;

    public $docsViewer: HTMLElement;

    public constructor(public readonly region: Region) {
        this.readonly$ = new Val(false);
        this.pages$ = new Val<DocsViewerPage[]>([]);
        this.pagesScrollTop$ = new Val(0);
        this.pagesSize$ = derive(
            this.pages$,
            pages => {
                let width = 0;
                let height = 0;
                for (let i = pages.length - 1; i >= 0; i--) {
                    const page = pages[i];
                    if (page.width > width) {
                        width = page.width;
                    }
                    height += page.height;
                }
                return { width: Math.max(1, width), height: Math.max(1, height) };
            },
            { compare: isSameSize },
        );

        const $docsViewer = document.createElement("div");
        this.$docsViewer = $docsViewer;
        $docsViewer.tabIndex = 0;
        $docsViewer.className = "file-preview-netless-container";

        const $style = document.createElement("style");
        $style.textContent = styles;
        $docsViewer.appendChild($style);

        const $body = document.createElement("div");
        $body.className = "file-preview-netless-body";
        $docsViewer.appendChild($body);

        const $operate = document.createElement("div");
        $operate.className = "file-preview-netless-operate";
        $body.appendChild($operate);

        const $footer = document.createElement("div");
        $footer.className = "file-preview-netless-footer";
        $docsViewer.appendChild($footer);

        const getBodyRect = (): Rect => {
            const rect = $body.getBoundingClientRect();
            return {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
            };
        };
        const bodyRect$ = new ReadonlyVal(getBodyRect(), {
            beforeSubscribe: setValue => {
                // ResizeObserver cannot observer DOM in another window,
                // so we measure the size of container at 60FPS.
                let timer = 0;
                function update(): void {
                    timer = requestAnimationFrame(update);
                    setValue(getBodyRect());
                }
                update();
                return () => cancelAnimationFrame(timer);
            },
            compare: isSameRect,
        });

        this.pageRenderer = new PageRenderer({
            pagesScrollTop$: this.pagesScrollTop$,
            containerRect$: bodyRect$,
            pages$: this.pages$,
            pagesSize$: this.pagesSize$,
        });
        $body.appendChild(this.pageRenderer.$pages);

        this.viewer = new DocsViewer({
            readonly$: this.readonly$,
            pagesIndex$: this.pageRenderer._pagesIndex$,
            previewRoot: $body,
            footerRoot: $footer,
            pages$: this.pages$,
            playable: false,
        });

        this.stepper = new Stepper({
            start: this.pagesScrollTop$.value,
            onStep: pageScrollTop => {
                this.pagesScrollTop$.setValue(pageScrollTop);
            },
        });

        this.disposable.push([
            this.viewer.events.on("jumpPage", pageIndex => this.userScrollToPageIndex(pageIndex)),
            this.viewer.events.on("next", () => {
                this.userScrollByPercent(0.8);
            }),
            this.viewer.events.on("back", () => {
                this.userScrollByPercent(-0.8);
            }),
        ]);

        this.disposable.addEventListener(
            $operate,
            "wheel",
            ev => {
                if (!this.readonly$.value && this.stepper.paused) {
                    ev.stopPropagation();
                    ev.preventDefault();
                    this.pagesScrollTop$.setValue(
                        clamp(
                            this.pagesScrollTop$.value + ev.deltaY,
                            0,
                            this.pagesSize$.value.height -
                                bodyRect$.value.height / this.pageRenderer._scale$.value,
                        ),
                    );
                }
            },
            { passive: false },
        );

        let touchStartClientY = NaN;

        this.disposable.addEventListener(
            $operate,
            "touchstart",
            ev => {
                ev.stopPropagation();
                ev.preventDefault();
                if (!this.readonly$.value && ev.touches.length > 0 && this.stepper.paused) {
                    touchStartClientY = ev.touches[0].pageY;
                }
            },
            { passive: false, capture: true },
        );

        this.disposable.addEventListener(
            $operate,
            "touchmove",
            ev => {
                ev.stopPropagation();
                ev.preventDefault();
                if (
                    !this.readonly$.value &&
                    ev.touches.length > 0 &&
                    this.stepper.paused &&
                    !Number.isNaN(touchStartClientY)
                ) {
                    const deltaY = touchStartClientY - ev.touches[0].pageY;
                    touchStartClientY = ev.touches[0].pageY;
                    this.pagesScrollTop$.setValue(
                        clamp(
                            this.pagesScrollTop$.value + deltaY * 3,
                            0,
                            this.pagesSize$.value.height -
                                bodyRect$.value.height / this.pageRenderer._scale$.value,
                        ),
                    );
                }
            },
            { passive: false, capture: true },
        );

        const handleTouchEnd = (ev: TouchEvent): void => {
            ev.stopPropagation();
            ev.preventDefault();
            touchStartClientY = NaN;
        };
        this.disposable.addEventListener($operate, "touchend", handleTouchEnd, {
            passive: false,
            capture: true,
        });
        this.disposable.addEventListener($operate, "touchcancel", handleTouchEnd, {
            passive: false,
            capture: true,
        });

        this.disposable.addEventListener(window, "keyup", ev => {
            if (this.readonly$.value) {
                return;
            }
            switch (ev.key) {
                case "PageDown": {
                    this.userScrollByPercent(0.8);
                    break;
                }
                case "PageUp": {
                    this.userScrollByPercent(-0.8);
                    break;
                }
                case "ArrowLeft": {
                    this.userScrollByPercent(-0.25);
                    break;
                }
                case "ArrowRight": {
                    this.userScrollByPercent(0.25);
                    break;
                }
                case "ArrowDown": {
                    this.userScrollByPercent(0.5);
                    break;
                }
                case "ArrowUp": {
                    this.userScrollByPercent(-0.5);
                    break;
                }
                default: {
                    break;
                }
            }
        });
    }

    private userScrollToPageIndex(index: number): void {
        index = clamp(index, 0, this.pages$.value.length - 1);
        if (!this.readonly$.value && !Number.isNaN(index)) {
            const offsetY = this.pageRenderer.pagesYs[index];
            if (offsetY >= 0) {
                this.stepper.stepTo(offsetY + 5 / this.pageRenderer.scale);
            }
        }
    }

    private userScrollByPercent(percent: number): void {
        if (!this.readonly$.value) {
            this.stepper.stepTo(
                clamp(
                    this.pageRenderer.pagesScrollTop +
                        (this.pageRenderer.containerRect.height / this.pageRenderer.scale) *
                            clamp(percent, -1, 1),
                    0,
                    this.pageRenderer.pagesSize.height -
                        this.pageRenderer.containerRect.height / this.pageRenderer.scale,
                ),
            );
        }
    }

    private mapImagesToPages(
        images: ConvertingTaskStatus["images"],
        previews: ConvertingTaskStatus["previews"],
    ): DocsViewerPage[] {
        images = images || {};
        previews = previews || {};
        const pages: DocsViewerPage[] = [];
        for (const page in images) {
            const { width, height, url } = images[page];
            pages.push({ width, height, src: url, thumbnail: previews[page] });
        }
        return pages;
    }

    public async preview(file: CloudFile, container: HTMLElement): Promise<void> {
        if (
            file.resourceType === FileResourceType.WhiteboardConvert ||
            file.resourceType === FileResourceType.WhiteboardProjector
        ) {
            const result = await queryConvertingTaskStatus({
                dynamic: false,
                resourceType: file.resourceType,
                meta: file.meta,
                region: this.region,
            });

            if (result.images) {
                this.pagesScrollTop$.setValue(0);
                this.pages$.setValue(this.mapImagesToPages(result.images, result.previews));
            } else if (result.progress?.convertedFileList) {
                this.pagesScrollTop$.setValue(0);
                this.pages$.setValue(
                    result.progress.convertedFileList.map(item => ({
                        width: item.width,
                        height: item.height,
                        src: item.conversionFileUrl,
                        thumbnail: item.preview || item.conversionFileUrl,
                    })),
                );
            }

            container.appendChild(this.$docsViewer);
        }
    }

    public async destroy(): Promise<void> {
        this.disposable.flushAll();
        this.$docsViewer.remove();
        this.pagesScrollTop$.destroy();
        this.pages$.destroy();
        this.pagesSize$.destroy();
        this.pageRenderer.destroy();
        this.viewer.destroy();
    }
}
