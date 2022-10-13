import "./style.less";

import { CloudStorageContainer } from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useMemo } from "react";
import { CloudStorageStore } from "@netless/flat-stores";
import { useHistory, useLocation } from "react-router-dom";

export interface CloudStoragePanelProps {
    cloudStorage: CloudStorageStore;
    onCoursewareInserted?: () => void;
}

export const CloudStoragePanel = observer<CloudStoragePanelProps>(function CloudStoragePanel({
    cloudStorage,
    onCoursewareInserted,
}) {
    const history = useHistory();
    const location = useLocation();
    const path = useMemo(() => new URLSearchParams(location.search).get("path"), [location.search]);

    const pushHistory = useCallback(
        (path: string): void => {
            const search = new URLSearchParams({ path }).toString();
            history.push({ search });
        },
        [history],
    );

    useEffect(
        () => cloudStorage.initialize({ onCoursewareInserted }),
        [cloudStorage, onCoursewareInserted],
    );

    useEffect(() => {
        if (path !== null) {
            cloudStorage.onParentDirectoryPathClick(path);
        }
    }, [path, cloudStorage]);

    return <CloudStorageContainer path={path} pushHistory={pushHistory} store={cloudStorage} />;
});
