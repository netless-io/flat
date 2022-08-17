import "./style.less";

import { CloudFile } from "@netless/flat-server-api";
import React, { FC } from "react";

export interface FilePreviewAudioProps {
    file: CloudFile;
}

export const FilePreviewAudio: FC<FilePreviewAudioProps> = ({ file }) => {
    return (
        <div className="file-preview-audio-container">
            <audio controls src={file.fileURL} />
        </div>
    );
};
