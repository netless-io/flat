import React from "react";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import { CloudStorageStore } from "./store";
import { CloudStorageFileList } from "../../components/CloudStorage";

export interface CloudStorageFileListContainerProps {
    store: CloudStorageStore;
    isLoadingData: Boolean;
}

export const CloudStorageFileListContainer = observer<CloudStorageFileListContainerProps>(
    function CloudStorageFileListContainer({ store, isLoadingData }) {
        return (
            <CloudStorageFileList
                titleClickable
                fileMenus={store.fileMenus}
                files={toJS(store.files)}
                isLoadingData={isLoadingData}
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
