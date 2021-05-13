import "./style.less";

import React, { FC, HTMLAttributes, ReactElement } from "react";
import classNames from "classnames";

export interface TopBarRoundBtnProps extends HTMLAttributes<HTMLButtonElement> {
    dark?: boolean;
    icon?: ReactElement;
}

export const TopBarRoundBtn: FC<TopBarRoundBtnProps> = ({
    dark,
    icon,
    className,
    children,
    ...restProps
}) => (
    <button
        {...restProps}
        className={classNames("topbar-round-btn", className, {
            "is-dark": dark,
        })}
    >
        {icon}
        <span>{children}</span>
    </button>
);
