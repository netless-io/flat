import "./style.less";
import React, { useCallback, useState } from "react";
import { observer } from "mobx-react-lite";
import { ScreenInfo } from "../../../../apiMiddleware/share-screen";
import { getScreenInfo, uint8ArrayToImageURL } from "./Utils";
import classNames from "classnames";
import { ShareScreenStore } from "../../../../stores/ShareScreenStore";

interface ScreenListProps {
    screenInfo: ScreenInfo;
    shareScreenStore: ShareScreenStore;
}

export const ScreenList = observer<ScreenListProps>(function ShareScreen({
    screenInfo,
    shareScreenStore,
}) {
    const [activeInfo, setActiveInfo] = useState("");

    const onClick = useCallback(
        (isDisplay: boolean, id: number) => {
            setActiveInfo(`${isDisplay ? "display" : "window"}-${id}`);
            shareScreenStore.updateIsDisplayScreen(isDisplay);
            shareScreenStore.updateScreenID(id);
        },
        [shareScreenStore],
    );

    const cancelSelected = useCallback(() => {
        setActiveInfo("");
        shareScreenStore.updateIsDisplayScreen(null);
        shareScreenStore.updateScreenID(null);
    }, [shareScreenStore]);

    return (
        <div className="screen-list">
            {screenInfo.displayList.map(info => {
                const key = `display-${info.displayId.id}`;
                const isActive = activeInfo === key;

                return (
                    <ScreenItem
                        info={info}
                        handleClick={isActive ? cancelSelected : onClick}
                        active={isActive}
                        key={key}
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
                    />
                );
            })}
        </div>
    );
});

interface ScreenItemProps {
    info: ScreenInfo["windowList"][0] | ScreenInfo["displayList"][0];
    handleClick: (isDisplay: boolean, id: number) => void;
    active: boolean;
}

const ScreenItem = observer<ScreenItemProps>(function ScreenItem({ info, handleClick, active }) {
    const screenInfo = getScreenInfo(info);

    return (
        <>
            <div className="screen-item">
                <div
                    className={classNames("screen-image-box", {
                        active,
                    })}
                    onClick={() => handleClick(screenInfo.isDisplay, screenInfo.id)}
                >
                    <img src={uint8ArrayToImageURL(info.image)} alt="screenshots" />
                </div>
                <span>{screenInfo.name}</span>
            </div>
        </>
    );
});
