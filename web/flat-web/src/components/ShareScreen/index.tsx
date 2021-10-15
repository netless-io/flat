import "./style.less";

import React, { useEffect, useMemo, useRef } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import type { ShareScreenStore } from "../../stores/share-screen-store";
import { message } from "antd";
import { shareScreenEvents } from "../../api-middleware/rtc/share-screen";
import { useTranslation } from "react-i18next";

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

    return <div className={classNameList} ref={ref} />;
});
