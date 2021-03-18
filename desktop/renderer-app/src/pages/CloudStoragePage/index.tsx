import React from "react";
import { observer } from "mobx-react-lite";
import { CloudStorage } from "flat-components";
import { useWindowSize } from "../../utils/hooks/useWindowSize";

export interface CloudStoragePageProps {}

export const CloudStoragePage = observer<CloudStoragePageProps>(function CloudStoragePage() {
    useWindowSize("Main");

    return <CloudStorage />;
});
