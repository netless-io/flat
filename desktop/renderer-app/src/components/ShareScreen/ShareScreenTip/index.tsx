import "./style.less";
import dragSVG from "../../../assets/image/drag.svg";

import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { Button } from "antd";

import { ClassRoomStore } from "../../../stores/class-room-store";
import { useSafePromise } from "../../../utils/hooks/lifecycle";
import { ipcAsyncByShareScreenTipWindow } from "../../../utils/ipc";
import { portalWindowManager } from "../../../utils/portal-window-manager";

interface ShareScreenTipProps {
    classRoomStore: ClassRoomStore;
}

export const ShareScreenTip = observer<ShareScreenTipProps>(function ShareScreenTip({
    classRoomStore,
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

    const stopShareScreen = useCallback(
        () => classRoomStore.toggleShareScreen(false),
        [classRoomStore],
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
