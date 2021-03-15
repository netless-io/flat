import React from "react";
import { observer } from "mobx-react-lite";
import { CloudStorage } from "flat-components";

export interface CloudStoragePageProps {}

export const CloudStoragePage = observer<CloudStoragePageProps>(function CloudStoragePage() {
    return <CloudStorage />;
});
