import "./style.less";

import { CloudStorageContainer } from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MainPageLayoutContainer } from "../../components/MainPageLayoutContainer";
import { CloudStorageStore } from "./store";

export interface CloudStoragePageProps {}

export const CloudStoragePage = observer<CloudStoragePageProps>(function CloudStoragePage() {
    const { i18n } = useTranslation();
    const [store] = useState(
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => new CloudStorageStore({ compact: false, insertCourseware: () => {}, i18n }),
    );

    useEffect(() => store.initialize(), [store]);

    return (
        <MainPageLayoutContainer>
            <CloudStorageContainer store={store} />
        </MainPageLayoutContainer>
    );
});
