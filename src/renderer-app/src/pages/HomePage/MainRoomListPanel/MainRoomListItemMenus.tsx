import { Menu } from "antd";
import { MenuProps } from "antd/lib/menu";
import React, { useContext } from "react";
import { RoomStoreContext } from "../../../components/StoreProvider";
import { globalStore } from "../../../stores/GlobalStore";
import { ModifyRoomItem } from "../../../components/MoreMenu/ModifyRoomItem";
import { RemoveRoomItem } from "../../../components/MoreMenu/RemoveRoomItem";
import { DeleteRoomHistoryItem } from "../../../components/MoreMenu/DeleteRoomHistoryItem";
import { CopyInvitationItem } from "../../../components/MoreMenu/CopyInvitationItem";
import { RoomDetailsItem } from "../../../components/MoreMenu/RoomDetailsItem";

export interface MainRoomListItemMenusProps extends MenuProps {
    roomUUID: string;
    periodicUUID?: string;
    isHistoryList: boolean;
    ownerUUID: string;
}

export const MainRoomListItemMenus = React.memo<MainRoomListItemMenusProps>(
    function MainRoomListItemMenus({
        roomUUID,
        periodicUUID,
        isHistoryList,
        ownerUUID,
        onClick,
        ...restProps
    }) {
        const roomStore = useContext(RoomStoreContext);

        const roomInfo = roomStore.rooms.get(roomUUID);

        const isCreator = ownerUUID === globalStore.userUUID;

        return (
            // pass down props so that antd dropdrown menu shadow is rendered properly
            <>
                <Menu {...restProps} onClick={e => e.domEvent.stopPropagation()}>
                    <RoomDetailsItem {...restProps} room={roomInfo} />
                    {isHistoryList ? (
                        <DeleteRoomHistoryItem {...restProps} room={roomInfo} />
                    ) : (
                        <>
                            <ModifyRoomItem {...restProps} room={roomInfo} isCreator={isCreator} />
                            <RemoveRoomItem {...restProps} room={roomInfo} isCreator={isCreator} />
                            <CopyInvitationItem {...restProps} room={roomInfo} />
                        </>
                    )}
                </Menu>
            </>
        );
    },
);

export default MainRoomListItemMenus;
