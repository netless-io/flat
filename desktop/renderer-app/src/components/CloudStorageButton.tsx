// TODO: remove this component when multi sub window is Done
import "./CloudStorageButton.less";

import { Modal } from "antd";
import { observer } from "mobx-react-lite";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { SVGCloudOutlined, TopBarRightBtn } from "flat-components";
import { CloudStoragePanel } from "../pages/CloudStoragePage/CloudStoragePanel";
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
                title={t("my-cloud ")}
                visible={classroom.isCloudStoragePanelVisible}
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
