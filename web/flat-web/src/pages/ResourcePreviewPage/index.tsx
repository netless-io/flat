import React from "react";
import { observer } from "mobx-react-lite";
import { useParams } from "react-router";
import { RouteNameType, RouteParams } from "../../utils/routes";
import { DynamicPreview } from "./DynamicPreview";
import { MediaPreview } from "./MediaPreview";
import { StaticPreview } from "./StaticPreview";
import { ErrorPage, Region } from "flat-components";
import { getFileSuffix } from "./utils";

export interface ResourcePreviewPagePageProps {}

export const ResourcePreviewPage = observer<ResourcePreviewPagePageProps>(
    function ResourcePreviewPage() {
        const { fileURL, taskToken, taskUUID, region } =
            useParams<RouteParams<RouteNameType.ResourcePreviewPage>>();

        const decodeFileName = decodeURIComponent(fileURL);

        return <div className="cloud-storage-preview-container">{renderPreviewComponent()}</div>;

        function renderPreviewComponent(): React.ReactElement {
            const fileSuffix = getFileSuffix(decodeFileName);

            switch (fileSuffix) {
                case ".pptx": {
                    if (taskUUID && taskToken) {
                        return (
                            <DynamicPreview
                                taskUUID={taskUUID}
                                taskToken={taskToken}
                                region={region as Region}
                            />
                        );
                    }
                    return <ErrorPage />;
                }
                case ".ppt":
                case ".pdf":
                case ".doc":
                case ".docx": {
                    if (taskUUID && taskToken) {
                        return (
                            <StaticPreview
                                taskUUID={taskUUID}
                                taskToken={taskToken}
                                region={region as Region}
                            />
                        );
                    }
                    return <ErrorPage />;
                }

                default: {
                    return <MediaPreview fileURL={fileURL} />;
                }
            }
        }
    },
);

export default ResourcePreviewPage;
