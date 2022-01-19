import React, { useEffect, useMemo, useRef } from "react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { ShareScreenStore } from "../../../stores/share-screen-store";
import { ShareScreenTip } from "../ShareScreenTip";
import "./style.less";

interface ShareScreenProps {
    shareScreenStore: ShareScreenStore;
}

export const ShareScreen = observer<ShareScreenProps>(function ShareScreen({ shareScreenStore }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            shareScreenStore.updateElement(ref.current);
        }
    }, [shareScreenStore]);

    const classNameList = useMemo(() => {
        return classNames("share-screen", {
            active: shareScreenStore.existOtherShareScreen,
        });
    }, [shareScreenStore.existOtherShareScreen]);

    return (
        <>
            <div ref={ref} className={classNameList} />
            {shareScreenStore.enableShareScreenStatus && (
                <ShareScreenTip shareScreenStore={shareScreenStore} />
            )}
        </>
    );
});
