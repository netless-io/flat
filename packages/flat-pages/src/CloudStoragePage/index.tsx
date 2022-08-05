import "./style.less";
import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { CloudStorageContainer } from "flat-components";
import { CloudStorageStore } from "@netless/flat-stores";
import { useLoginCheck } from "../utils/use-login-check";
import { PageStoreContext } from "../components/StoreProvider";

export interface CloudStoragePageProps {}

export const CloudStoragePage = observer<CloudStoragePageProps>(function CloudStoragePage() {
    useLoginCheck();

    const [store] = useState(
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => new CloudStorageStore({ compact: false, insertCourseware: () => {} }),
    );
    useEffect(() => store.initialize(), [store]);

    const pageStore = useContext(PageStoreContext);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => pageStore.configure(), []);

    return <CloudStorageContainer store={store} />;
});

export default CloudStoragePage;
