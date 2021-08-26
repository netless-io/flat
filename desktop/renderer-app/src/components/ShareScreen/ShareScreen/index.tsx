import "./style.less";

import React, { useEffect, useMemo, useRef } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";
import type { ShareScreenStore } from "../../../stores/ShareScreenStore";

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

    return <div className={classNameList} ref={ref} />;
});
