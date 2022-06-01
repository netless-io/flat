import "./style.less";

import { Region } from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useRef } from "react";
import { DynamicPreview } from "./DynamicPreview";
import { MediaPreview } from "./MediaPreview";
import { StaticPreview } from "./StaticPreview";
import { getFileSuffix } from "./utils";
import ReactDOM from "react-dom";
import { portalWindowManager } from "../../../utils/portal-window-manager";
import { ipcAsyncByPreviewFileWindow } from "../../../utils/ipc";

export type FileInfo = {
    fileURL: string;
    taskUUID: string;
    taskToken: string;
    region: Region;
    fileName: string;
    projector: boolean;
};

export interface ResourcePreviewProps {
    fileInfo: FileInfo;
    windowInstance?: Window | PortalWindow;
}

export const ResourcePreview = observer<ResourcePreviewProps>(function PPTPreview({
    fileInfo,
    windowInstance,
}) {
    const { fileURL, taskUUID, taskToken, region } = fileInfo;
    const ResourcePreviewRef = useRef<HTMLDivElement>(null);

    function renderPreviewComponent(): React.ReactElement {
        const fileSuffix = getFileSuffix(fileURL);

        switch (fileSuffix) {
            case ".pptx": {
                if (!taskUUID || !taskToken) {
                    // TODO: i18n
                    return <div> Failed to load, try again Please</div>;
                }
                return (
                    <DynamicPreview
                        projector={fileInfo.projector}
                        region={region}
                        taskToken={taskToken}
                        taskUUID={taskUUID}
                        windowInstance={windowInstance}
                    />
                );
            }
            case ".ppt":
            case ".pdf":
            case ".doc":
            case ".docx": {
                if (!taskUUID || !taskToken) {
                    // TODO: i18n
                    return <div> Failed to load, try again Please</div>;
                }
                return <StaticPreview region={region} taskToken={taskToken} taskUUID={taskUUID} />;
            }

            default: {
                return <MediaPreview fileURL={fileURL} />;
            }
        }
    }

    return (
        <div ref={ResourcePreviewRef} className="resource-preview-container">
            {renderPreviewComponent()}
        </div>
    );
});

export const createResourcePreview = (fileInfo: FileInfo): void => {
    const containerEl = document.createElement("div");

    portalWindowManager
        .createPreviewFilePortalWindow(containerEl, fileInfo.fileName)
        .then(instance => {
            ReactDOM.render(
                <ResourcePreview fileInfo={fileInfo} windowInstance={instance} />,
                containerEl,
            );

            // when BrowserWindow close, will trigger onbeforeunload
            // since the current function may be called in non-component code
            // we need to manually call unmountComponentAtNode to unload the DOM
            instance.onbeforeunload = () => {
                ReactDOM.unmountComponentAtNode(containerEl);
            };

            const fileSuffix = getFileSuffix(fileInfo.fileURL).toLowerCase();

            if ([".png", ".jpg", ".jpeg"].includes(fileSuffix)) {
                ipcAsyncByPreviewFileWindow(
                    "set-visual-zoom-level",
                    {
                        minimumLevel: 1,
                        maximumLevel: 3,
                    },
                    instance.browserWindowID,
                );
            }
        })
        .catch(console.error);
};
