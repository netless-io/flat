import "@netless/window-manager/dist/style.css";
import "./Whiteboard.less";

import RedoUndo from "@netless/redo-undo";
import ToolBox from "@netless/tool-box";
import { WindowManager } from "@netless/window-manager";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useState } from "react";
import { WhiteboardStore } from "../stores/WhiteboardStore";
import { isSupportedImageType, onDropImage } from "../utils/dnd/image";
import { ScenesController } from "../../../../packages/flat-components/src";

export interface WhiteboardProps {
    whiteboardStore: WhiteboardStore;
}

export const Whiteboard = observer<WhiteboardProps>(function Whiteboard({ whiteboardStore }) {
    const { room } = whiteboardStore;

    const [whiteboardEl, setWhiteboardEl] = useState<HTMLElement | null>(null);
    const [collectorEl, setCollectorEl] = useState<HTMLElement | null>(null);

    useEffect(() => {
        const mountWindowManager = async (): Promise<void> => {
            if (whiteboardEl && collectorEl && room) {
                await WindowManager.mount({
                    room,
                    container: whiteboardEl,
                    cursor: true,
                    collectorContainer: collectorEl,
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
                whiteboardStore.onMainViewModeChange();
                whiteboardStore.onWindowManagerBoxStateChange();
            }
        };

        void mountWindowManager();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [whiteboardEl, collectorEl, room]);

    useEffect(() => {
        if (whiteboardEl) {
            whiteboardOnResize();
            window.addEventListener("resize", whiteboardOnResize);
        }
        return () => {
            window.removeEventListener("resize", whiteboardOnResize);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [whiteboardEl]);

    useEffect(() => {
        whiteboardOnResize();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [whiteboardStore.isRightSideClose]);

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

    const whiteboardOnResize = (): void => {
        if (whiteboardEl) {
            const whiteboardRatio = whiteboardStore.getWhiteboardRatio();

            if (whiteboardStore.smallClassRatio === whiteboardRatio) {
                const classRoomRightSideWidth = whiteboardStore.isRightSideClose ? 0 : 304;
                const classRoomTopBarHeight = 182;
                const classRoomMinWidth = 1130;
                const classRoomMinHeight = 610;

                const whiteboardWidth = Math.min(
                    window.innerWidth - classRoomRightSideWidth,
                    (window.innerHeight - classRoomTopBarHeight) / whiteboardRatio,
                );

                const whiteboardHeight = whiteboardWidth * whiteboardRatio;

                whiteboardEl.style.width = `${whiteboardWidth}px`;
                whiteboardEl.style.height = `${whiteboardHeight}px`;

                if (
                    window.innerHeight < classRoomMinHeight ||
                    window.innerWidth < classRoomMinWidth
                ) {
                    const whiteboardMinWidth = classRoomMinWidth - classRoomRightSideWidth;
                    whiteboardEl.style.minWidth = `${whiteboardMinWidth}px`;
                    whiteboardEl.style.minHeight = `${whiteboardMinWidth * whiteboardRatio}px`;
                }
            } else {
                const classRoomRightSideWidth = whiteboardStore.isRightSideClose ? 0 : 304;
                const classRoomTopBarHeight = 50;
                const classRoomMinWidth = 1020;
                const classRoomMinHeight = 522;

                const whiteboardWidth = Math.min(
                    window.innerWidth - classRoomRightSideWidth,
                    (window.innerHeight - classRoomTopBarHeight) / whiteboardRatio,
                );

                const whiteboardHeight = whiteboardWidth * whiteboardRatio;

                whiteboardEl.style.width = `${whiteboardWidth}px`;
                whiteboardEl.style.height = `${whiteboardHeight}px`;

                if (
                    window.innerHeight < classRoomMinHeight ||
                    window.innerWidth < classRoomMinWidth
                ) {
                    const whiteboardMinWidth = classRoomMinWidth - classRoomRightSideWidth;
                    whiteboardEl.style.minWidth = `${whiteboardMinWidth}px`;
                    whiteboardEl.style.minHeight = `${whiteboardMinWidth * whiteboardRatio}px`;
                }
            }
        }
    };

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
                        <ToolBox room={room} />
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
