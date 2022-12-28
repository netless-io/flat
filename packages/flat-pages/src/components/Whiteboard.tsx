import "@netless/window-manager/dist/style.css";
import "./Whiteboard.less";

import classNames from "classnames";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { RoomPhase } from "white-web-sdk";
import {
    DarkModeContext,
    PresetsModal,
    RaiseHand,
    RaisingHand,
    SaveAnnotationModal,
    SaveAnnotationModalProps,
} from "flat-components";
import { FlatI18nTFunction, useTranslate } from "@netless/flat-i18n";
import { observer } from "mobx-react-lite";
import { message } from "antd";
import { WhiteboardStore, ClassroomStore } from "@netless/flat-stores";
import { FlatServices, getFileExt } from "@netless/flat-services";
import { format } from "date-fns";
import { isSupportedFileExt } from "../utils/drag-and-drop";
import { isSupportedImageType, onDropImage } from "../utils/drag-and-drop/image";
import { PRESETS } from "../constants/presets";
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
    const { room, windowManager, phase, whiteboard } = whiteboardStore;
    const isDark = useContext(DarkModeContext);

    const [saveAnnotationVisible, showSaveAnnotation] = useState(false);
    const [saveAnnotationImages, setSaveAnnotationImages] = useState<
        SaveAnnotationModalProps["images"]
    >([]);
    const [presetsVisible, showPresets] = useState(false);
    const [page, setPage] = useState(0);
    const [maxPage, setMaxPage] = useState(Infinity);
    const [showPage, setShowPage] = useState(false);

    const isReconnecting = phase === RoomPhase.Reconnecting;

    useEffect(() => {
        return whiteboard.events.on("exportAnnotations", () => showSaveAnnotation(true));
    }, [whiteboard]);

    useEffect(() => {
        return whiteboard.events.on("insertPresets", () => showPresets(true));
    }, [whiteboard]);

    useEffect(() => {
        const stopListenPage = whiteboard.events.on("scrollPage", setPage);
        const stopListenMaxPage = whiteboard.events.on("maxScrollPage", setMaxPage);
        const stopListenUserScroll = whiteboard.events.on("userScroll", () => setShowPage(true));
        return () => {
            stopListenPage();
            stopListenMaxPage();
            stopListenUserScroll();
        };
    }, [whiteboard]);

    useEffect(() => {
        if (showPage) {
            let isMounted = true;
            const timer = setTimeout(() => {
                isMounted && setShowPage(false);
            }, 1000);
            return () => {
                clearTimeout(timer);
                isMounted = false;
            };
        } else {
            return;
        }
    }, [showPage]);

    useEffect(() => {
        whiteboard.setTheme(isDark ? "dark" : "light");
    }, [isDark, whiteboard]);

    useEffect(() => {
        return isReconnecting ? message.info(t("reconnecting"), 0) : noop;
    }, [isReconnecting, t]);

    useEffect(() => {
        if (saveAnnotationVisible) {
            setSaveAnnotationImages(whiteboardStore.getSaveAnnotationImages());
        }
    }, [saveAnnotationVisible, whiteboardStore]);

    const bindWhiteboard = useCallback(
        (ref: HTMLDivElement | null) => {
            ref && whiteboard.render(ref);
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
                    await onDropImage(file, x, y, room, whiteboardStore.cloudStorageStore);
                } else if (isSupportedFileExt(file)) {
                    whiteboardStore.onDrop(file);
                }
            }
        },
        [room, whiteboardStore],
    );

    useEffect(() => {
        const pasteHandler = (event: ClipboardEvent): void => {
            const file = event.clipboardData?.files[0];
            if (room && windowManager && file) {
                const { centerX, centerY } = windowManager.camera;
                if (isSupportedImageType(file)) {
                    const id = format(Date.now(), "yyyy-MM-dd_HH-mm-ss");
                    const extname = getFileExt(file.name);
                    const fileName = `screenshot_${id}.${extname}`;
                    const renamed = new File([file], fileName, {
                        type: file.type,
                        lastModified: file.lastModified,
                    });
                    onDropImage(renamed, centerX, centerY, room, whiteboardStore.cloudStorageStore);
                } else if (isSupportedFileExt(file)) {
                    whiteboardStore.onDrop(file);
                }
            }
        };
        document.addEventListener("paste", pasteHandler);
        return () => document.removeEventListener("paste", pasteHandler);
    }, [room, whiteboardStore, windowManager]);

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
                    {whiteboardStore.isCreator &&
                        classRoomStore.users.handRaisingJoiners.length > 0 && (
                            <div className="raise-hand-container">
                                <RaisingHand
                                    count={classRoomStore.users.handRaisingJoiners.length}
                                    onClick={classRoomStore.onToggleHandRaisingPanel}
                                />
                            </div>
                        )}
                    <div ref={bindWhiteboard} className="whiteboard" />
                    <div
                        className={classNames("whiteboard-scroll-page", {
                            "is-active": showPage,
                        })}
                    >
                        {renderScrollPage(t, page, maxPage)}
                    </div>
                    <div
                        className={classNames("hand-raising-panel", {
                            "is-active":
                                classRoomStore.users.handRaisingJoiners.length > 0 &&
                                classRoomStore.isHandRaisingPanelVisible,
                        })}
                    >
                        {classRoomStore.users.handRaisingJoiners.map(user => (
                            <div
                                key={user.userUUID}
                                className="hand-raising-user"
                                title={user.name}
                            >
                                <img
                                    alt="avatar"
                                    className="hand-raising-user-avatar"
                                    src={user.avatar}
                                />
                                <span className="hand-raising-user-name">{user.name}</span>
                                <button
                                    className="hand-raising-btn"
                                    onClick={() => classRoomStore.onStaging(user.userUUID, true)}
                                >
                                    {t("agree")}
                                </button>
                            </div>
                        ))}
                    </div>
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

function renderScrollPage(t: FlatI18nTFunction, page: number, maxPage: number): string {
    if (page === 0) {
        return t("scroll.first-page");
    } else if (page >= maxPage) {
        return t("scroll.last-page");
    } else {
        return t("scroll.page", { page: ((((page + 1) * 10) | 0) / 10).toFixed(1) });
    }
}
