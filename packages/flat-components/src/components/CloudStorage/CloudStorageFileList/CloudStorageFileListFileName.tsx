import fileMenusSVG from "./icons/file-menus.svg";

import React from "react";
import { Button, Dropdown, Menu } from "antd";
import { CloudStorageFileTitle } from "../CloudStorageFileTitle";
import { CloudStorageFile } from "../types";

export interface CloudStorageFileListFileNameProps {
    file: CloudStorageFile;
    index: number;
    getPopupContainer: () => HTMLElement;
    /** Render file menus item base on fileUUID */
    fileMenus?: (
        file: CloudStorageFile,
        index: number,
    ) => Array<{ key: React.Key; name: React.ReactNode }> | void | undefined | null;
    onItemMenuClick?: (fileUUID: string, menuKey: React.Key) => void;
}

export const CloudStorageFileListFileName = React.memo<CloudStorageFileListFileNameProps>(
    function CloudStorageFileListFileName({
        file,
        index,
        getPopupContainer,
        fileMenus,
        onItemMenuClick,
    }) {
        const menuItems = fileMenus && fileMenus(file, index);

        return (
            <div className="cloud-storage-file-list-filename-container">
                <CloudStorageFileTitle
                    fileName={file.fileName}
                    titleClassName="cloud-storage-file-list-filename"
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
                                    {menuItems.map(({ key, name }) => (
                                        <Menu.Item key={key}>{name}</Menu.Item>
                                    ))}
                                </Menu>
                            }
                            overlayClassName="cloud-storage-file-list-menu"
                        >
                            <Button>
                                <img src={fileMenusSVG} width={22} height={22} aria-hidden />
                            </Button>
                        </Dropdown>
                    </div>
                )}
            </div>
        );
    },
);
