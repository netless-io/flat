import * as React from "react";
import { Tooltip } from "antd";

export interface TopBarRightBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    title: string;
    icon: string;
    active?: boolean;
}

export class TopBarRightBtn extends React.PureComponent<TopBarRightBtnProps> {
    render() {
        const { title, icon, active, ...restProps } = this.props;

        return (
            <Tooltip placement="bottom" title={title}>
                <button className="topbar-content-right-cell" {...restProps}>
                    <img
                        src={
                            require(`../assets/image/${icon}${active ? "-active" : ""}.svg`).default
                        }
                        alt={title}
                    />
                </button>
            </Tooltip>
        );
    }
}

export default TopBarRightBtn;
