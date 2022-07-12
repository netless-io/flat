import "@netless/window-manager/dist/style.css";
import "./Whiteboard.less";

import classNames from "classnames";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { Fastboard, FastboardUIConfig, Language } from "@netless/fastboard-react";
import { RoomPhase } from "white-web-sdk";
import {
    DarkModeContext,
    PresetsModal,
    RaiseHand,
    SaveAnnotationModal,
    SaveAnnotationModalProps,
} from "flat-components";
import { useTranslation } from "react-i18next";
import { observer } from "mobx-react-lite";
import { message } from "antd";

import { WhiteboardStore } from "../stores/whiteboard-store";
import { isSupportedFileExt } from "../utils/drag-and-drop";
import { isSupportedImageType, onDropImage } from "../utils/drag-and-drop/image";
import { ClassRoomStore } from "../stores/class-room-store";
import { refreshApps } from "../utils/toolbar-apps";
import { PRESETS } from "../constants/presets";
import { mousewheelToScroll } from "../utils/mousewheel-to-scroll";
import { registerColorShortcut } from "../utils/color-shortcut";
import { injectCursor } from "../utils/inject-cursor";

export interface WhiteboardProps {
    whiteboardStore: WhiteboardStore;
    classRoomStore: ClassRoomStore;
    disableHandRaising?: boolean;
}

const noop = (): void => {
    // noop
};

// Hide zoom control.
const config: FastboardUIConfig = {
    zoom_control: { enable: false },
    toolbar: { apps: { enable: true } },
};

export const Whiteboard = observer<WhiteboardProps>(function Whiteboard({
    whiteboardStore,
    classRoomStore,
    disableHandRaising,
}) {
    const { i18n, t } = useTranslation();
    const { room, phase, fastboardAPP } = whiteboardStore;
    const isDark = useContext(DarkModeContext);

    const [whiteboardEl, setWhiteboardEl] = useState<HTMLElement | null>(null);
    const [collectorEl, setCollectorEl] = useState<HTMLElement | null>(null);
    const [saveAnnotationVisible, showSaveAnnotation] = useState(false);
    const [saveAnnotationImages, setSaveAnnotationImages] = useState<
        SaveAnnotationModalProps["images"]
    >([]);
    const [presetsVisible, showPresets] = useState(false);

    const isReconnecting = phase === RoomPhase.Reconnecting;

    useEffect(() => {
        return isReconnecting ? message.info(t("reconnecting"), 0) : noop;
    }, [isReconnecting, t]);

    useEffect(() => {
        if (fastboardAPP && collectorEl) {
            fastboardAPP.bindCollector(collectorEl);
        }
    }, [collectorEl, fastboardAPP]);

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
        if (whiteboardEl && fastboardAPP) {
            return mousewheelToScroll(whiteboardEl, fastboardAPP);
        }
        return;
    }, [whiteboardEl, fastboardAPP]);

    useEffect(() => {
        refreshApps({
            t,
            onSaveAnnotation: () => {
                showSaveAnnotation(true);
            },
            onPresets: () => {
                showPresets(true);
            },
        });
    }, [t]);

    useEffect(() => {
        if (saveAnnotationVisible) {
            setSaveAnnotationImages(whiteboardStore.getSaveAnnotationImages());
        }
    }, [saveAnnotationVisible, whiteboardStore]);

    useEffect(() => {
        if (fastboardAPP) {
            return registerColorShortcut(fastboardAPP);
        }
        return;
    }, [fastboardAPP]);

    useEffect(() => {
        if (fastboardAPP) {
            return injectCursor(fastboardAPP);
        }
        return;
    }, [fastboardAPP]);

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

    const insertPresetImage = useCallback(
        (fileURL: string) => {
            whiteboardStore.insertImage({ fileURL });
            showPresets(false);
        },
        [whiteboardStore],
    );

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
                    {!whiteboardStore.isCreator && !whiteboardStore.isWritable && (
                        <div className="raise-hand-container">
                            <RaiseHand
                                disableHandRaising={disableHandRaising}
                                isRaiseHand={classRoomStore.users.currentUser?.isRaiseHand}
                                onRaiseHandChange={classRoomStore.onToggleHandRaising}
                            />
                        </div>
                    )}
                    <div ref={bindCollector} />
                    <Fastboard
                        app={fastboardAPP}
                        config={config}
                        containerRef={bindWhiteboard}
                        language={i18n.language as Language}
                        theme={isDark ? "dark" : "light"}
                    />
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
