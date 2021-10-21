import "./style.less";
import defaultSVG from "./icons/default.svg";
import audioSVG from "./icons/audio.svg";
import imgSVG from "./icons/img.svg";
import pdfSVG from "./icons/pdf.svg";
import pptSVG from "./icons/ppt.svg";
import videoSVG from "./icons/video.svg";
import wordSVG from "./icons/word.svg";
import convertingSVG from "./icons/converting.svg";
import convertErrorSVG from "./icons/convert-error.svg";
import vfSVG from "./icons/vf.svg";
import iceSVG from "./icons/ice.svg";

import React, { useMemo } from "react";
import classNames from "classnames";
import { CloudStorageConvertStatusType, CloudStorageFileName } from "../types";
import { CloudStorageFileTitleRename } from "./CloudStorageFileTitleRename";
import { useTranslation } from "react-i18next";

export interface CloudStorageFileTitleProps
    extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
    /** file UUID */
    fileUUID: string;
    /** File Name */
    fileName: string;
    /** Cloud converting status */
    convertStatus?: CloudStorageConvertStatusType;
    /** Is title clickable. Default false */
    titleClickable?: boolean;
    /** When title is clicked */
    onTitleClick?: (fileUUID: string) => void;
    /** UUID of file that is under renaming */
    renamingFileUUID?: string;
    /** Rename file. Empty name for cancelling */
    onRename?: (fileUUID: string, fileName?: CloudStorageFileName) => void;
}

/**
 * Render a file icon in front of file name according to file extension.
 */
export const CloudStorageFileTitle = React.memo<CloudStorageFileTitleProps>(
    function CloudStorageFileTitle({
        fileUUID,
        fileName,
        convertStatus,
        titleClickable = false,
        onTitleClick,
        renamingFileUUID,
        onRename,
        ...restProps
    }) {
        const { t } = useTranslation();
        const isConverting = convertStatus === "converting";
        const isConvertError = !isConverting && convertStatus === "error";
        const fileIcon = useMemo(() => getFileIcon(fileName), [fileName]);

        return (
            <span
                title={`${
                    isConvertError
                        ? t("transcoding-failure")
                        : isConverting
                        ? t("transcoding-in-progress")
                        : ""
                }${fileName}`}
                {...restProps}
                className={classNames(restProps.className, "cloud-storage-file-title", {
                    "is-convert-ready": !isConverting && !isConvertError,
                })}
            >
                <span className="cloud-storage-file-title-icon-wrap">
                    <img
                        className="cloud-storage-file-title-icon"
                        src={fileIcon}
                        width={22}
                        height={22}
                        aria-hidden
                    />
                    {isConverting ? (
                        <img
                            className="cloud-storage-file-title-converting"
                            src={convertingSVG}
                            width={11}
                            height={11}
                            aria-hidden
                        />
                    ) : isConvertError ? (
                        <img
                            className="cloud-storage-file-title-convert-error"
                            src={convertErrorSVG}
                            width={11}
                            height={11}
                            aria-hidden
                        />
                    ) : null}
                </span>
                {renamingFileUUID === fileUUID ? (
                    <CloudStorageFileTitleRename
                        fileUUID={fileUUID}
                        fileName={fileName}
                        onRename={onRename}
                    />
                ) : titleClickable ? (
                    <a
                        className="cloud-storage-file-title-content"
                        onClick={e => {
                            e.preventDefault();
                            onTitleClick && onTitleClick(fileUUID);
                        }}
                    >
                        {fileName}
                    </a>
                ) : (
                    <span className="cloud-storage-file-title-content">{fileName}</span>
                )}
            </span>
        );
    },
);

function getFileIcon(fileName: string): string {
    const ext = (/\.[a-z1-9]+$/i.exec(fileName) || [""])[0].toLowerCase();

    switch (ext) {
        case ".ppt":
        case ".pptx": {
            return pptSVG;
        }
        case ".doc":
        case ".docx": {
            return wordSVG;
        }
        case ".pdf": {
            return pdfSVG;
        }
        case ".jpg":
        case ".png":
        case ".gif":
        case ".jpeg":
        case ".svg":
        case ".bmp":
        case ".eps": {
            return imgSVG;
        }
        case ".mp4":
        case ".avi":
        case ".mov":
        case ".wmv":
        case ".3gp":
        case ".mkv":
        case ".flv":
        case ".f4v":
        case ".rmvb":
        case ".webm": {
            return videoSVG;
        }
        case ".aac":
        case ".mp3":
        case ".wave":
        case ".wma":
        case ".flac": {
            return audioSVG;
        }
        case ".vf": {
            return vfSVG;
        }
        case ".ice": {
            return iceSVG;
        }
        default: {
            return defaultSVG;
        }
    }
}
