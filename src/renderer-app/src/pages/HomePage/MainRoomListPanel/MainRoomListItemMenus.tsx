import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "antd";
import { generateRoutePath, RouteNameType } from "../../../utils/routes";
import {
    cancelHistoryRoom,
    cancelOrdinaryRoom,
    cancelPeriodicSubRoom,
} from "../../../apiMiddleware/flatServer";

export interface MainRoomListItemMenusProps {
    roomUUID: string;
    periodicUUID?: string;
    isHistoryList: boolean;
}

export const MainRoomListItemMenus = React.memo<MainRoomListItemMenusProps>(
    function MainRoomListItemMenus({ roomUUID, periodicUUID, isHistoryList }) {
        return (
            <Menu onClick={e => e.domEvent.stopPropagation()}>
                <Menu.Item>
                    <Link
                        to={{
                            pathname: generateRoutePath(RouteNameType.RoomDetailPage, {
                                roomUUID,
                                periodicUUID,
                            }),
                        }}
                    >
                        房间详情
                    </Link>
                </Menu.Item>
                {isHistoryList ? (
                    <Menu.Item onClick={deleteRoomHistory}>删除记录</Menu.Item>
                ) : (
                    <>
                        <Menu.Item>
                            <Link
                                to={{
                                    // @TODO remove location state
                                    pathname: "/modify/",
                                    state: {
                                        roomUUID,
                                        periodicUUID,
                                    },
                                }}
                            >
                                修改房间
                            </Link>
                        </Menu.Item>
                        <Menu.Item onClick={cancelRoom}>取消房间</Menu.Item>
                        <Menu.Item>复制邀请</Menu.Item>
                    </>
                )}
            </Menu>
        );

        async function cancelRoom(): Promise<void> {
            try {
                if (periodicUUID) {
                    await cancelPeriodicSubRoom({ roomUUID, periodicUUID });
                } else {
                    await cancelOrdinaryRoom(roomUUID);
                }
            } catch (e) {
                console.error(e);
            }
        }

        async function deleteRoomHistory(): Promise<void> {
            try {
                await cancelHistoryRoom(roomUUID);
            } catch (e) {
                console.error(e);
            }
        }
    },
);

export default MainRoomListItemMenus;
