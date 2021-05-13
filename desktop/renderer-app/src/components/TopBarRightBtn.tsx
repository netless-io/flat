import { TopBarRightBtn as TopBarRightBtnImpl } from "flat-components";
import React, { ReactElement } from "react";

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
    return (
        <TopBarRightBtnImpl
            {...restProps}
            title={title}
            disabled={disabled}
            icon={
                <img
                    src={
                        require(`../assets/image/${icon}${
                            disabled ? "-disabled" : active ? "-active" : ""
                        }.svg`).default
                    }
                    alt={title}
                />
            }
        />
    );
}
