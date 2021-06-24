import "./style.less";
import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { CloudStorageContainer } from "flat-components";
import { PageStoreContext } from "../../components/StoreProvider";
import { CloudStorageStore } from "./store";
import { useTranslation } from "react-i18next";

export interface CloudStoragePageProps {}

export const CloudStoragePage = observer<CloudStoragePageProps>(function CloudStoragePage() {
    const { i18n } = useTranslation();
    const [store] = useState(
        () => new CloudStorageStore({ compact: false, insertCourseware: () => {}, i18n }),
    );
    useEffect(() => store.initialize(), [store]);

    const pageStore = useContext(PageStoreContext);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => pageStore.configure(), []);

    return <CloudStorageContainer store={store} />;
});

export default CloudStoragePage;
