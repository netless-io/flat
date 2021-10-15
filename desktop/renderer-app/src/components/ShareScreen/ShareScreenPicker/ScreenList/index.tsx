import "./style.less";
import React, { useCallback, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { ScreenInfo, ShareSymbol } from "../../../../api-middleware/share-screen";
import { getScreenInfo, uint8ArrayToImageURL } from "./Utils";
import classNames from "classnames";
import { ShareScreenStore } from "../../../../stores/share-screen-store";
import { message } from "antd";
import { useTranslation } from "react-i18next";

interface ScreenListProps {
    screenInfo: ScreenInfo;
    shareScreenStore: ShareScreenStore;
}

export const ScreenList = observer<ScreenListProps>(function ShareScreen({
    screenInfo,
    shareScreenStore,
}) {
    const [activeInfo, setActiveInfo] = useState("");
    const { t } = useTranslation();

    useEffect(() => {
        if (screenInfo.windowList.length === 0) {
            void message.error(t("share-screen.desktop-not-permission"));
        }
    }, [screenInfo.windowList, t]);

    const onClick = useCallback(
        (screenInfo: ShareSymbol, activeKey: string) => {
            setActiveInfo(activeKey);
            shareScreenStore.updateShareSymbolInfo(screenInfo);
        },
        [shareScreenStore],
    );

    const cancelSelected = useCallback(() => {
        setActiveInfo("");
        shareScreenStore.updateShareSymbolInfo(null);
    }, [shareScreenStore]);

    return (
        <div className="screen-list">
            {screenInfo.displayList.map((info, index) => {
                const key = `display-${index}`;
                const isActive = activeInfo === key;

                return (
                    <ScreenItem
                        info={info}
                        handleClick={isActive ? cancelSelected : onClick}
                        active={isActive}
                        key={key}
                        activeKey={key}
                    />
                );
            })}
            {screenInfo.windowList.map(info => {
                const key = `window-${info.windowId}`;
                const isActive = activeInfo === key;

                return (
                    <ScreenItem
                        info={info}
                        handleClick={isActive ? cancelSelected : onClick}
                        active={activeInfo === key}
                        key={key}
                        activeKey={key}
                    />
                );
            })}
        </div>
    );
});

interface ScreenItemProps {
    info: ScreenInfo["windowList"][0] | ScreenInfo["displayList"][0];
    handleClick: (screenInfo: ShareSymbol, key: string) => void;
    active: boolean;
    activeKey: string;
}

const ScreenItem = observer<ScreenItemProps>(function ScreenItem({
    info,
    handleClick,
    active,
    activeKey,
}) {
    const screenInfo = getScreenInfo(info);

    return (
        <>
            <div className="screen-item">
                <div
                    className={classNames("screen-image-box", {
                        active,
                    })}
                    onClick={() => handleClick(screenInfo, activeKey)}
                >
                    <img src={uint8ArrayToImageURL(info.image)} alt="screenshots" />
                </div>
                <span>{screenInfo.name}</span>
            </div>
        </>
    );
});
