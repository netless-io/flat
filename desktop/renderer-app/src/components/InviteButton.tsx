import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { TopBarRightBtn } from "./TopBarRightBtn";
import { RoomItem } from "../stores/room-store";
import { InviteModal } from "./Modal/InviteModal";

export interface InviteButtonProps {
    roomInfo?: RoomItem;
}

export const InviteButton = observer<InviteButtonProps>(function InviteButton({ roomInfo }) {
    const [isShowInviteModal, showInviteModal] = useState(false);
    const hideInviteModal = (): void => showInviteModal(false);
    return (
        <div>
            <TopBarRightBtn title="Invite" icon="invite" onClick={() => showInviteModal(true)} />
            {roomInfo && (
                <InviteModal
                    room={roomInfo}
                    visible={isShowInviteModal}
                    onCopied={hideInviteModal}
                    onCancel={hideInviteModal}
                />
            )}
        </div>
    );
});

export default InviteButton;
