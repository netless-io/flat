import React, { useState } from "react";

import ToolBox from "@netless/tool-box";
import RedoUndo from "@netless/redo-undo";
import PageController from "@netless/page-controller";
import ZoomController from "@netless/zoom-controller";
import OssUploadButton from "@netless/oss-upload-button";
import PreviewController from "@netless/preview-controller";
import DocsCenter from "@netless/docs-center";
import OssDropUpload from "@netless/oss-drop-upload";

import { NETLESS, OSS_CONFIG } from "../constants/Process";

import { observer } from "mobx-react-lite";
import { WhiteboardStore } from "../stores/WhiteboardStore";

import pages from "../assets/image/pages.svg";
import "./Whiteboard.less";
import { RoomPhase } from "white-web-sdk";
import LoadingPage from "../LoadingPage";
export interface WhiteboardProps {
    whiteboardStore: WhiteboardStore;
}

export const Whiteboard = observer<WhiteboardProps>(({ whiteboardStore }) => {
    const [whiteboardEl, setWhiteboardEl] = useState<HTMLDivElement>();

    const { room, phase } = whiteboardStore;

    if (
        !room ||
        phase === RoomPhase.Connecting ||
        phase === RoomPhase.Disconnecting ||
        phase === RoomPhase.Reconnecting
    ) {
        return (
            <div className="whiteboard-container">
                <LoadingPage />
            </div>
        );
    }

    return (
        <div className="whiteboard-container">
            <div className="tool-box-out">
                <ToolBox
                    room={room}
                    customerComponent={[
                        <OssUploadButton
                            oss={OSS_CONFIG}
                            appIdentifier={NETLESS.APP_IDENTIFIER}
                            sdkToken={NETLESS.SDK_TOKEN}
                            room={room}
                            whiteboardRef={whiteboardEl}
                        />,
                    ]}
                />
            </div>
            <div className="redo-undo-box">
                <RedoUndo room={room} />
            </div>
            <div className="zoom-controller-box">
                <ZoomController room={room} />
            </div>
            <div className="page-controller-box">
                <div className="page-controller-mid-box">
                    <div
                        className="page-controller-cell"
                        onClick={() => whiteboardStore.togglePreviewPanel(true)}
                    >
                        <img src={pages} alt={"pages"} />
                    </div>
                    <PageController room={room} />
                </div>
            </div>
            <PreviewController
                handlePreviewState={state => {
                    whiteboardStore.togglePreviewPanel(state);
                }}
                isVisible={whiteboardStore.isShowPreviewPanel}
                room={room}
            />
            <DocsCenter
                handleDocCenterState={state => {
                    whiteboardStore.toggleFileOpen(state);
                }}
                isFileOpen={whiteboardStore.isFileOpen}
                room={room}
            />
            <OssDropUpload room={room} oss={OSS_CONFIG}>
                <div
                    ref={(ref: HTMLDivElement) => {
                        setWhiteboardEl(ref);
                        if (room) {
                            room.bindHtmlElement(ref);
                        }
                    }}
                    className="whiteboard-box"
                />
            </OssDropUpload>
        </div>
    );
});
