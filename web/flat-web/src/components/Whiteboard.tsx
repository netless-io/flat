import PageController from "@netless/page-controller";
import PreviewController from "@netless/preview-controller";
import RedoUndo from "@netless/redo-undo";
import ToolBox from "@netless/tool-box";
import ZoomController from "@netless/zoom-controller";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import { RoomPhase } from "white-web-sdk";
import pagesSVG from "../assets/image/pages.svg";
import { WhiteboardStore } from "../stores/WhiteboardStore";
import { isSupportedImageType, onDropImage } from "../utils/dnd/image";
import "./Whiteboard.less";

export interface WhiteboardProps {
    whiteboardStore: WhiteboardStore;
}

export const Whiteboard = observer<WhiteboardProps>(function Whiteboard({ whiteboardStore }) {
    const { room } = whiteboardStore;

    const bindWhiteboard = useCallback(
        (ref: HTMLDivElement) => {
            if (room) {
                room.bindHtmlElement(ref);
                if (room.phase === RoomPhase.Connected) {
                    room.scalePptToFit();
                }
            }
        },
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
                <div className="zoom-controller-box">
                    <ZoomController room={room} />
                </div>
                <div className="whiteboard-writable-area">
                    <div className="tool-box-out">
                        <ToolBox room={room} />
                    </div>
                    <div className="redo-undo-box">
                        <RedoUndo room={room} />
                    </div>
                    <div className="page-controller-box">
                        <div className="page-controller-mid-box">
                            <PageController room={room} />
                            <div
                                className="page-preview-cell"
                                onClick={whiteboardStore.showPreviewPanel}
                            >
                                <img src={pagesSVG} alt={"pages"} />
                            </div>
                        </div>
                    </div>
                    <PreviewController
                        handlePreviewState={whiteboardStore.setPreviewPanel}
                        isVisible={whiteboardStore.isShowPreviewPanel}
                        room={room}
                    />
                    {/* <DocsCenter
                        handleDocCenterState={whiteboardStore.setFileOpen}
                        isFileOpen={whiteboardStore.isFileOpen}
                        room={room}
                    /> */}
                </div>
                <div ref={bindWhiteboard} className="whiteboard-box" />
            </div>
        )
    );
});
