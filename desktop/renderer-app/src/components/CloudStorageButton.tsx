// TODO: remove this component when multi sub window is Done
import "./CloudStorageButton.less";

import { Modal } from "antd";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { CloudStoragePanel } from "../pages/CloudStoragePage/CloudStoragePanel";
import { TopBarRightBtn } from "./TopBarRightBtn";
import { ClassRoomStore } from "../stores/class-room-store";

interface CloudStorageButtonProps {
    classroom: ClassRoomStore;
}

export const CloudStorageButton = observer<CloudStorageButtonProps>(function CloudStorageButton({
    classroom,
}) {
    const { t } = useTranslation();
    const hideModal = useCallback(() => classroom.toggleCloudStoragePanel(false), [classroom]);
    const showModal = useCallback(() => classroom.toggleCloudStoragePanel(true), [classroom]);

    if (!classroom.whiteboardStore.isWritable) {
        return null;
    }

    return (
        <>
            <TopBarRightBtn title="Open Cloud Storage" icon="cloud-storage" onClick={showModal} />
            <Modal
                title={t("my-cloud ")}
                onCancel={hideModal}
                destroyOnClose
                footer={[]}
                visible={classroom.isCloudStoragePanelVisible}
                className="cloud-storage-button-modal"
                centered
            >
                <CloudStoragePanel
                    cloudStorage={classroom.whiteboardStore.cloudStorageStore}
                    onCoursewareInserted={hideModal}
                />
            </Modal>
        </>
    );
});
