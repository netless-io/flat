import "./style.less";
import React, { useContext, useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { CloudStorageContainer } from "flat-components";
import { PageStoreContextLegacy } from "../components/PageStoreContextLegacy";
import { CloudStorageStore } from "@netless/flat-stores";
import { useLoginCheck } from "../utils/use-login-check";

export interface CloudStoragePageProps {}

export const CloudStoragePage = observer<CloudStoragePageProps>(function CloudStoragePage() {
    useLoginCheck();

    const { i18n } = useTranslation();
    const [store] = useState(
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => new CloudStorageStore({ compact: false, insertCourseware: () => {}, i18n }),
    );
    useEffect(() => store.initialize(), [store]);

    const pageStoreLegacy = useContext(PageStoreContextLegacy);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => pageStoreLegacy.configure(), []);

    return <CloudStorageContainer store={store} />;
});

export default CloudStoragePage;
