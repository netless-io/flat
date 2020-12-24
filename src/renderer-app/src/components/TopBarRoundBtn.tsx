import React from "react";
import classNames from "classnames";

import "./TopBarRoundBtn.less";

export interface TopBarRoundBtnProps extends React.HTMLAttributes<HTMLButtonElement> {
    dark?: boolean;
    icon?: string;
}

export class TopBarRoundBtn extends React.PureComponent<TopBarRoundBtnProps> {
    private imgReq = require.context("../assets/image/", false, /\.svg$/);

    render(): React.ReactNode {
        const { dark, icon, children, className, ...restProps } = this.props;
        return (
            <button
                {...restProps}
                className={classNames("topbar-round-btn", className, {
                    "is-dark": dark,
                })}
            >
                {<img src={this.imgReq(`./${icon}.svg`).default} />}
                <span>{children}</span>
            </button>
        );
    }
}

export default TopBarRoundBtn;
