import React, { useContext, useEffect, useState } from "react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Link, useParams } from "react-router-dom";
import MainPageLayout from "../../components/MainPageLayout";
import { RoomStatus, RoomType } from "../../apiMiddleware/flatServer/constants";
import { observer } from "mobx-react-lite";
import { generateRoutePath, RouteNameType, RouteParams, usePushHistory } from "../../utils/routes";
import { GlobalStoreContext, RoomStoreContext } from "../../components/StoreProvider";
import LoadingPage from "../../LoadingPage";
import { useComputed } from "../../utils/mobx";
import { RoomDetailFooter } from "./RoomDetailFooter";

import backSVG from "../../assets/image/back.svg";
import homeIconGraySVG from "../../assets/image/home-icon-gray.svg";
import roomTypeSVG from "../../assets/image/room-type.svg";
import docsIconSVG from "../../assets/image/docs-icon.svg";
import "./RoomDetailPage.less";
import { Divider } from "antd";
import { RoomStatusElement } from "../../components/RoomStatusElement/RoomStatusElement";

export type RoomDetailPageProps = {};

export const RoomDetailPage = observer<RoomDetailPageProps>(function RoomDetailPage() {
    const { roomUUID, periodicUUID } = useParams<RouteParams<RouteNameType.RoomDetailPage>>();
    const pushHistory = usePushHistory();
    const globalStore = useContext(GlobalStoreContext);
    const roomStore = useContext(RoomStoreContext);
    const roomInfo = roomStore.rooms.get(roomUUID);

    const formattedBeginTime = useComputed(() => formatTime(roomInfo?.beginTime), [roomInfo]).get();
    const formattedEndTime = useComputed(() => formatTime(roomInfo?.endTime), [roomInfo]).get();

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

    const isCreator = roomInfo.ownerUUID === globalStore.userUUID;

    return (
        <MainPageLayout>
            <div className="user-room-detail-box">
                <div className="user-room-detail-nav">
                    <div className="user-room-detail-head">
                        <Link to={"/user/"}>
                            <div className="user-room-detail-back">
                                <img src={backSVG} alt="back" />
                                <span>返回</span>
                            </div>
                        </Link>
                        <div className="user-segmentation" />
                        {roomInfo.title && (
                            <>
                                <Divider type="vertical" />
                                <h1 className="user-room-detail-title">{roomInfo.title}</h1>
                            </>
                        )}
                        {periodicUUID && (
                            <>
                                <div className="user-periodic">周期</div>
                                {roomInfo.roomStatus !== RoomStatus.Stopped && (
                                    <div className="user-periodic-room">
                                        {roomInfo.count && (
                                            <Link
                                                to={generateRoutePath(
                                                    RouteNameType.ScheduleRoomDetailPage,
                                                    {
                                                        periodicUUID,
                                                    },
                                                )}
                                            >
                                                查看全部 {roomInfo.count} 场房间
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="user-room-detail-cut-line" />
                </div>
                <div className="user-room-detail-body">
                    <div className="user-room-detail-mid">
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
                                    <RoomStatusElement room={roomInfo} />
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
                                <div
                                    className="user-room-docs-right"
                                    style={{ userSelect: "text" }}
                                >
                                    {periodicUUID || roomUUID}
                                </div>
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
                            room={roomInfo}
                            onJoinRoom={joinRoom}
                        />
                    </div>
                </div>
            </div>
        </MainPageLayout>
    );

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
