import React, { useEffect, useMemo, useRef } from "react";
import { message } from "antd";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { shareScreenEvents } from "../../api-middleware/rtc/share-screen";
import { ShareScreenStore } from "../../stores/share-screen-store";
import "./style.less";

interface ShareScreenProps {
    shareScreenStore: ShareScreenStore;
}

export const ShareScreen = observer<ShareScreenProps>(function ShareScreen({ shareScreenStore }) {
    const ref = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    useEffect(() => {
        if (ref.current) {
            shareScreenStore.updateElement(ref.current);
        }
    }, [shareScreenStore]);

    useEffect(() => {
        const onBrowserNotPermission = (): void => {
            void message.error(t("share-screen.browser-not-permission"));
        };

        shareScreenEvents.on("browserNotPermission", onBrowserNotPermission);

        return () => {
            shareScreenEvents.off("browserNotPermission", onBrowserNotPermission);
        };
    }, [t]);

    const classNameList = useMemo(() => {
        return classNames("share-screen", {
            active: shareScreenStore.existOtherUserStream,
        });
    }, [shareScreenStore.existOtherUserStream]);

    return <div ref={ref} className={classNameList} />;
});
