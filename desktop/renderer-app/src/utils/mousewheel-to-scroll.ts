import type { AnimationMode, WindowManager } from "@netless/window-manager";

// Let mouse wheel act as scrolling the whiteboard
export function mousewheelToScroll(root: HTMLElement, manager: WindowManager): () => void {
    const listener = (ev: Event): void => {
        ev.preventDefault();
        ev.stopPropagation();
        const dy = (ev as WheelEvent).deltaY || 0;
        manager.moveCamera({
            centerY: manager.camera.centerY + dy * manager.camera.scale,
            animationMode: "immediately" as AnimationMode.Immediately,
        });
    };
    root.addEventListener("wheel", listener, true);
    return () => root.removeEventListener("wheel", listener, true);
}
