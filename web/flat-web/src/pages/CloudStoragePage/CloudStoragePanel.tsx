import "./style.less";

import { CloudStorageContainer } from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { CloudStorageStore } from "./store";

export interface CloudStoragePanelProps {
    cloudStorage: CloudStorageStore;
    onCoursewareInserted?: () => void;
}

export const CloudStoragePanel = observer<CloudStoragePanelProps>(function CloudStoragePanel({
    cloudStorage,
    onCoursewareInserted,
}) {
    useEffect(
        () => cloudStorage.initialize({ onCoursewareInserted }),
        [cloudStorage, onCoursewareInserted],
    );

    return <CloudStorageContainer store={cloudStorage} />;
});
