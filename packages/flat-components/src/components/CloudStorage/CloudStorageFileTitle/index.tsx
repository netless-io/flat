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
import directorySVG from "./icons/directory.svg";

import React, { useMemo } from "react";
import classNames from "classnames";
import { CloudStorageFileName } from "../types";
import { CloudStorageFileTitleRename } from "./CloudStorageFileTitleRename";
import { useTranslate } from "@netless/flat-i18n";
import { FileConvertStep, FileResourceType, ResourceType } from "@netless/flat-server-api";
import { DirectoryInfo } from "../../../containers/CloudStorageContainer";
import { CloudStorageNewDirectory } from "./CloudStorageNewDirectory";
import { useHistory } from "react-router-dom";

export interface CloudStorageFileTitleProps
    extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> {
    fileUUID: string;
    fileName: string;
    convertStatus?: FileConvertStep;
    titleClickable?: boolean;
    /** UUID of file that is under renaming */
    renamingFileUUID?: string;
    resourceType?: ResourceType;
    parentDirectoryPath?: string;
    onTitleClick?: (fileUUID: string, pushHistory: (path: string) => void) => void;
    onRename?: (fileUUID: string, fileName?: CloudStorageFileName) => void;
    onNewDirectoryFile?: (directoryInfo: DirectoryInfo) => Promise<void>;
}

/**
 * Render a file icon in front of file name according to file extension.
 */
export const CloudStorageFileTitle = /* @__PURE__ */ React.memo<CloudStorageFileTitleProps>(
    function CloudStorageFileTitle({
        fileUUID,
        fileName,
        convertStatus,
        titleClickable = false,
        onTitleClick,
        renamingFileUUID,
        onRename,
        onNewDirectoryFile,
        resourceType,
        parentDirectoryPath,
        ...restProps
    }) {
        const t = useTranslate();
        const isConverting = convertStatus === FileConvertStep.Converting;
        const isConvertError = !isConverting && convertStatus === FileConvertStep.Failed;
        const fileIcon = useMemo(() => getFileIcon(fileName), [fileName]);
        const history = useHistory();

        const pushHistory = (path: string): void => {
            const search = new URLSearchParams({ path }).toString();
            history.push({ search });
        };

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
                        aria-hidden
                        className="cloud-storage-file-title-icon"
                        height={22}
                        src={fileIcon}
                        width={22}
                    />
                    {isConverting ? (
                        <img
                            aria-hidden
                            className="cloud-storage-file-title-converting"
                            height={11}
                            src={convertingSVG}
                            width={11}
                        />
                    ) : isConvertError ? (
                        <img
                            aria-hidden
                            className="cloud-storage-file-title-convert-error"
                            height={11}
                            src={convertErrorSVG}
                            width={11}
                        />
                    ) : null}
                </span>
                {parentDirectoryPath &&
                    resourceType === FileResourceType.Directory &&
                    fileUUID === "temporaryDirectory" && (
                        <CloudStorageNewDirectory
                            parentDirectoryPath={parentDirectoryPath}
                            onNewDirectory={onNewDirectoryFile}
                        />
                    )}
                {renamingFileUUID === fileUUID ? (
                    <CloudStorageFileTitleRename
                        fileName={fileName}
                        fileResourceType={resourceType}
                        fileUUID={fileUUID}
                        onRename={onRename}
                    />
                ) : titleClickable ? (
                    <a
                        className="cloud-storage-file-title-content"
                        onClick={e => {
                            e.preventDefault();
                            onTitleClick && onTitleClick(fileUUID, pushHistory);
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
        case "": {
            return directorySVG;
        }
        default: {
            return defaultSVG;
        }
    }
}
