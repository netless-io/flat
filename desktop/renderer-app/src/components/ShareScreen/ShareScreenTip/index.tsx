import React from "react";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./style.less";
import { portalWindowManager } from "../../../utils/portal-window-manager";
import { ipcAsyncByShareScreenTipWindow } from "../../../utils/ipc";
import dragSVG from "../../../assets/image/drag.svg";
import { Button } from "antd";
import { ShareScreenStore } from "../../../stores/share-screen-store";
import { useTranslation } from "react-i18next";
import { useSafePromise } from "../../../utils/hooks/lifecycle";

interface ShareScreenTipProps {
    shareScreenStore: ShareScreenStore;
}

export const ShareScreenTip = observer<ShareScreenTipProps>(function ShareScreenTip({
    shareScreenStore,
}) {
    const sp = useSafePromise();
    const { t } = useTranslation();
    const [containerEl] = useState(() => document.createElement("div"));

    useEffect(() => {
        sp(
            portalWindowManager.createShareScreenTipPortalWindow(
                containerEl,
                t("share-screen.tip-window-title"),
            ),
        ).catch(console.error);

        return () => {
            ipcAsyncByShareScreenTipWindow("force-close-window", {});
        };
    }, [containerEl, sp, t]);

    const stopShareScreen = (): void => {
        shareScreenStore.close().catch(console.error);
    };

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
