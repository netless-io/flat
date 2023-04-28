import { useEffect, useState } from "react";

export function useBoundingRect(element: HTMLElement | null): DOMRect | null {
    const [rect, setRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (element) {
            let isMounted = true;
            let rect: DOMRect | null = null;
            let raf = 0;
            const update = (): void => {
                const newRect = element.getBoundingClientRect();
                if (isMounted && !isDOMRectEqual(rect, newRect)) {
                    if (newRect.width === 0) {
                        setRect(null);
                    } else {
                        setRect((rect = newRect));
                    }
                }
                raf = requestAnimationFrame(update);
            };
            raf = requestAnimationFrame(update);
            return () => {
                cancelAnimationFrame(raf);
                isMounted = false;
            };
        } else {
            // setRect(null);
            // keep last rect.
            return;
        }
    }, [element]);

    return rect;
}

// Only care about left, bottom and width now.
function isDOMRectEqual(a: DOMRect | null, b: DOMRect | null): boolean {
    if (a === b) {
        return true;
    }
    if (a === null || b === null) {
        return false;
    }
    return a.left === b.left && a.bottom === b.bottom && a.width === b.width;
}
