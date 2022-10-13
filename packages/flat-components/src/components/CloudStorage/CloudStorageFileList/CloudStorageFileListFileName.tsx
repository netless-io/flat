import fileMenusSVG from "./icons/file-menus.svg";

import React from "react";
import { Button, Dropdown, Menu } from "antd";
import { CloudStorageFileTitle } from "../CloudStorageFileTitle";
import { CloudStorageFileName } from "../types";
import { CloudFile } from "@netless/flat-server-api";
import { DirectoryInfo } from "../../../containers/CloudStorageContainer";
import { useHistory } from "react-router-dom";

export interface CloudStorageFileListFileNameProps {
    file: CloudFile;
    index: number;
    titleClickable?: boolean;
    /** UUID of file that is under renaming */
    renamingFileUUID?: string;
    parentDirectoryPath?: string;
    getPopupContainer: () => HTMLElement;
    /** Render file menus item base on fileUUID */
    fileMenus?: (
        file: CloudFile,
        index: number,
    ) =>
        | Array<{ key: React.Key; name: React.ReactNode; className?: string }>
        | void
        | undefined
        | null;
    onItemMenuClick?: (
        fileUUID: string,
        menuKey: React.Key,
        pushHistory: (path: string) => void,
    ) => void;
    onItemTitleClick?: (fileUUID: string, pushHistory: (path: string) => void) => void;
    /** Rename file. Empty name for cancelling */
    onRename?: (fileUUID: string, fileName?: CloudStorageFileName) => void;
    onNewDirectoryFile?: (directoryInfo: DirectoryInfo) => Promise<void>;
}

export const CloudStorageFileListFileName =
    /* @__PURE__ */ React.memo<CloudStorageFileListFileNameProps>(
        function CloudStorageFileListFileName({
            file,
            index,
            titleClickable,
            renamingFileUUID,
            parentDirectoryPath,
            getPopupContainer,
            fileMenus,
            onItemMenuClick,
            onItemTitleClick,
            onRename,
            onNewDirectoryFile,
        }) {
            const menuItems = fileMenus && fileMenus(file, index);
            const fileConvertStep =
                file.meta.whiteboardConvert?.convertStep ||
                file.meta.whiteboardProjector?.convertStep;

            const history = useHistory();
            const pushHistory = (path: string): void => {
                const search = new URLSearchParams({ path }).toString();
                history.push({ search });
            };

            return (
                <div className="cloud-storage-file-list-filename-container">
                    <CloudStorageFileTitle
                        convertStatus={fileConvertStep}
                        fileName={file.fileName}
                        fileUUID={file.fileUUID}
                        parentDirectoryPath={parentDirectoryPath}
                        renamingFileUUID={renamingFileUUID}
                        resourceType={file.resourceType}
                        titleClickable={titleClickable}
                        onNewDirectoryFile={onNewDirectoryFile}
                        onRename={onRename}
                        onTitleClick={onItemTitleClick}
                    />
                    {menuItems && menuItems.length > 0 && (
                        <div className="cloud-storage-file-list-menu-btn-wrap">
                            <Dropdown
                                className="cloud-storage-file-list-menu-btn"
                                getPopupContainer={getPopupContainer}
                                overlay={
                                    <Menu
                                        items={menuItems.map(e => ({
                                            key: e.key,
                                            className: e.className,
                                            label: e.name,
                                        }))}
                                        onClick={({ key }) =>
                                            onItemMenuClick?.(file.fileUUID, key, pushHistory)
                                        }
                                    />
                                }
                                overlayClassName="cloud-storage-file-list-menu"
                            >
                                <Button>
                                    <img aria-hidden height={22} src={fileMenusSVG} width={22} />
                                </Button>
                            </Dropdown>
                        </div>
                    )}
                </div>
            );
        },
    );
