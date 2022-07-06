import type { FastboardApp } from "@netless/fastboard-react";
import type { AnimationMode } from "@netless/window-manager";

// Let mouse wheel act as scrolling the whiteboard
export function mousewheelToScroll(root: HTMLElement, fastboard: FastboardApp): () => void {
    const $whiteboard = root.querySelector(".netless-window-manager-main-view") as HTMLDivElement;
    if (!$whiteboard) {
        throw new Error("Not found .netless-window-manager-main-view");
    }
    const listener = (ev: Event): void => {
        ev.preventDefault();
        ev.stopPropagation();
        const dy = (ev as WheelEvent).deltaY || 0;
        if (fastboard.writable.value) {
            fastboard.manager.moveCamera({
                centerY: clamp(
                    fastboard.manager.camera.centerY + dy * fastboard.manager.camera.scale,
                    -950,
                    950 + 2100,
                ),
                animationMode: "immediately" as AnimationMode.Immediately,
            });
        }
    };
    $whiteboard.addEventListener("wheel", listener, true);
    return () => $whiteboard.removeEventListener("wheel", listener, true);
}

function clamp(x: number, min: number, max: number): number {
    return x < min ? min : x > max ? max : x;
}
