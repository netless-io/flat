import "./style.less";

import React, { useEffect, useMemo, useRef } from "react";
import { observer } from "mobx-react-lite";
import classNames from "classnames";

import { ClassRoomStore } from "../../../stores/class-room-store";
import { ShareScreenTip } from "../ShareScreenTip";

interface ShareScreenProps {
    classRoomStore: ClassRoomStore;
}

export const ShareScreen = observer<ShareScreenProps>(function ShareScreen({ classRoomStore }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            classRoomStore.rtc.shareScreen.setElement(ref.current);
        }
    }, [classRoomStore]);

    const classNameList = useMemo(() => {
        return classNames("share-screen", {
            active: classRoomStore.isRemoteScreenSharing,
        });
    }, [classRoomStore.isRemoteScreenSharing]);

    return (
        <>
            <div ref={ref} className={classNameList} />
            {classRoomStore.isScreenSharing && <ShareScreenTip classRoomStore={classRoomStore} />}
        </>
    );
});
