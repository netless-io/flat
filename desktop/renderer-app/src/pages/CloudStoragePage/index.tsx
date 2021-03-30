import { CloudStorageContainer } from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import MainPageLayout from "../../components/MainPageLayout";
import { useWindowSize } from "../../utils/hooks/useWindowSize";
import { CloudStorageStore } from "./store";
import "./style.less";

export interface CloudStoragePageProps {
    compact?: boolean;
}

export const CloudStoragePage = observer<CloudStoragePageProps>(function CloudStoragePage({
    compact,
}) {
    useWindowSize("Main");

    const [store] = useState(() => new CloudStorageStore(compact ?? false));

    useEffect(() => {
        store.initialize();
        return () => store.destroy();
    }, [store]);

    return compact ? (
        <CloudStorageContainer store={store} />
    ) : (
        <MainPageLayout>
            <CloudStorageContainer store={store} />
        </MainPageLayout>
    );
});
