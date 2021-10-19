import "@netless/window-manager/dist/style.css";
import "./Whiteboard.less";

import RedoUndo from "@netless/redo-undo";
import ToolBox from "@netless/tool-box";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useState } from "react";
import { WindowManager } from "@netless/window-manager";
import { WhiteboardStore } from "../stores/whiteboard-store";
import { isSupportedImageType, onDropImage } from "../utils/dnd/image";
import { ScenesController } from "flat-components";
import { AppStoreButton } from "./AppStoreButton";
import { useIsUnMounted } from "../utils/hooks/lifecycle";

export interface WhiteboardProps {
    whiteboardStore: WhiteboardStore;
}

export const Whiteboard = observer<WhiteboardProps>(function Whiteboard({ whiteboardStore }) {
    const { room } = whiteboardStore;
    const isUnMountedRef = useIsUnMounted();

    const [whiteboardEl, setWhiteboardEl] = useState<HTMLElement | null>(null);
    const [collectorEl, setCollectorEl] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const mountWindowManager = async (): Promise<void> => {
            if (whiteboardEl && collectorEl && room) {
                await WindowManager.mount({
                    room,
                    container: whiteboardEl,
                    collectorContainer: collectorEl,
                    cursor: true,
                    /* the containerSizeRatio config limit width and height ratio of windowManager
                     for make sure windowManager sync in whiteboard. */
                    containerSizeRatio: whiteboardStore.getWhiteboardRatio(),
                    collectorStyles: {
                        position: "absolute",
                        right: "10px",
                        bottom: "60px",
                    },
                    chessboard: false,
                });
                if (isUnMountedRef.current) {
                    whiteboardStore.destroyWindowManager();
                } else {
                    whiteboardStore.onMainViewModeChange();
                    whiteboardStore.onWindowManagerBoxStateChange();
                }
            }
        };

        void mountWindowManager();

        return () => {
            whiteboardStore.destroyWindowManager();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [whiteboardEl, collectorEl, room]);

    const whiteboardOnResize = useCallback(() => {
        if (whiteboardEl) {
            const whiteboardRatio = whiteboardStore.getWhiteboardRatio();

            const classRoomRightSideWidth = 304;
            let classRoomTopBarHeight: number;
            let classRoomMinWidth: number;
            let classRoomMinHeight: number;

            if (whiteboardStore.smallClassRatio === whiteboardRatio) {
                classRoomTopBarHeight = 182;
                classRoomMinWidth = 1130;
                classRoomMinHeight = 610;
            } else {
                classRoomTopBarHeight = 50;
                classRoomMinWidth = 1020;
                classRoomMinHeight = 522;
            }

            const whiteboardWidth = Math.min(
                window.innerWidth - classRoomRightSideWidth,
                (window.innerHeight - classRoomTopBarHeight) / whiteboardRatio,
            );

            const whiteboardHeight = whiteboardWidth * whiteboardRatio;

            whiteboardEl.style.width = `${whiteboardWidth}px`;
            whiteboardEl.style.height = `${whiteboardHeight}px`;

            if (window.innerHeight < classRoomMinHeight || window.innerWidth < classRoomMinWidth) {
                const whiteboardMinWidth = classRoomMinWidth - classRoomRightSideWidth;
                whiteboardEl.style.minWidth = `${whiteboardMinWidth}px`;
                whiteboardEl.style.minHeight = `${whiteboardMinWidth * whiteboardRatio}px`;
            }
        }
    }, [whiteboardEl, whiteboardStore]);

    useEffect(() => {
        if (whiteboardEl) {
            whiteboardOnResize();
            window.addEventListener("resize", whiteboardOnResize);
        }
        return () => {
            window.removeEventListener("resize", whiteboardOnResize);
        };
    }, [whiteboardEl, whiteboardOnResize]);

    const bindWhiteboard = useCallback((ref: HTMLDivElement | null) => {
        if (ref) {
            setWhiteboardEl(ref);
        }
    }, []);

    const bindCollector = useCallback((ref: HTMLDivElement | null) => {
        if (ref) {
            setCollectorEl(ref);
        }
    }, []);

    const onDragOver = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            const file = event.dataTransfer.files[0];
            if (room && file && isSupportedImageType(file)) {
                event.dataTransfer.dropEffect = "copy";
            }
        },
        [room],
    );

    const onDrop = useCallback(
        async (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            const file = event.dataTransfer.files[0];
            if (room && file && isSupportedImageType(file)) {
                const rect = (event.target as HTMLDivElement).getBoundingClientRect();
                const rx = event.clientX - rect.left;
                const ry = event.clientY - rect.top;
                const { x, y } = room.convertToPointInWorld({ x: rx, y: ry });
                await onDropImage(file, x, y, room);
            }
        },
        [room],
    );

    return (
        room && (
            <div
                className={classNames("whiteboard-container", {
                    "is-readonly": !whiteboardStore.isWritable,
                })}
                onDragOver={onDragOver}
                onDrop={onDrop}
            >
                <div className="whiteboard-writable-area">
                    <div className="tool-box-out">
                        <ToolBox
                            room={room}
                            customerComponent={[<AppStoreButton addApp={whiteboardStore.addApp} />]}
                        />
                    </div>
                    <div
                        className={classNames("redo-undo-box", {
                            "is-disabled": whiteboardStore.isWindowMaximization,
                        })}
                    >
                        <RedoUndo room={room} />
                    </div>
                    <div
                        className={classNames("page-controller-box", {
                            "is-disabled": whiteboardStore.isWindowMaximization,
                        })}
                    >
                        <ScenesController
                            addScene={whiteboardStore.addMainViewScene}
                            preScene={whiteboardStore.preMainViewScene}
                            nextScene={whiteboardStore.nextMainViewScene}
                            currentSceneIndex={whiteboardStore.currentSceneIndex}
                            scenesCount={whiteboardStore.scenesCount}
                            disabled={whiteboardStore.isFocusWindow}
                        />
                    </div>
                </div>
                <div ref={bindCollector} className="collector-container" />
                <div ref={bindWhiteboard} className="whiteboard-box" />
            </div>
        )
    );
});
