import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { SVGUserInvite, TopBarRightBtn } from "flat-components";
import { useTranslate } from "@netless/flat-i18n";
import { RoomItem } from "@netless/flat-stores";
import { InviteModal } from "./Modal/InviteModal";

export interface InviteButtonProps {
    roomInfo?: RoomItem;
}

export const InviteButton = observer<InviteButtonProps>(function InviteButton({ roomInfo }) {
    const t = useTranslate();
    const [isShowInviteModal, showInviteModal] = useState(false);
    const hideInviteModal = (): void => showInviteModal(false);
    return (
        <div>
            <TopBarRightBtn
                icon={<SVGUserInvite />}
                title={t("invitation")}
                onClick={() => showInviteModal(true)}
            />
            {roomInfo && (
                <InviteModal
                    room={roomInfo}
                    visible={isShowInviteModal}
                    onCancel={hideInviteModal}
                    onCopied={hideInviteModal}
                />
            )}
        </div>
    );
});

export default InviteButton;
