import { useEffect, useState } from "react";

export const MaxWidthMobile = 660;
export const MaxWidthTablet = 1200;

type BreakpointType = "mobile" | "tablet" | "desktop";

function getType(width: number): BreakpointType {
    return width < MaxWidthMobile ? "mobile" : width < MaxWidthTablet ? "tablet" : "desktop";
}

export function onBreakpoint(callback: (type: BreakpointType) => void): () => void {
    let lastType: BreakpointType = getType(window.innerWidth);
    callback(lastType);
    let timer = NaN;
    function onresize(): void {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
            const newType = getType(window.innerWidth);
            if (lastType !== newType) {
                lastType = newType;
                callback(newType);
            }
        }, 10);
    }
    window.addEventListener("resize", onresize);
    return () => {
        window.clearTimeout(timer);
        window.removeEventListener("resize", onresize);
    };
}

/**
 * @example
 * const isMobile = useBreakpoint('mobile');
 */
export function useBreakpoint(type: BreakpointType): boolean {
    const [isType, setType] = useState(() => getType(window.innerWidth) === type);
    useEffect(
        () =>
            onBreakpoint(currentType => {
                setType(type === currentType);
            }),
        [type],
    );
    return isType;
}
