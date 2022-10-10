import "./style.less";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { CloudStorageContainer } from "flat-components";
import { CloudStorageStore } from "@netless/flat-stores";
import { useLoginCheck } from "../utils/use-login-check";
import { PageStoreContext } from "../components/StoreProvider";
import { useHistory, useLocation } from "react-router-dom";

export interface CloudStoragePageProps {}

export const CloudStoragePage = observer<CloudStoragePageProps>(function CloudStoragePage() {
    useLoginCheck();

    const history = useHistory();
    const location = useLocation();

    const [store] = useState(
        () =>
            new CloudStorageStore({
                compact: false,
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                insertCourseware: () => {},
            }),
    );
    const path = useMemo(() => new URLSearchParams(location.search).get("path"), [location.search]);

    const pushHistory = useCallback(
        (path: string): void => {
            const search = new URLSearchParams({ path }).toString();
            history.push({ search });
        },
        [history],
    );

    useEffect(() => {
        if (path !== null) {
            store.onParentDirectoryPathClick(path);
        }
    }, [path, store]);

    useEffect(() => store.initialize(), [store]);

    const pageStore = useContext(PageStoreContext);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => pageStore.configure(), []);

    return <CloudStorageContainer path={path} pushHistory={pushHistory} store={store} />;
});

export default CloudStoragePage;
