import "@netless/window-manager/dist/style.css";
import "./Whiteboard.less";

import RedoUndo from "@netless/redo-undo";
import ToolBox from "@netless/tool-box";
import { WindowManager } from "@netless/window-manager";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import { WhiteboardStore } from "../stores/WhiteboardStore";
import { isSupportedImageType, onDropImage } from "../utils/dnd/image";
import { ScenesController } from "../../../../packages/flat-components/src";

export interface WhiteboardProps {
    whiteboardStore: WhiteboardStore;
}

export const Whiteboard = observer<WhiteboardProps>(function Whiteboard({ whiteboardStore }) {
    const { room } = whiteboardStore;

    const bindWhiteboard = useCallback(
        async (ref: HTMLDivElement | null) => {
            if (ref && room) {
                await WindowManager.mount({
                    room,
                    container: ref,
                    /* the containerSizeRatio config limit width and height ratio of windowManager
                     for make sure windowManager sync in whiteboard. */
                    containerSizeRatio: whiteboardStore.updateWhiteboardResize(),
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
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [room],
    );

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
                <div ref={bindWhiteboard} className="whiteboard-box" />
            </div>
        )
    );
});
