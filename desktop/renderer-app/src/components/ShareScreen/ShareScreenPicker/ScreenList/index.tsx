import "./style.less";

import classNames from "classnames";
import React, { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import { FlatRTCShareScreenInfo } from "@netless/flat-rtc";

import { uint8ArrayToImageURL } from "./Utils";
import { ClassRoomStore } from "../../../../stores/class-room-store";

interface ScreenListProps {
    screenInfo: FlatRTCShareScreenInfo[];
    classRoomStore: ClassRoomStore;
}

export const ScreenList = observer<ScreenListProps>(function ShareScreen({
    screenInfo,
    classRoomStore,
}) {
    const [activeInfo, setActiveInfo] = useState("");
    const { t } = useTranslation();

    useEffect(() => {
        if (screenInfo.length === 0) {
            void message.error(t("share-screen.desktop-not-permission"));
        }
    }, [screenInfo, t]);

    const onClick = useCallback(
        (screenInfo: FlatRTCShareScreenInfo, activeKey: string) => {
            setActiveInfo(activeKey);
            classRoomStore.updateSelectedScreenInfo(screenInfo);
        },
        [classRoomStore],
    );

    const cancelSelected = useCallback(() => {
        setActiveInfo("");
        classRoomStore.updateSelectedScreenInfo(null);
    }, [classRoomStore]);

    return (
        <div className="screen-list">
            {screenInfo.map(info => {
                const key = `${info.type}-${info.screenId}`;
                const isActive = activeInfo === key;

                return (
                    <ScreenItem
                        key={key}
                        active={isActive}
                        activeKey={key}
                        handleClick={isActive ? cancelSelected : onClick}
                        info={info}
                    />
                );
            })}
        </div>
    );
});

interface ScreenItemProps {
    info: FlatRTCShareScreenInfo;
    handleClick: (screenInfo: FlatRTCShareScreenInfo, key: string) => void;
    active: boolean;
    activeKey: string;
}

const ScreenItem = observer<ScreenItemProps>(function ScreenItem({
    info,
    handleClick,
    active,
    activeKey,
}) {
    return (
        <>
            <div className="screen-item">
                <div
                    className={classNames("screen-image-box", {
                        active,
                    })}
                    onClick={() => handleClick(info, activeKey)}
                >
                    <img alt="screenshots" src={uint8ArrayToImageURL(info.image)} />
                </div>
                <span>{info.name}</span>
            </div>
        </>
    );
});
