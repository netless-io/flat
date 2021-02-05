import { Divider } from "antd";
import { observer } from "mobx-react-lite";
import React from "react";
import { Link, useParams } from "react-router-dom";
import back from "../../assets/image/back.svg";
import MainPageLayout from "../../components/MainPageLayout";
import { RouteNameType, RouteParams } from "../../utils/routes";
import "./ModifyOrdinaryRoomPage.less";
import { OrdinaryRoomForm } from "./OrdinaryRoomForm";
import { PeriodicSubRoomForm } from "./PeriodicSubRoomForm";

type ModifyOrdinaryRoomPageProps = {
    roomUUID: string;
    periodicUUID?: string;
};

export const ModifyOrdinaryRoomPage = observer<ModifyOrdinaryRoomPageProps>(
    function ModifyOrdinaryRoomPage() {
        const { roomUUID, periodicUUID } = useParams<RouteParams<RouteNameType.RoomDetailPage>>();

        return (
            <MainPageLayout>
                <div className="modify-ordinary-room-box">
                    <div className="modify-ordinary-room-nav">
                        <div className="modify-ordinary-room-head">
                            <Link to={"/user/"}>
                                <div className="modify-ordinary-room-back">
                                    <img src={back} alt="back" />
                                    <span>返回</span>
                                </div>
                            </Link>
                            <Divider type="vertical" />
                            <div className="modify-ordinary-room-title">修改房间</div>
                        </div>
                        <div className="modify-ordinary-room-cut-line" />
                    </div>
                    <div className="modify-ordinary-room-body">
                        {periodicUUID ? (
                            <div className="modify-ordinary-room-mid">
                                <PeriodicSubRoomForm
                                    roomUUID={roomUUID}
                                    periodicUUID={periodicUUID}
                                />
                            </div>
                        ) : (
                            <div className="modify-ordinary-room-mid">
                                <OrdinaryRoomForm roomUUID={roomUUID} />
                            </div>
                        )}
                    </div>
                </div>
            </MainPageLayout>
        );
    },
);
