import React from "react";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import { CloudStorageFileList } from "../../components/CloudStorage";
import { CloudStorageStore } from "./store";

export interface CloudStorageFileListContainerProps {
    store: CloudStorageStore;
}

export const CloudStorageFileListContainer = observer<CloudStorageFileListContainerProps>(
    function CloudStorageFileListContainer({ store }) {
        return (
            <CloudStorageFileList
                titleClickable
                fileMenus={store.fileMenus}
                files={toJS(store.files)}
                renamingFileUUID={store.renamingFileUUID}
                selectedFileUUIDs={toJS(store.selectedFileUUIDs)}
                onItemMenuClick={store.onItemMenuClick}
                onItemTitleClick={store.onItemTitleClick}
                onRename={store.onRename}
                onSelectionChange={store.onSelectionChange}
            />
        );
    },
);
