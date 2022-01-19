import React, { FC } from "react";
import classNames from "classnames";
import { useIsomorphicLayoutEffect } from "react-use";
import { FlatPrefersColorScheme, useDarkMode } from "./useDarkMode";
import "../../theme/index.less";

export * from "./useDarkMode";

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
        <div
            {...restProps}
            className={classNames(
                "flat-theme-root",
                { "flat-color-scheme-dark": darkMode },
                className,
            )}
        />
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
    return <>{children}</>;
};
