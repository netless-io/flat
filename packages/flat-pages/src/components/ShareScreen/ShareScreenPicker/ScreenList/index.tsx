import "./style.less";

import React, { useCallback, useEffect, useState } from "react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { useTranslate } from "@netless/flat-i18n";
import { IServiceShareScreenInfo } from "@netless/flat-services";
import { ClassroomStore } from "@netless/flat-stores";
import { message } from "antd";

const uint8ArrayToImageURL = (buffer: Uint8Array): string => {
    return URL.createObjectURL(
        new Blob([buffer.buffer], {
            type: "image/png",
        }),
    );
};

interface ScreenListProps {
    screenInfo: IServiceShareScreenInfo[];
    classroomStore: ClassroomStore;
}

export const ScreenList = observer<ScreenListProps>(function ShareScreen({
    screenInfo,
    classroomStore,
}) {
    const [activeInfo, setActiveInfo] = useState("");
    const t = useTranslate();

    useEffect(() => {
        if (screenInfo.length === 0) {
            void message.error(t("share-screen.desktop-not-permission"));
        }
    }, [screenInfo, t]);

    const onClick = useCallback(
        (screenInfo: IServiceShareScreenInfo, activeKey: string) => {
            setActiveInfo(activeKey);
            classroomStore.selectShareScreenInfo(screenInfo);
        },
        [classroomStore],
    );

    const cancelSelected = useCallback(() => {
        setActiveInfo("");
        classroomStore.selectShareScreenInfo(null);
    }, [classroomStore]);

    return (
        <div className="screen-list">
            {screenInfo.map(info => {
                const id = typeof info.screenId === "number" ? info.screenId : info.screenId.id;
                const key = `${info.type}-${id}`;
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
    info: IServiceShareScreenInfo;
    handleClick: (screenInfo: IServiceShareScreenInfo, key: string) => void;
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
