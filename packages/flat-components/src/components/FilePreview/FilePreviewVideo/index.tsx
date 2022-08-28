import "./style.less";

import { CloudFile } from "@netless/flat-server-api";
import React, { FC } from "react";

export interface FilePreviewVideoProps {
    file: CloudFile;
}

export const FilePreviewVideo: FC<FilePreviewVideoProps> = ({ file }) => {
    return (
        <div className="file-preview-video-container">
            <video controls src={file.fileURL} />
        </div>
    );
};
