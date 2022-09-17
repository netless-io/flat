import "./style.less";

import classNames from "classnames";
import React, { ReactElement, ButtonHTMLAttributes, FC } from "react";

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
        className={classNames("topbar-right-btn", className)}
        disabled={disabled}
        title={title}
    >
        {icon}
    </button>
);
