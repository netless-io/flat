import "./style.less";

import React, { useEffect, useMemo, useRef } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import { ClassRoomStore } from "../../stores/class-room-store";

interface ShareScreenProps {
    classRoomStore: ClassRoomStore;
}

export const ShareScreen = observer<ShareScreenProps>(function ShareScreen({ classRoomStore }) {
    const ref = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    useEffect(() => {
        if (ref.current) {
            classRoomStore.rtc.shareScreen.setElement(ref.current);
        }
    }, [classRoomStore]);

    useEffect(() => {
        const onBrowserNotPermission = (error: Error): void => {
            if (isAgoraRTCPermissionError(error) && browserNotPermission(error.message)) {
                void message.error(t("share-screen.browser-not-permission"));
            }
        };

        classRoomStore.rtc.shareScreen.events.on("err-enable", onBrowserNotPermission);

        return () => {
            classRoomStore.rtc.shareScreen.events.off("err-enable", onBrowserNotPermission);
        };
    }, [classRoomStore.rtc.shareScreen.events, t]);

    const classNameList = useMemo(() => {
        return classNames("share-screen", {
            active: classRoomStore.isRemoteScreenSharing,
        });
    }, [classRoomStore.isRemoteScreenSharing]);

    return <div ref={ref} className={classNameList} />;
});

function isAgoraRTCPermissionError(error: any): error is Error {
    return "code" in error && "message" in error && error.code === "PERMISSION_DENIED";
}

function browserNotPermission(message: string): boolean {
    return message.indexOf("by system") !== -1;
}
