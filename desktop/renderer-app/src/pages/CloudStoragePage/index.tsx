import { CloudStorageContainer } from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import MainPageLayout from "../../components/MainPageLayout";
import { WhiteboardStore } from "../../stores/WhiteboardStore";
import { useWindowSize } from "../../utils/hooks/useWindowSize";
import { CloudStorageStore } from "./store";
import "./style.less";

export interface CloudStoragePageProps {
    compact?: boolean;
    /** only works in compact mode */
    whiteboard?: WhiteboardStore;
}

export const CloudStoragePage = observer<CloudStoragePageProps>(function CloudStoragePage({
    compact,
    whiteboard,
}) {
    useWindowSize("Main");

    const [store] = useState(() => new CloudStorageStore({ compact, whiteboard }));

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
