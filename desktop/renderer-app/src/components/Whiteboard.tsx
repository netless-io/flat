import PageController from "@netless/page-controller";
import PreviewController from "@netless/preview-controller";
import RedoUndo from "@netless/redo-undo";
import ToolBox from "@netless/tool-box";
import ZoomController from "@netless/zoom-controller";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import pages from "../assets/image/pages.svg";
import { WhiteboardStore } from "../stores/WhiteboardStore";
import "./Whiteboard.less";

export interface WhiteboardProps {
    whiteboardStore: WhiteboardStore;
}

export const Whiteboard = observer<WhiteboardProps>(function Whiteboard({ whiteboardStore }) {
    const [whiteboardEl, setWhiteboardEl] = useState<HTMLDivElement>();

    const { room } = whiteboardStore;

    const bindWhiteboard = useCallback(
        (ref: HTMLDivElement) => {
            setWhiteboardEl(ref);
            if (room) {
                room.bindHtmlElement(ref);
                room.scalePptToFit();
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
                                <img src={pages} alt={"pages"} />
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
