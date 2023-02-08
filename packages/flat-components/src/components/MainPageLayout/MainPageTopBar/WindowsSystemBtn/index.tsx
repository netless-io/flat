import "./style.less";

import React from "react";
import { SVGMinus as SVGMinimize, SVGMaximize, SVGClose } from "../../../FlatIcons";
import { WindowsSystemBtnItem } from "../../types";

export interface WindowsSystemBtnProps {
    hiddenMaximizeBtn?: boolean;
    onClickWindowsSystemBtn: (winSystemBtn: WindowsSystemBtnItem) => void;
}

export const WindowsSystemBtn: React.FC<WindowsSystemBtnProps> = ({
    hiddenMaximizeBtn,
    onClickWindowsSystemBtn,
}) => {
    return (
        <div className="windows-system-btn">
            <a
                className="windows-system-btn-item"
                onClick={() => onClickWindowsSystemBtn("minimize")}
            >
                <SVGMinimize />
            </a>
            {hiddenMaximizeBtn ? null : (
                <a
                    className="windows-system-btn-item"
                    onClick={() => onClickWindowsSystemBtn("maximize")}
                >
                    <SVGMaximize />
                </a>
            )}
            <a className="windows-system-btn-item" onClick={() => onClickWindowsSystemBtn("close")}>
                <SVGClose />
            </a>
        </div>
    );
};
