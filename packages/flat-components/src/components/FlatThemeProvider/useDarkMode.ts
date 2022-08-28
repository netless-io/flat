import { useState } from "react";
import { useIsomorphicLayoutEffect } from "react-use";

export type FlatPrefersColorScheme = "auto" | "dark" | "light";

const prefersDark = /* @__PURE__ */ window.matchMedia("(prefers-color-scheme: dark)");

export function useDarkMode(prefersColorScheme?: FlatPrefersColorScheme): boolean {
    const [darkMode, setDarkMode] = useState(() =>
        prefersColorScheme === "auto" && prefersDark
            ? prefersDark.matches
            : prefersColorScheme === "dark",
    );

    useIsomorphicLayoutEffect(() => {
        if (prefersColorScheme === "auto" && prefersDark) {
            setDarkMode(prefersDark.matches);
            const handler = (evt: MediaQueryListEvent): void => setDarkMode(evt.matches);
            prefersDark.addEventListener("change", handler);
            return () => prefersDark.removeEventListener("change", handler);
        } else {
            setDarkMode(prefersColorScheme === "dark");
            return;
        }
    }, [prefersColorScheme]);

    return darkMode;
}
