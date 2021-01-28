import React, { useContext, useEffect, useState } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Link, useParams } from "react-router-dom";
import MainPageLayout from "../../components/MainPageLayout";
import { RoomStatus, RoomType } from "../../apiMiddleware/flatServer/constants";
import { cancelOrdinaryRoom, cancelPeriodicSubRoom } from "../../apiMiddleware/flatServer";
import { observer } from "mobx-react-lite";
import { RouteNameType, RouteParams, usePushHistory } from "../../utils/routes";
import { RoomStoreContext } from "../../components/StoreProvider";
import LoadingPage from "../../LoadingPage";
import { useComputed } from "../../utils/mobx";
import { RoomDetailFooter } from "./RoomDetailFooter";
import { InviteModal } from "./InviteModal";

import backSVG from "../../assets/image/back.svg";
import homeIconGraySVG from "../../assets/image/home-icon-gray.svg";
import roomTypeSVG from "../../assets/image/room-type.svg";
import docsIconSVG from "../../assets/image/docs-icon.svg";
import "./RoomDetailPage.less";

export type RoomDetailPageState = {
    isTeacher: boolean;
    rate: number | null;
    roomInfo: {
        title: string;
        beginTime: Date;
        endTime: Date;
        roomType: RoomType;
        roomStatus: RoomStatus;
        ownerUUID: string;
    };
    roomUUID: string;
    periodicUUID: string;
    userUUID: string;
    isPeriodic: boolean;
    toggleCopyModal: boolean;
};

export type RoomDetailPageProps = {};

export const RoomDetailPage = observer<RoomDetailPageProps>(function RoomDetailPage() {
    const { roomUUID, periodicUUID } = useParams<RouteParams<RouteNameType.RoomDetailPage>>();
    const pushHistory = usePushHistory();
    const roomStore = useContext(RoomStoreContext);
    const roomInfo = roomStore.rooms.get(roomUUID);

    const [isShowInviteModal, showInviteModal] = useState(false);

    const formattedBeginTime = useComputed(() => formatTime(roomInfo?.beginTime)).get();
    const formattedEndTime = useComputed(() => formatTime(roomInfo?.endTime)).get();

    useEffect(() => {
        if (periodicUUID) {
            roomStore.syncPeriodicSubRoomInfo({ roomUUID, periodicUUID });
        } else {
            roomStore.syncOrdinaryRoomInfo(roomUUID);
        }
    }, [roomStore, roomUUID, periodicUUID]);

    if (!roomInfo) {
        return <LoadingPage />;
    }

    const isCreator = roomInfo.ownerUUID === roomStore.userUUID;

    return (
        <MainPageLayout>
            <div className="user-schedule-box">
                <div className="user-schedule-nav">
                    <div className="user-schedule-title">
                        <Link to={"/user/"}>
                            <div className="user-back">
                                <img src={backSVG} alt="back" />
                                <span>返回</span>
                            </div>
                        </Link>
                        <div className="user-segmentation" />
                        {roomInfo.title && <div className="user-title">{roomInfo.title}</div>}
                        {periodicUUID && (
                            <>
                                <div className="user-periodic">周期</div>
                                <div className="user-periodic-room">
                                    {roomInfo.count && (
                                        <Link
                                            to={{
                                                pathname: "/user/scheduled/info/",
                                                // @TODO 去掉 location state
                                                state: {
                                                    periodicUUID,
                                                    roomUUID,
                                                    userUUID: roomInfo.ownerUUID,
                                                    title: roomInfo.title,
                                                },
                                            }}
                                        >
                                            查看全部 {roomInfo.count} 场房间
                                        </Link>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="user-schedule-cut-line" />
                </div>
                <div className="user-schedule-body">
                    <div className="user-schedule-mid">
                        <div className="user-room-time">
                            {formattedBeginTime && (
                                <div className="user-room-time-box">
                                    <div className="user-room-time-number">
                                        {formattedBeginTime.time}
                                    </div>
                                    <div className="user-room-time-date">
                                        {formattedBeginTime.date}
                                    </div>
                                </div>
                            )}
                            <div className="user-room-time-mid">
                                <div className="user-room-time-during">1 小时</div>
                                <div className="user-room-time-state">
                                    {roomStatusLocale(roomInfo.roomStatus)}
                                </div>
                            </div>
                            {formattedEndTime && (
                                <div className="user-room-time-box">
                                    <div className="user-room-time-number">
                                        {formattedEndTime.time}
                                    </div>
                                    <div className="user-room-time-date">
                                        {formattedEndTime.date}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="user-room-cut-line" />
                        <div className="user-room-detail">
                            <div className="user-room-inf">
                                <div className="user-room-docs-title">
                                    <img src={homeIconGraySVG} alt={"home_icon_gray"} />
                                    <span>房间号</span>
                                </div>
                                <div className="user-room-docs-right">{roomUUID}</div>
                            </div>
                            <div className="user-room-inf">
                                <div className="user-room-docs-title">
                                    <img src={roomTypeSVG} alt={"room_type"} />
                                    <span>房间类型</span>
                                </div>
                                <div className="user-room-docs-right">
                                    {roomTypeLocale(roomInfo.roomType)}
                                </div>
                            </div>
                            <div className="user-room-docs">
                                <div className="user-room-docs-title">
                                    <img src={docsIconSVG} alt={"docs_icon"} />
                                    <span>课件.xxx (动态)</span>
                                </div>
                                <div className="user-room-docs-set">缓存</div>
                            </div>
                            <div className="user-room-docs">
                                <div className="user-room-docs-title">
                                    <img src={docsIconSVG} alt={"docs_icon"} />
                                    <span>课件.xxx (动态)</span>
                                </div>
                                <div className="user-room-docs-set">缓存</div>
                            </div>
                        </div>
                        <RoomDetailFooter
                            isCreator={isCreator}
                            onJoinRoom={joinRoom}
                            onCancelRoom={cancelRoom}
                            onInvite={() => showInviteModal(true)}
                        />
                    </div>
                </div>
            </div>
            <InviteModal
                visible={isShowInviteModal}
                room={roomInfo}
                onCancel={() => showInviteModal(false)}
            />
        </MainPageLayout>
    );

    async function cancelRoom(): Promise<void> {
        if (roomInfo) {
            if (roomInfo.periodicUUID) {
                await cancelPeriodicSubRoom({
                    roomUUID: roomInfo.roomUUID,
                    periodicUUID: roomInfo.periodicUUID,
                });
            } else {
                await cancelOrdinaryRoom(roomInfo.roomUUID);
            }
        }
        pushHistory(RouteNameType.UserIndexPage, {});
    }

    async function joinRoom(): Promise<void> {
        if (roomInfo) {
            const data = await roomStore.joinRoom(roomInfo.roomUUID);
            // @TODO make roomType a param
            switch (data.roomType) {
                case RoomType.OneToOne: {
                    pushHistory(RouteNameType.OneToOnePage, data);
                    break;
                }
                case RoomType.SmallClass: {
                    pushHistory(RouteNameType.SmallClassPage, data);
                    break;
                }
                default: {
                    pushHistory(RouteNameType.BigClassPage, data);
                }
            }
        }
    }
});

export default RoomDetailPage;

function formatTime(time?: number): { date: string; time: string } | null {
    return time
        ? {
              date: format(time, "yyyy/MM/dd", { locale: zhCN }),
              time: format(time, "HH:mm"),
          }
        : null;
}

function roomStatusLocale(roomStatus?: RoomStatus): string {
    switch (roomStatus) {
        case RoomStatus.Started:
        case RoomStatus.Paused: {
            return "进行中";
        }
        case RoomStatus.Stopped: {
            return "已停止";
        }
        default:
            return "未开始";
    }
}

function roomTypeLocale(roomType?: RoomType): string {
    switch (roomType) {
        case RoomType.OneToOne: {
            return "一对一";
        }
        case RoomType.SmallClass: {
            return "小班课";
        }
        default: {
            return "大班课";
        }
    }
}
