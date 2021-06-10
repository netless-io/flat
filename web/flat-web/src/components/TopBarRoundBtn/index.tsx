import { TopBarRoundBtn as TopBarRoundBtnImpl } from "flat-components";
import React, { ReactElement } from "react";

const Icons = import.meta.globEager("./icons/*.svg");

export interface TopBarRoundBtnProps extends React.HTMLAttributes<HTMLButtonElement> {
    dark?: boolean;
    /** file name (without .ext) in src/assets/image/ */
    iconName?: string;
}

export function TopBarRoundBtn({
    dark,
    iconName,
    ...restProps
}: TopBarRoundBtnProps): ReactElement {
    return (
        <TopBarRoundBtnImpl
            {...restProps}
            dark={dark}
            icon={<img src={Icons[`./icons/${iconName}.svg`].default} />}
        />
    );
}
