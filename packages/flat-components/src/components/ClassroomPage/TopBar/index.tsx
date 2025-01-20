import "./style.less";

import React, { FC, ReactNode, useCallback, useRef } from "react";
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
    // flat-web don't need pass this method.
    onClickWindowsSystemBtn?: WindowsSystemBtnProps["onClickWindowsSystemBtn"];
    onDoubleClick?: () => void;
}

export const TopBar: FC<TopBarProps> = ({
    left,
    center,
    right,
    showWindowsSystemBtn,
    hiddenMaximizeBtn,
    onClickWindowsSystemBtn,
    onDoubleClick,
}) => {
    const ref = useRef<HTMLDivElement>(null);

    const onDoubleClickSelf = useCallback(
        (ev: React.MouseEvent): void => {
            if (onDoubleClick && ref.current && ref.current.contains(ev.target as Node)) {
                onDoubleClick && onDoubleClick();
            }
        },
        [onDoubleClick],
    );

    return (
        <div
            ref={ref}
            className={classNames("topbar-box", { showWindowsSystemBtn })}
            onDoubleClick={onDoubleClickSelf}
        >
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
};
