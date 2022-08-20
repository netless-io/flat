import "../../theme/index.less";
import React, { FC } from "react";
import classNames from "classnames";
import { useDarkMode, FlatPrefersColorScheme } from "./useDarkMode";
import { useIsomorphicLayoutEffect } from "react-use";

export * from "./useDarkMode";

export const DarkModeContext = /* @__PURE__ */ React.createContext(false);

export interface FlatThemeProviderProps
    extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    prefersColorScheme?: FlatPrefersColorScheme;
}

export const FlatThemeProvider: FC<FlatThemeProviderProps> = ({
    prefersColorScheme = "light",
    className,
    ...restProps
}) => {
    const darkMode = useDarkMode(prefersColorScheme);
    return (
        <DarkModeContext.Provider value={darkMode}>
            <div
                {...restProps}
                className={classNames(
                    "flat-theme-root",
                    { "flat-color-scheme-dark": darkMode },
                    className,
                )}
            />
        </DarkModeContext.Provider>
    );
};

export interface FlatThemeBodyProviderProps {
    prefersColorScheme?: FlatPrefersColorScheme;
}

export const FlatThemeBodyProvider: FC<FlatThemeBodyProviderProps> = ({
    prefersColorScheme = "light",
    children,
}) => {
    const darkMode = useDarkMode(prefersColorScheme);
    useIsomorphicLayoutEffect(() => {
        document.body.classList.add("flat-theme-root");
        document.body.classList.toggle("flat-color-scheme-dark", darkMode);
    }, [darkMode]);
    return <DarkModeContext.Provider value={darkMode}>{children}</DarkModeContext.Provider>;
};
