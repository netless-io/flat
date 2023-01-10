/**
 * Make avatars row draggable. Put this function in the div's `ref`.
 * It will update the `scrollLeft` when the user drags the avatars.
 */
export function makeDraggable(div: HTMLDivElement | null): void {
    type DraggableElement = { __draggable?: () => void };

    if (div === null) {
        return;
    }

    (div as DraggableElement).__draggable?.();

    let start: [x: number, left: number] | undefined;

    div.style.cursor = "grab";

    const onPointerDown = (ev: PointerEvent): void => {
        // is dragging avatar, not the buttons on it
        const isAvatar = (ev.target as HTMLElement).classList?.contains("video-avatar");
        if (isAvatar && ev.pointerType === "mouse" && ev.isPrimary && ev.button === 0) {
            div.setPointerCapture(ev.pointerId);
            start = [ev.clientX, div.scrollLeft];
            div.style.cursor = "grabbing";
        }
    };

    div.addEventListener("pointerdown", onPointerDown);

    const onPointerMove = (ev: PointerEvent): void => {
        if (ev.isPrimary && start) {
            const dx = ev.clientX - start[0];
            div.scrollLeft = start[1] - dx;
        }
    };

    div.addEventListener("pointermove", onPointerMove);

    const onPointerUp = (ev: PointerEvent): void => {
        div.releasePointerCapture(ev.pointerId);
        start = undefined;
        div.style.cursor = "grab";
    };

    div.addEventListener("pointerup", onPointerUp);
    div.addEventListener("pointercancel", onPointerUp);

    (div as DraggableElement).__draggable = () => {
        start = undefined;
        div.removeEventListener("pointerdown", onPointerDown);
        div.removeEventListener("pointermove", onPointerMove);
        div.removeEventListener("pointerup", onPointerUp);
        div.removeEventListener("pointercancel", onPointerUp);
        div.style.cursor = "";
    };
}
