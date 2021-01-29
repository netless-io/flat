import { observer } from "mobx-react-lite";
import React from "react";
import { Link, useParams } from "react-router-dom";
import back from "../../assets/image/back.svg";
import MainPageLayout from "../../components/MainPageLayout";
import { OrdinaryRoomForm } from "../../components/RoomInfoForm/OrdinaryRoomForm";
import { PeriodicSubRoomForm } from "../../components/RoomInfoForm/PeriodicSubRoomForm";
import { RouteNameType, RouteParams } from "../../utils/routes";

type ModifyOrdinaryRoomPageProps = {
    roomUUID: string;
    periodicUUID?: string;
};

export const ModifyOrdinaryRoomPage = observer<ModifyOrdinaryRoomPageProps>(
    function ModifyOrdinaryRoomPage() {
        const { roomUUID, periodicUUID } = useParams<RouteParams<RouteNameType.RoomDetailPage>>();

        return (
            <MainPageLayout>
                <div className="user-schedule-box">
                    <div className="user-schedule-nav">
                        <div className="user-schedule-title">
                            <Link to={"/user/"}>
                                <div className="user-back">
                                    <img src={back} alt="back" />
                                    <span>返回</span>
                                </div>
                            </Link>
                            <div className="user-segmentation" />
                            <div className="user-title">修改房间</div>
                        </div>
                        <div className="user-schedule-cut-line" />
                    </div>
                    <div className="user-schedule-body">
                        {periodicUUID ? (
                            <div className="user-schedule-mid">
                                <PeriodicSubRoomForm
                                    roomUUID={roomUUID}
                                    periodicUUID={periodicUUID}
                                />
                            </div>
                        ) : (
                            <div className="user-schedule-mid">
                                <OrdinaryRoomForm roomUUID={roomUUID} />
                            </div>
                        )}
                    </div>
                </div>
            </MainPageLayout>
        );
    },
);
