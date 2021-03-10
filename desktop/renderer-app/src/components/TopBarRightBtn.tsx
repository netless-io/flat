import React from "react";
import classNames from "classnames";

export interface TopBarRightBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    title: string;
    icon: string;
    active?: boolean;
}

export class TopBarRightBtn extends React.PureComponent<TopBarRightBtnProps> {
    render(): React.ReactNode {
        const { title, icon, active, disabled, className, ...restProps } = this.props;

        return (
            <button
                {...restProps}
                title={title}
                disabled={disabled}
                className={classNames("topbar-content-right-cell", className)}
            >
                <img
                    src={
                        require(`../assets/image/${icon}${
                            disabled ? "-disabled" : active ? "-active" : ""
                        }.svg`).default
                    }
                    alt={title}
                />
            </button>
        );
    }
}
