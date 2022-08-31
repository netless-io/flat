import "@netless/window-manager/dist/style.css";
import "./Whiteboard.less";

import classNames from "classnames";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { RoomPhase } from "white-web-sdk";
import {
    DarkModeContext,
    PresetsModal,
    RaiseHand,
    SaveAnnotationModal,
    SaveAnnotationModalProps,
} from "flat-components";
import { useTranslate } from "@netless/flat-i18n";
import { observer } from "mobx-react-lite";
import { message } from "antd";
import { WhiteboardStore, ClassroomStore } from "@netless/flat-stores";
import { isSupportedFileExt } from "../utils/drag-and-drop";
import { isSupportedImageType, onDropImage } from "../utils/drag-and-drop/image";
import { PRESETS } from "../constants/presets";
import { FlatServices } from "@netless/flat-services";
import { createCloudFile } from "../utils/create-cloud-file";

export interface WhiteboardProps {
    whiteboardStore: WhiteboardStore;
    classRoomStore: ClassroomStore;
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
    const t = useTranslate();
    const { room, phase, whiteboard } = whiteboardStore;
    const isDark = useContext(DarkModeContext);

    const [whiteboardEl, setWhiteboardEl] = useState<HTMLElement | null>(null);
    const [saveAnnotationVisible, showSaveAnnotation] = useState(false);
    const [saveAnnotationImages, setSaveAnnotationImages] = useState<
        SaveAnnotationModalProps["images"]
    >([]);
    const [presetsVisible, showPresets] = useState(false);
    const [page, setPage] = useState(0);

    const isReconnecting = phase === RoomPhase.Reconnecting;

    useEffect(() => {
        return whiteboard.events.on("exportAnnotations", () => showSaveAnnotation(true));
    }, [whiteboard]);

    useEffect(() => {
        return whiteboard.events.on("insertPresets", () => showPresets(true));
    }, [whiteboard]);

    useEffect(() => {
        return whiteboard.events.on("scrollPage", setPage);
    }, [whiteboard]);

    useEffect(() => {
        whiteboard.setTheme(isDark ? "dark" : "light");
    }, [isDark, whiteboard]);

    useEffect(() => {
        return isReconnecting ? message.info(t("reconnecting"), 0) : noop;
    }, [isReconnecting, t]);

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
        if (saveAnnotationVisible) {
            setSaveAnnotationImages(whiteboardStore.getSaveAnnotationImages());
        }
    }, [saveAnnotationVisible, whiteboardStore]);

    useEffect(() => {
        whiteboardOnResize();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [whiteboardStore.isRightSideClose]);

    const bindWhiteboard = useCallback(
        (ref: HTMLDivElement | null) => {
            if (ref) {
                whiteboard.render(ref);
                setWhiteboardEl(ref);
            }
        },
        [whiteboard],
    );

    const insertPresetImage = useCallback(async (fileURL: string) => {
        const fileService = await FlatServices.getInstance().requestService("file");
        if (fileService) {
            fileService.insert(createCloudFile({ fileName: `${Date.now()}.png`, fileURL }));
        }
        showPresets(false);
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
                classRoomTopBarHeight = 150;
                classRoomMinWidth = whiteboardStore.isRightSideClose ? 826 : 1130;
                classRoomMinHeight = 610;
            } else {
                classRoomTopBarHeight = 40;
                classRoomMinWidth = whiteboardStore.isRightSideClose ? 716 : 1020;
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

    return (
        <>
            {room && (
                <div
                    className={classNames("whiteboard-container", {
                        "is-readonly": !whiteboardStore.isWritable,
                    })}
                    onDragOver={onDragOver}
                    onDrop={onDrop}
                >
                    {!whiteboardStore.isCreator &&
                        classRoomStore.users.currentUser &&
                        !classRoomStore.users.currentUser.isSpeak && (
                            <div className="raise-hand-container">
                                <RaiseHand
                                    disableHandRaising={disableHandRaising}
                                    isRaiseHand={classRoomStore.users.currentUser?.isRaiseHand}
                                    onRaiseHandChange={classRoomStore.onToggleHandRaising}
                                />
                            </div>
                        )}
                    <div ref={bindWhiteboard} className="whiteboard" />
                    <div className="whiteboard-scroll-page">{renderScrollPage(page)}</div>
                </div>
            )}
            <SaveAnnotationModal
                images={saveAnnotationImages}
                visible={saveAnnotationVisible}
                onClose={() => showSaveAnnotation(false)}
            />
            <PresetsModal
                images={PRESETS}
                visible={presetsVisible}
                onClick={insertPresetImage}
                onClose={() => showPresets(false)}
            />
        </>
    );
});

function renderScrollPage(page: number): string {
    return `${(page * 100) | 0}%`;
}
