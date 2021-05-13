import React, { ReactElement, useState } from "react";
import { TopBarRoundBtn as TopBarRoundBtnImpl } from "flat-components";

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
    const [imgReq] = useState(() => require.context("../assets/image/", false, /\.svg$/));
    return (
        <TopBarRoundBtnImpl
            {...restProps}
            dark={dark}
            icon={<img src={imgReq(`./${iconName}.svg`).default} />}
        />
    );
}
