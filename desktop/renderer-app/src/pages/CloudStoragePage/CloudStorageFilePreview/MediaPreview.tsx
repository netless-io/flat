import "./MediaPreview.less";

import React from "react";
import { observer } from "mobx-react-lite";
import { getFileSuffix } from "./utils";

export interface MediaPreviewProps {
    fileURL: string;
}

export const MediaPreview = observer<MediaPreviewProps>(function PPTPreview({ fileURL }) {
    const mediaFileURL = decodeURIComponent(fileURL);

    const mediaFileSuffix = getFileSuffix(mediaFileURL);

    function renderMediaPreview(): React.ReactElement {
        switch (mediaFileSuffix) {
            case ".mp3": {
                return (
                    <div className="audio-container">
                        <audio controls src={mediaFileURL} />
                    </div>
                );
            }
            case ".jpg":
            case ".jpeg":
            case ".png": {
                return (
                    <div className="img-container">
                        <img src={mediaFileURL} alt="img resource" />
                    </div>
                );
            }

            default: {
                return <video controls src={mediaFileURL} />;
            }
        }
    }

    return <div className="media-preview-container">{renderMediaPreview()}</div>;
});
