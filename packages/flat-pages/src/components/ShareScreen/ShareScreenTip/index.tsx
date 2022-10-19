import "./style.less";

import dragSVG from "../../../assets/image/drag.svg";

import React, { useCallback, useContext, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { observer } from "mobx-react-lite";
import { useTranslate } from "@netless/flat-i18n";
import { ClassroomStore } from "@netless/flat-stores";
import { Button } from "antd";

import { WindowsSystemBtnContext } from "../../StoreProvider";

interface ShareScreenTipProps {
    classroomStore: ClassroomStore;
}

export const ShareScreenTip = observer<ShareScreenTipProps>(function ShareScreenTip({
    classroomStore,
}) {
    const t = useTranslate();
    const windows = useContext(WindowsSystemBtnContext);
    const [containerEl] = useState(() => document.createElement("div"));

    useEffect(() => {
        if (windows) {
            return windows.createShareScreenTipPortalWindow(
                containerEl,
                t("share-screen.tip-window-title"),
            );
        }
        return;
    }, [containerEl, t, windows]);

    const stopShareScreen = useCallback(
        () => classroomStore.toggleShareScreen(false),
        [classroomStore],
    );

    return ReactDOM.createPortal(
        <div className={"share-screen-tip"}>
            <div>
                <img alt="drag icon" src={dragSVG} />
                <span>{t("share-screen.tip-window-body")}</span>
            </div>
            <Button danger ghost onClick={stopShareScreen}>
                {t("share-screen.tip-window-button")}
            </Button>
        </div>,
        containerEl,
    );
});
