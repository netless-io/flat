import { Button, Checkbox, Modal } from "antd";
import React, { useState } from "react";

export interface RemoveRoomModalProps {
    cancelModalVisible: boolean;
    isCreator: boolean;
    roomUUID?: string;
    periodicUUID?: string;
    isPeriodicDetailsPage: boolean;
    onCancel: () => void;
    onCancelRoom: (all: boolean) => void;
}

export const RemoveRoomModal: React.FC<RemoveRoomModalProps> = ({
    cancelModalVisible,
    isCreator,
    roomUUID,
    periodicUUID,
    isPeriodicDetailsPage,
    onCancel,
    onCancelRoom,
}) => {
    const [isCancelAll, setIsCancelAll] = useState(false);
    const isPeriodicRoom = !!periodicUUID && !roomUUID;
    const isSubPeriodicRoom = periodicUUID && roomUUID;

    const title = (() => {
        if (!isCreator) {
            return "移除房间";
        }

        if (isPeriodicRoom && isPeriodicDetailsPage) {
            return "取消周期性房间";
        }

        return "取消房间";
    })();

    const content = (): React.ReactElement => {
        if (!periodicUUID) {
            if (isCreator) {
                return <span>确定取消该房间？取消后其他成员将无法加入。</span>;
            }

            return <span>确定从房间列表移除该房间？移除后可通过房间号再次加入。</span>;
        }

        if (!isCreator) {
            return <span>确定从房间列表中移除该系列周期性房间？移除后可通过房间号再次加入。</span>;
        }

        if (!isPeriodicDetailsPage) {
            return (
                <>
                    <span>确定取消该房间？</span>
                    <br />
                    <br />
                    <Checkbox
                        checked={isCancelAll}
                        onChange={e => setIsCancelAll(e.target.checked)}
                    >
                        同时取消该系列周期性房间
                    </Checkbox>
                </>
            );
        }

        if (isSubPeriodicRoom) {
            return <span>确定将此房间从该周期性房间中取消？取消后其他成员将无法加入。</span>;
        }

        return <span>确定取消该周期性房间？取消后其他成员将无法加入。</span>;
    };

    return (
        <Modal
            visible={cancelModalVisible}
            title={title}
            onCancel={onCancel}
            footer={[
                <Button key="Cancel" onClick={onCancel}>
                    {isCreator ? "再想想" : "取消"}
                </Button>,
                <Button
                    key="Ok"
                    type="primary"
                    onClick={() => onCancelRoom(isCancelAll || isPeriodicRoom)}
                >
                    确定
                </Button>,
            ]}
        >
            {content()}
        </Modal>
    );
};
