import React, { ButtonHTMLAttributes, FC, ReactElement } from "react";
import classNames from "classnames";
import "./style.less";

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
