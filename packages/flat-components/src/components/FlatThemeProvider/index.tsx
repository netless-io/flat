import "../../theme/index.less";
import React, { FC } from "react";
import classNames from "classnames";
import { useDarkMode, FlatPrefersColorScheme } from "./useDarkMode";

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
