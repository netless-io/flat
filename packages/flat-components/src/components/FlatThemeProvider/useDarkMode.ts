import { useState } from "react";
import { useIsomorphicLayoutEffect } from "react-use";

export type FlatPrefersColorScheme = "auto" | "dark" | "light";

export function useDarkMode(prefersColorScheme?: FlatPrefersColorScheme): boolean {
    const [darkMode, setDarkMode] = useState(prefersColorScheme === "dark");

    useIsomorphicLayoutEffect(() => {
        if (prefersColorScheme === "auto") {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
            if (prefersDark) {
                setDarkMode(prefersDark.matches);
                const handler = (evt: MediaQueryListEvent): void => setDarkMode(evt.matches);
                prefersDark.addListener(handler);
                return () => prefersDark.removeListener(handler);
            }
            return;
        } else {
            setDarkMode(prefersColorScheme === "dark");
            return;
        }
    }, [prefersColorScheme]);

    return darkMode;
}
