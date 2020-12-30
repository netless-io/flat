import React from "react";
import classNames from "classnames";

import "./TopBarRoundBtn.less";

export interface TopBarRoundBtnProps extends React.HTMLAttributes<HTMLButtonElement> {
    dark?: boolean;
    /** file name (without .ext) in src/assets/image/ */
    iconName?: string;
}

export class TopBarRoundBtn extends React.PureComponent<TopBarRoundBtnProps> {
    private imgReq = require.context("../assets/image/", false, /\.svg$/);

    render(): React.ReactNode {
        const { dark, iconName, children, className, ...restProps } = this.props;
        return (
            <button
                {...restProps}
                className={classNames("topbar-round-btn", className, {
                    "is-dark": dark,
                })}
            >
                {<img src={this.imgReq(`./${iconName}.svg`).default} />}
                <span>{children}</span>
            </button>
        );
    }
}

export default TopBarRoundBtn;
