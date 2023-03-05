import { useCallback, useEffect, useRef, useState } from "react";
import { listen } from "@wopjs/dom";
import { noop } from "lodash-es";

export interface Draggable {
    readonly isDragging: boolean;
    readonly makeDraggable: (div: HTMLDivElement | null) => void;
}

export function useDraggable(): Draggable {
    const [div, makeDraggable] = useState<HTMLDivElement | null>(null);
    const start = useRef<[x: number, left: number] | undefined>();
    const [isDragging, setDragging] = useState(false);

    useEffect(() => {
        if (div) {
            let stopListenMove = noop;

            const stopListenDown = listen(div, "pointerdown", ev => {
                const classList = (ev.target as HTMLElement | null)?.classList;
                const isAvatar =
                    classList?.contains("video-avatar") ||
                    classList?.contains("video-avatar-absent");
                // is dragging avatar, not the buttons on it
                if (isAvatar && ev.pointerType === "mouse" && ev.isPrimary && ev.button === 0) {
                    div.setPointerCapture(ev.pointerId);
                    start.current = [ev.clientX, div.scrollLeft];
                    setDragging(true);

                    stopListenMove = listen(div, "pointermove", ev => {
                        if (ev.isPrimary && start.current) {
                            const dx = ev.clientX - start.current[0];
                            div.scrollLeft = start.current[1] - dx;
                        }
                    });
                }
            });

            const onPointerUp = (ev: PointerEvent): void => {
                div.releasePointerCapture(ev.pointerId);
                start.current = undefined;
                setDragging(false);
                stopListenMove();
                stopListenMove = noop;
            };
            const stopListenUp = listen(div, "pointerup", onPointerUp);
            const stopListenCancel = listen(div, "pointercancel", onPointerUp);

            return () => {
                stopListenDown();
                stopListenMove();
                stopListenUp();
                stopListenCancel();
            };
        }
        return;
    }, [div]);

    return { isDragging, makeDraggable };
}

export interface Scrollable {
    readonly isScrollable: boolean;
    readonly makeScrollable: (div: HTMLDivElement | null) => void;
    readonly scrollLeft: (ev: React.MouseEvent) => void;
    readonly scrollRight: (ev: React.MouseEvent) => void;
}

export function useScrollable(): Scrollable {
    const [div, makeScrollable] = useState<HTMLDivElement | null>(null);
    const [isScrollable, setScrollable] = useState(false);

    useEffect(() => {
        if (div) {
            let isHorizontal = false;
            let timer = 0;
            // translate mouse wheel to scroll left/right
            const stopListenWheel = listen(
                div,
                "wheel",
                ev => {
                    if (ev.deltaX !== 0) {
                        isHorizontal = true;
                        clearTimeout(timer);
                        timer = window.setTimeout(() => {
                            isHorizontal = false;
                        }, 2000);
                    }
                    if (!isHorizontal) {
                        ev.preventDefault();
                        div.scrollLeft += ev.deltaY * (ev.deltaMode === 1 ? 18 : 1);
                    }
                },
                { passive: false },
            );
            const observer = new ResizeObserver(() => {
                const { scrollWidth, clientWidth } = div;
                setScrollable(scrollWidth > clientWidth);
            });
            observer.observe(div);
            return () => {
                stopListenWheel();
                observer.disconnect();
            };
        }
        return;
    }, [div]);

    const DISTANCE = 152;

    const scrollLeft = useCallback(
        (ev: React.MouseEvent) =>
            div?.scrollBy({
                left: -(ev.shiftKey ? 5 : 1) * DISTANCE,
                behavior: "smooth",
            }),
        [div],
    );

    const scrollRight = useCallback(
        (ev: React.MouseEvent) =>
            div?.scrollBy({
                left: (ev.shiftKey ? 5 : 1) * DISTANCE,
                behavior: "smooth",
            }),
        [div],
    );

    return { isScrollable, makeScrollable, scrollLeft, scrollRight };
}
