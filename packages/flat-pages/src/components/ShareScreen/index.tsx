import "./style.less";

import React, { useEffect, useMemo, useRef } from "react";
import classNames from "classnames";
import { message } from "antd";
import { observer } from "mobx-react-lite";
import { useTranslate } from "@netless/flat-i18n";
import { ClassroomStore } from "@netless/flat-stores";

import { ShareScreenTip } from "./ShareScreenTip";

interface ShareScreenProps {
    classroomStore: ClassroomStore;
}

export const ShareScreen = observer<ShareScreenProps>(function ShareScreen({ classroomStore }) {
    const ref = useRef<HTMLDivElement>(null);
    const t = useTranslate();

    useEffect(() => {
        if (ref.current) {
            classroomStore.rtc.shareScreen.setElement(ref.current);
        }
    }, [classroomStore]);

    useEffect(() => {
        const onBrowserNotPermission = (error: Error): void => {
            if (isAgoraRTCPermissionError(error) && browserNotPermission(error.message)) {
                void message.error(t("share-screen.browser-not-permission"));
            }
        };

        classroomStore.rtc.shareScreen.events.on("err-enable", onBrowserNotPermission);

        return () => {
            classroomStore.rtc.shareScreen.events.off("err-enable", onBrowserNotPermission);
        };
    }, [classroomStore.rtc.shareScreen.events, t]);

    const classNameList = useMemo(() => {
        return classNames("share-screen", {
            active: classroomStore.isRemoteScreenSharing,
        });
    }, [classroomStore.isRemoteScreenSharing]);

    if (window.isElectron) {
        return (
            <>
                <div ref={ref} className={classNameList} />
                {classroomStore.isScreenSharing && (
                    <ShareScreenTip classroomStore={classroomStore} />
                )}
            </>
        );
    }

    return <div ref={ref} className={classNameList} />;
});

function isAgoraRTCPermissionError(error: any): error is Error {
    return "code" in error && "message" in error && error.code === "PERMISSION_DENIED";
}

function browserNotPermission(message: string): boolean {
    return message.indexOf("by system") !== -1;
}
