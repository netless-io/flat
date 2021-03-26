import React from "react";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import { CloudStorageStore } from "./store";
import { CloudStorageFileList } from "../../components/CloudStorage";

export interface CloudStorageFileListContainerProps {
    store: CloudStorageStore;
}

export const CloudStorageFileListContainer = observer<CloudStorageFileListContainerProps>(
    function CloudStorageFileListContainer({ store }) {
        return (
            <CloudStorageFileList
                files={toJS(store.files)}
                selectedFileUUIDs={store.selectedFileUUIDs}
                onSelectionChange={store.onSelectionChange}
                fileMenus={store.fileMenus}
                onItemMenuClick={store.onItemMenuClick}
            />
        );
    },
);
