import fileMenusSVG from "./icons/file-menus.svg";

import React from "react";
import { Button, Dropdown, Menu } from "antd";
import { CloudStorageFileTitle } from "../CloudStorageFileTitle";
import { CloudStorageFileName } from "../types";
import { CloudFile } from "@netless/flat-server-api";

export interface CloudStorageFileListFileNameProps {
    file: CloudFile;
    index: number;
    /** Is title clickable */
    titleClickable?: boolean;
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
    /** When file menu item clicked */
    onItemMenuClick?: (fileUUID: string, menuKey: React.Key) => void;
    /** When title is clicked */
    onItemTitleClick?: (fileUUID: string) => void;
    /** UUID of file that is under renaming */
    renamingFileUUID?: string;
    /** Rename file. Empty name for cancelling */
    onRename?: (fileUUID: string, fileName?: CloudStorageFileName) => void;
}

export const CloudStorageFileListFileName =
    /* @__PURE__ */ React.memo<CloudStorageFileListFileNameProps>(
        function CloudStorageFileListFileName({
            file,
            index,
            titleClickable,
            getPopupContainer,
            fileMenus,
            onItemMenuClick,
            onItemTitleClick,
            renamingFileUUID,
            onRename,
        }) {
            const menuItems = fileMenus && fileMenus(file, index);
            const fileConvertStep =
                file.meta.whiteboardConvert?.convertStep ||
                file.meta.whiteboardProjector?.convertStep;

            return (
                <div className="cloud-storage-file-list-filename-container">
                    <CloudStorageFileTitle
                        convertStatus={fileConvertStep}
                        fileName={file.fileName}
                        fileUUID={file.fileUUID}
                        renamingFileUUID={renamingFileUUID}
                        titleClickable={titleClickable}
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
                                        onClick={({ key }) =>
                                            onItemMenuClick && onItemMenuClick(file.fileUUID, key)
                                        }
                                    >
                                        {menuItems.map(({ key, name, className = "" }) => (
                                            <Menu.Item key={key} className={className}>
                                                {name}
                                            </Menu.Item>
                                        ))}
                                    </Menu>
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
