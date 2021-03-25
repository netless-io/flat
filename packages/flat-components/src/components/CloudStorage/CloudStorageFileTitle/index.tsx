import defaultSVG from "../../../assets/files/default.svg";
import audioSVG from "../../../assets/files/audio.svg";
import imgSVG from "../../../assets/files/img.svg";
import pdfSVG from "../../../assets/files/pdf.svg";
import pptSVG from "../../../assets/files/ppt.svg";
import videoSVG from "../../../assets/files/video.svg";
import wordSVG from "../../../assets/files/word.svg";

import React from "react";

export interface CloudStorageFileTitleProps {
    /** File Name */
    fileName: string;
    /** Class name for file icon */
    iconClassName?: string;
    /** Class name for title text */
    titleClassName?: string;
}

/**
 * Render a file icon in front of file name according to file extension.
 */
export const CloudStorageFileTitle = React.memo<CloudStorageFileTitleProps>(
    function CloudStorageFileTitle({ fileName, iconClassName, titleClassName }) {
        return (
            <>
                <img className={iconClassName} src={getFileIcon(fileName)} aria-hidden />
                <span className={titleClassName} title={fileName}>
                    {fileName}
                </span>
            </>
        );
    },
);

function getFileIcon(fileName: string): string {
    const ext = (/\.[a-z1-9]+$/i.exec(fileName) || [""])[0].toLowerCase();

    switch (ext) {
        case ".ppt":
        case ".pptx":
            return pptSVG;
        case ".doc":
        case ".docx":
            return wordSVG;
        case ".pdf":
            return pdfSVG;
        case ".jpg":
        case ".png":
        case ".gif":
        case ".jpeg":
        case ".svg":
        case ".bmp":
        case ".eps":
            return imgSVG;
        case ".mp4":
        case ".avi":
        case ".mov":
        case ".wmv":
        case ".3gp":
        case ".mkv":
        case ".flv":
        case ".f4v":
        case ".rmvb":
        case ".webm":
            return videoSVG;
        case ".aac":
        case ".mp3":
        case ".wave":
        case ".wma":
        case ".flac":
            return audioSVG;
        default:
            return defaultSVG;
    }
}
