import "./style.less";

import React, { FC, ReactNode } from "react";
import classNames from "classnames";
import {
    WindowsSystemBtn,
    WindowsSystemBtnProps,
} from "../../MainPageLayout/MainPageTopBar/WindowsSystemBtn";

export * from "./TopBarRightBtn";
export * from "./TopBarRoundBtn";

export const TopBarDivider: FC = () => {
    return <div className="topbar-divider"></div>;
};

export interface TopBarProps {
    left?: ReactNode;
    center?: ReactNode;
    right?: ReactNode;
    showWindowsSystemBtn?: boolean;
    hiddenMaximizeBtn?: boolean;
    topBarRef?: React.RefObject<HTMLDivElement>;
    // flat-web don't need pass this method.
    onClickWindowsSystemBtn?: WindowsSystemBtnProps["onClickWindowsSystemBtn"];
}

export const TopBar: FC<TopBarProps> = ({
    left,
    center,
    right,
    showWindowsSystemBtn,
    topBarRef,
    hiddenMaximizeBtn,
    onClickWindowsSystemBtn,
}) => (
    <div ref={topBarRef} className={classNames("topbar-box", { showWindowsSystemBtn })}>
        <div className="topbar-content-left">{left}</div>
        <div className="topbar-content-center">{center}</div>
        <div className="topbar-content-right">
            {right}
            {showWindowsSystemBtn && onClickWindowsSystemBtn && (
                <>
                    <WindowsSystemBtn
                        hiddenMaximizeBtn={hiddenMaximizeBtn}
                        onClickWindowsSystemBtn={onClickWindowsSystemBtn}
                    />
                </>
            )}
        </div>
    </div>
);
