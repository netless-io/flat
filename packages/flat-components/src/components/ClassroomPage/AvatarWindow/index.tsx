import "./style.less";

import React, { useEffect, useRef } from "react";
import classNames from "classnames";
import { listen } from "@wopjs/dom";

const preventEvent = (ev: React.UIEvent | Event): void => {
    ev.stopPropagation();
    if (ev.cancelable) {
        ev.preventDefault();
    }
};

export interface AvatarWindowProps {
    mode: "normal" | "maximized";
    rect: Rectangle;
    zIndex?: number;
    readonly?: boolean;
    onClick?: () => void;
    onResize?: (newRectangle: Rectangle, handle?: ResizeHandle) => void;
    onDoubleClick?: () => void;
    onDragging?: (ev: PointerEvent) => void;
    onDragEnd?: (ev: PointerEvent) => void;
}

export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export type ResizeHandle = "" | "n" | "s" | "w" | "e" | "nw" | "ne" | "sw" | "se";

export const AvatarWindow: React.FC<AvatarWindowProps> = ({
    mode,
    rect,
    zIndex,
    readonly,
    children,
    onClick,
    onResize,
    onDoubleClick,
    onDragging,
    onDragEnd,
}) => {
    const lastClick = useRef({ t: 0, x: -100, y: -100 });
    const disposers = useRef<Array<() => void>>([]);

    useEffect(
        () => () => {
            disposers.current.forEach(dispose => dispose());
            disposers.current = [];
        },
        [],
    );

    const handleTrackStart = (ev: React.PointerEvent<HTMLDivElement>): void => {
        if (!ev.isPrimary || readonly || ev.button !== 0) {
            return;
        }

        const target = ev.target as HTMLElement;
        // filter out events on buttons, which should be handled by the button itself
        for (
            let node: HTMLElement | null = target;
            node && node !== ev.currentTarget;
            node = node.parentElement
        ) {
            if (node.tagName === "BUTTON") {
                return;
            }
        }

        const now = Date.now();
        if (now - lastClick.current.t <= 500) {
            if (
                Math.abs(lastClick.current.x - ev.clientX) <= 5 &&
                Math.abs(lastClick.current.y - ev.clientY) <= 5
            ) {
                onDoubleClick?.();
            }
            return;
        }
        lastClick.current = { t: now, x: ev.clientX, y: ev.clientY };

        const main = ev.currentTarget.parentElement as HTMLElement;
        preventEvent(ev);
        target.setPointerCapture(ev.pointerId);
        main.classList.add("window-grabbing");

        const trackingHandle = target.dataset?.windowHandle as ResizeHandle | undefined;
        const { pageX: trackStartPageX, pageY: trackStartPageY } = ev;

        const handleTracking = (ev: PointerEvent): void => {
            if (!ev.isPrimary || readonly) {
                return;
            }

            preventEvent(ev);

            const { pageX, pageY } = ev;
            const offsetX = pageX - trackStartPageX;
            const offsetY = pageY - trackStartPageY;

            let { x: newX, y: newY, width: newWidth, height: newHeight } = rect;

            switch (trackingHandle) {
                case "n": {
                    newY = rect.y + offsetY;
                    newHeight = rect.height - offsetY;
                    break;
                }
                case "s": {
                    newHeight = rect.height + offsetY;
                    break;
                }
                case "w": {
                    newX = rect.x + offsetX;
                    newWidth = rect.width - offsetX;
                    break;
                }
                case "e": {
                    newWidth = rect.width + offsetX;
                    break;
                }
                case "nw": {
                    newX = rect.x + offsetX;
                    newY = rect.y + offsetY;
                    newWidth = rect.width - offsetX;
                    newHeight = rect.height - offsetY;
                    break;
                }
                case "ne": {
                    newY = rect.y + offsetY;
                    newWidth = rect.width + offsetX;
                    newHeight = rect.height - offsetY;
                    break;
                }
                case "sw": {
                    newX = rect.x + offsetX;
                    newWidth = rect.width - offsetX;
                    newHeight = rect.height + offsetY;
                    break;
                }
                case "se": {
                    newWidth = rect.width + offsetX;
                    newHeight = rect.height + offsetY;
                    break;
                }
                default: {
                    newX = rect.x + offsetX;
                    newY = rect.y + offsetY;
                    break;
                }
            }

            onDragging?.(ev);
            onResize?.({ x: newX, y: newY, width: newWidth, height: newHeight }, trackingHandle);
        };

        const handleTrackEnd = (ev: PointerEvent): void => {
            if (!ev.isPrimary) {
                return;
            }

            target.releasePointerCapture(ev.pointerId);
            preventEvent(ev);
            onDragEnd?.(ev);

            disposers.current.forEach(dispose => dispose());
            disposers.current = [];
        };

        disposers.current.push(
            () => main.classList.remove("window-grabbing"),
            listen(window, "pointermove", handleTracking, { passive: false }),
            listen(window, "pointerup", handleTrackEnd, { passive: false }),
            listen(window, "pointercancel", handleTrackEnd, { passive: false }),
        );
    };

    return (
        <div
            className={classNames("window", {
                "window-readonly": readonly,
                "window-maximized": mode === "maximized",
            })}
            draggable={!readonly && mode === "maximized"}
            style={
                mode === "normal"
                    ? {
                          position: "absolute",
                          // Prevent a rendering issue on Chrome when set transform to sub-pixel values
                          width: rect.width | 0,
                          height: rect.height | 0,
                          transform: `translate(${rect.x | 0}px,${rect.y | 0}px)`,
                          zIndex: zIndex,
                      }
                    : undefined
            }
        >
            <div className="window-main" onClick={onClick} onPointerDown={handleTrackStart}>
                {children}
            </div>
            <div className="window-resize-handles" onPointerDown={handleTrackStart}>
                <div className="window-n window-resize-handle" data-window-handle="n" />
                <div className="window-s window-resize-handle" data-window-handle="s" />
                <div className="window-w window-resize-handle" data-window-handle="w" />
                <div className="window-e window-resize-handle" data-window-handle="e" />
                <div className="window-nw window-resize-handle" data-window-handle="nw" />
                <div className="window-ne window-resize-handle" data-window-handle="ne" />
                <div className="window-sw window-resize-handle" data-window-handle="sw" />
                <div className="window-se window-resize-handle" data-window-handle="se" />
            </div>
        </div>
    );
};

const clamp = (value: number, min: number, max: number): number =>
    value < min ? min : value > max ? max : value;

export const fixRect = (
    input: Rectangle,
    handle: ResizeHandle | undefined,
    ratio: number,
    minWidth: number,
    maxWidth: number,
    maxHeight: number,
): Rectangle => {
    const { x, y, width, height } = input;

    // Keep the ratio
    const fixedWidth = height / ratio;
    const fixedHeight = width * ratio;
    let newRect: Rectangle;
    if (!handle || handle === "e" || handle === "w") {
        newRect = { x, y, width, height: fixedHeight };
    } else if (handle === "s" || handle === "n") {
        newRect = { x, y, width: fixedWidth, height };
    } else if (fixedHeight < height) {
        const newY = handle === "ne" || handle === "nw" ? y + height - fixedHeight : y;
        newRect = { x, y: newY, width, height: fixedHeight };
    } else {
        const newX = handle === "nw" || handle === "sw" ? x + width - fixedWidth : x;
        newRect = { x: newX, y, width: fixedWidth, height };
    }

    // Clamp size
    if (!(minWidth <= newRect.width && newRect.width <= maxWidth && newRect.height <= maxHeight)) {
        const newWidth = clamp(newRect.width, minWidth, Math.min(maxWidth, maxHeight / ratio));
        const newHeight = newWidth * ratio;
        if (handle === "w" || handle === "sw" || handle === "nw") {
            newRect.x = x + width - newWidth;
        }
        if (handle === "n" || handle === "ne" || handle === "nw") {
            newRect.y = y + height - newHeight;
        }
        newRect.width = newWidth;
        newRect.height = newHeight;
    }

    // Clamp position
    newRect.x = clamp(newRect.x, 0, maxWidth - newRect.width);
    newRect.y = clamp(newRect.y, 0, maxHeight - newRect.height);

    return newRect;
};
