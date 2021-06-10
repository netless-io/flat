import { TopBarRightBtn as TopBarRightBtnImpl } from "flat-components";
import React, { ReactElement } from "react";

const Icons = import.meta.globEager("./icons/*.svg");

export interface TopBarRightBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    title: string;
    icon: string;
    active?: boolean;
}

export function TopBarRightBtn({
    title,
    icon,
    active,
    disabled,
    ...restProps
}: TopBarRightBtnProps): ReactElement {
    const src =
        Icons[`./icons/${icon}${disabled ? "-disabled" : active ? "-active" : ""}.svg`].default;
    return (
        <TopBarRightBtnImpl
            {...restProps}
            title={title}
            disabled={disabled}
            icon={<img src={src} alt={title} />}
        />
    );
}
