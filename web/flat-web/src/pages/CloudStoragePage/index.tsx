import "./style.less";
import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { CloudStorageContainer } from "flat-components";
import { PageStoreContext } from "../../components/StoreProvider";
import { CloudStorageStore } from "./store";

export interface CloudStoragePageProps {}

export const CloudStoragePage = observer<CloudStoragePageProps>(function CloudStoragePage() {
    const [store] = useState(
        () => new CloudStorageStore({ compact: false, insertCourseware: () => {} }),
    );
    useEffect(() => store.initialize(), [store]);

    const pageStore = useContext(PageStoreContext);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => pageStore.configure(), []);

    return <CloudStorageContainer store={store} />;
});

export default CloudStoragePage;
