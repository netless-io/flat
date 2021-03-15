import "./style.less";

import React from "react";
import { observer } from "mobx-react-lite";
import { CloudStorageFileList } from "./CloudStorageFileList";

export interface CloudStorageProps {}

export const CloudStorage = observer<CloudStorageProps>(function CloudStorage() {
    return <CloudStorageFileList files={[]} />;
});
