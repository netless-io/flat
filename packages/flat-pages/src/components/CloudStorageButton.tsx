// TODO: remove this component when multi sub window is Done
import { Modal } from "antd";
import { SVGCloudOutlined, TopBarRightBtn } from "flat-components";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import { CloudStoragePanel } from "../CloudStoragePage/CloudStoragePanel";
import { ClassroomStore } from "@netless/flat-stores";
import "./CloudStorageButton.less";
import { useTranslate } from "@netless/flat-i18n";

interface CloudStorageButtonProps {
    classroom: ClassroomStore;
}

export const CloudStorageButton = observer<CloudStorageButtonProps>(function CloudStorageButton({
    classroom,
}) {
    const t = useTranslate();
    const hideModal = useCallback(() => classroom.toggleCloudStoragePanel(false), [classroom]);
    const showModal = useCallback(() => classroom.toggleCloudStoragePanel(true), [classroom]);

    if (!classroom.whiteboardStore.allowDrawing) {
        return null;
    }

    return (
        <>
            <TopBarRightBtn
                icon={<SVGCloudOutlined />}
                title={t("cloud-storage")}
                onClick={showModal}
            />
            <Modal
                centered
                destroyOnClose
                className="cloud-storage-button-modal"
                footer={[]}
                open={classroom.isCloudStoragePanelVisible}
                title={t("my-cloud")}
                onCancel={hideModal}
            >
                <CloudStoragePanel
                    cloudStorage={classroom.whiteboardStore.cloudStorageStore}
                    onCoursewareInserted={hideModal}
                />
            </Modal>
        </>
    );
});
