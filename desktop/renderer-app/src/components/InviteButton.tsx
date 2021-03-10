import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { TopBarRightBtn } from "./TopBarRightBtn";
import { RoomItem } from "../stores/RoomStore";
import { InviteModal } from "./Modal/InviteModal";

export interface InviteButtonProps {
    roomInfo?: RoomItem;
}

export const InviteButton = observer<InviteButtonProps>(function InviteButton({ roomInfo }) {
    const [isShowInviteModal, showInviteModal] = useState(false);
    return (
        <div>
            <TopBarRightBtn title="Invite" icon="invite" onClick={() => showInviteModal(true)} />
            {roomInfo && (
                <InviteModal
                    room={roomInfo}
                    visible={isShowInviteModal}
                    onCancel={() => showInviteModal(false)}
                />
            )}
        </div>
    );
});

export default InviteButton;
