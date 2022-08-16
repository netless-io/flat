import "./style.less";
import { CloudFile } from "@netless/flat-server-api";
import React, { FC } from "react";

export interface FilePreviewImageProps {
    file: CloudFile;
}

export const FilePreviewImage: FC<FilePreviewImageProps> = ({ file }) => {
    return (
        <div className="file-preview-image-container">
            <img alt={file.fileName} src={file.fileURL} />
        </div>
    );
};
