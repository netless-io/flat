import "./style.less";

import classNames from "classnames";
import React, { ReactElement } from "react";
import { ButtonHTMLAttributes, FC } from "react";

export interface TopBarRightBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: ReactElement;
}

export const TopBarRightBtn: FC<TopBarRightBtnProps> = ({
    title,
    icon,
    disabled,
    className,
    ...restProps
}) => (
    <button
        {...restProps}
        title={title}
        disabled={disabled}
        className={classNames("topbar-right-btn", className)}
    >
        {icon}
    </button>
);
