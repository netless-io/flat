import "@netless/window-manager/dist/style.css";
import "./Whiteboard.less";

import RedoUndo from "@netless/redo-undo";
import ToolBox from "@netless/tool-box";
import { WindowManager } from "@netless/window-manager";
import classNames from "classnames";
import { RaiseHand, ScenesController } from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import { RoomPhase } from "white-web-sdk";
import { WhiteboardStore } from "../stores/whiteboard-store";
import { isSupportedFileExt } from "../utils/drag-and-drop";
import { isSupportedImageType, onDropImage } from "../utils/drag-and-drop/image";
import { ClassRoomStore } from "../stores/class-room-store";

export interface WhiteboardProps {
    whiteboardStore: WhiteboardStore;
    classRoomStore: ClassRoomStore;
    disableHandRaising?: boolean;
}

const noop = (): void => {
    // noop
};

export const Whiteboard = observer<WhiteboardProps>(function Whiteboard({
    whiteboardStore,
    classRoomStore,
    disableHandRaising,
}) {
    const { i18n, t } = useTranslation();
    const { room, phase } = whiteboardStore;

    const [whiteboardEl, setWhiteboardEl] = useState<HTMLElement | null>(null);
    const [collectorEl, setCollectorEl] = useState<HTMLElement | null>(null);

    const isReconnecting = phase === RoomPhase.Reconnecting;

    useEffect(() => {
        return isReconnecting ? message.info(t("reconnecting"), 0) : noop;
    }, [isReconnecting, t]);

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
                        bottom: "8px",
                    },
                    chessboard: false,
                });

                whiteboardStore.onMainViewModeChange();
                whiteboardStore.onWindowManagerBoxStateChange(
                    whiteboardStore.windowManager?.boxState,
                );
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

            const isSmallClass = whiteboardStore.smallClassRatio === whiteboardRatio;
            const classRoomRightSideWidth = whiteboardStore.isRightSideClose ? 0 : 304;

            let classRoomTopBarHeight: number;
            let classRoomMinWidth: number;
            let classRoomMinHeight: number;
            let smallClassAvatarWrapMaxWidth: number;

            if (isSmallClass) {
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

            const classRoomWidth = whiteboardWidth + classRoomRightSideWidth;
            const classRoomWithoutRightSideWidth = classRoomMinWidth - classRoomRightSideWidth;

            if (whiteboardStore.isRightSideClose) {
                smallClassAvatarWrapMaxWidth =
                    classRoomWidth < classRoomWithoutRightSideWidth
                        ? classRoomWithoutRightSideWidth
                        : classRoomWidth;
            } else {
                smallClassAvatarWrapMaxWidth =
                    classRoomWidth < classRoomMinWidth ? classRoomMinWidth : classRoomWidth;
            }

            whiteboardStore.updateSmallClassAvatarWrapMaxWidth(smallClassAvatarWrapMaxWidth);
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
            if (room && file && isSupportedFileExt(file)) {
                event.dataTransfer.dropEffect = "copy";
            }
        },
        [room],
    );

    const onDrop = useCallback(
        async (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            const file = event.dataTransfer.files[0];
            if (room && file) {
                if (isSupportedImageType(file)) {
                    const rect = (event.target as HTMLDivElement).getBoundingClientRect();
                    const rx = event.clientX - rect.left;
                    const ry = event.clientY - rect.top;
                    const { x, y } = room.convertToPointInWorld({ x: rx, y: ry });
                    await onDropImage(file, x, y, room);
                } else if (isSupportedFileExt(file)) {
                    whiteboardStore.onDrop(file);
                }
            }
        },
        [room, whiteboardStore],
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
                            hotkeys={{
                                arrow: "A",
                                clear: "",
                                clicker: "",
                                ellipse: "C",
                                eraser: "E",
                                hand: "H",
                                laserPointer: "Z",
                                pencil: "P",
                                rectangle: "R",
                                selector: "S",
                                shape: "",
                                straight: "L",
                                text: "T",
                            }}
                            i18nLanguage={i18n.language}
                            room={room}
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
                            currentSceneIndex={whiteboardStore.currentSceneIndex}
                            disabled={whiteboardStore.isFocusWindow}
                            nextScene={whiteboardStore.nextMainViewScene}
                            preScene={whiteboardStore.preMainViewScene}
                            scenesCount={whiteboardStore.scenesCount}
                        />
                    </div>
                </div>
                {!whiteboardStore.isCreator && !whiteboardStore.isWritable && (
                    <div className="raise-hand-container">
                        <RaiseHand
                            disableHandRaising={disableHandRaising}
                            isRaiseHand={classRoomStore.users.currentUser?.isRaiseHand}
                            onRaiseHandChange={classRoomStore.onToggleHandRaising}
                        />
                    </div>
                )}
                <div
                    ref={bindCollector}
                    className={classNames("collector-container", {
                        "collector-container-not-writable": !whiteboardStore.isWritable,
                    })}
                />

                <div ref={bindWhiteboard} className="whiteboard-box" />
            </div>
        )
    );
});
