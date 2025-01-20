import "./style.less";

import classNames from "classnames";
import React, { ReactElement, ButtonHTMLAttributes, FC } from "react";

export interface WhiteBoardBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: ReactElement;
}

export const WhiteBoardBtn: FC<WhiteBoardBtnProps> = ({
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
