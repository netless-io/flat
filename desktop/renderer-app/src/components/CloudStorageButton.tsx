// TODO: remove this component when multi sub window is Done

import { Modal } from "antd";
import { observer } from "mobx-react-lite";
import React, { useCallback, useState } from "react";
import { CloudStoragePage } from "../pages/CloudStoragePage";
import { WhiteboardStore } from "../stores/WhiteboardStore";
import { TopBarRightBtn } from "./TopBarRightBtn";
import "./CloudStorageButton.less";

interface CloudStorageButtonProps {
    whiteboard: WhiteboardStore;
}

export const CloudStorageButton = observer<CloudStorageButtonProps>(function CloudStorageButton({
    whiteboard,
}) {
    const [visible, setVisible] = useState(false);
    const hideModal = useCallback(() => setVisible(false), [setVisible]);
    const showModal = useCallback(() => setVisible(true), [setVisible]);

    if (!whiteboard.isWritable) {
        return null;
    }

    return (
        <>
            <TopBarRightBtn title="Open Cloud Storage" icon="cloud-storage" onClick={showModal} />
            <Modal
                title="我的云盘"
                onCancel={hideModal}
                destroyOnClose
                footer={[]}
                visible={visible}
                className="cloud-storage-button-modal"
                centered
            >
                <CloudStoragePage
                    compact
                    whiteboard={whiteboard}
                    onCoursewareInserted={hideModal}
                />
            </Modal>
        </>
    );
});
