import React from "react";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { constants } from "flat-types";
import "./style.less";
import { portalWindowManager } from "../../../utils/portal-window-manager";
import { ipcAsyncByApp } from "../../../utils/ipc";
import dragSVG from "../../../assets/image/drag.svg";
import { Button } from "antd";
import { ShareScreenStore } from "../../../stores/share-screen-store";
import { useTranslation } from "react-i18next";

interface ShareScreenTipProps {
    shareScreenStore: ShareScreenStore;
}

export const ShareScreenTip = observer<ShareScreenTipProps>(function ShareScreenTip({
    shareScreenStore,
}) {
    const { t } = useTranslation();
    const [windowInstance, setWindowInstance] = useState<null | Window>(null);
    const [containerEl] = useState(() => document.createElement("div"));

    useEffect(() => {
        const instance = portalWindowManager.createShareScreenTipPortalWindow(containerEl);

        setWindowInstance(instance);

        return () => {
            ipcAsyncByApp("force-close-window", {
                windowName: constants.WindowsName.ShareScreenTip,
            });
        };
    }, [containerEl, t]);

    useEffect(() => {
        if (windowInstance) {
            windowInstance.document.title = t("share-screen.tip-window-title");
        }
    }, [windowInstance, t]);

    const stopShareScreen = (): void => {
        shareScreenStore.close().catch(console.error);
    };

    return ReactDOM.createPortal(
        <div className={"share-screen-tip"}>
            <div>
                <img src={dragSVG} alt="drag icon" />
                <span>{t("share-screen.tip-window-body")}</span>
            </div>
            <Button danger ghost onClick={stopShareScreen}>
                {t("share-screen.tip-window-button")}
            </Button>
        </div>,
        containerEl,
    );
});
