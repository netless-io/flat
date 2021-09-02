import { TopBarRightBtn as TopBarRightBtnImpl } from "flat-components";
import React, { ReactElement } from "react";

import exitSVG from "./icons/exit.svg";
import followActiveSVG from "./icons/follow-active.svg";
import followSVG from "./icons/follow.svg";
import hideSideActiveSVG from "./icons/hide-side-active.svg";
import hideSideSVG from "./icons/hide-side.svg";
import shareScreenSVG from "./icons/share-screen.svg";
import shareScreenActiveSVG from "./icons/share-screen-active.svg";

const Icons = {
    exit: exitSVG,
    "follow-active": followActiveSVG,
    follow: followSVG,
    "hide-side-active": hideSideActiveSVG,
    "hide-side": hideSideSVG,
    "share-screen": shareScreenSVG,
    "share-screen-active": shareScreenActiveSVG,
};

export interface TopBarRightBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    title: string;
    icon: keyof typeof Icons;
}

export function TopBarRightBtn({
    title,
    icon,
    disabled,
    ...restProps
}: TopBarRightBtnProps): ReactElement {
    return (
        <TopBarRightBtnImpl
            {...restProps}
            title={title}
            disabled={disabled}
            icon={<img src={Icons[icon]} alt={title} />}
        />
    );
}
