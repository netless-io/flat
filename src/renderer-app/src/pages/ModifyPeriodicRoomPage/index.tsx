import { Divider } from "antd";
import { observer } from "mobx-react-lite";
import React from "react";
import { useHistory, useParams } from "react-router-dom";
import back from "../../assets/image/back.svg";
import MainPageLayout from "../../components/MainPageLayout";
import { RouteNameType, RouteParams } from "../../utils/routes";
import "./ModifyPeriodicRoomPage.less";
import { PeriodicRoomForm } from "./PeriodicRoomForm";

type ModifyPeriodicRoomPageProps = {
    periodicUUID: string;
};

export const ModifyPeriodicRoomPage = observer<ModifyPeriodicRoomPageProps>(
    function ModifyPeriodicRoomPage() {
        const history = useHistory();
        const { periodicUUID } = useParams<RouteParams<RouteNameType.ModifyPeriodicRoomPage>>();

        return (
            <MainPageLayout>
                <div className="modify-periodic-room-box">
                    <div className="modify-periodic-room-nav">
                        <div className="modify-periodic-room-head">
                            <div
                                onClick={() => history.goBack()}
                                className="modify-periodic-room-back"
                            >
                                <img src={back} alt="back" />
                                <span>返回</span>
                            </div>
                            <Divider type="vertical" />
                            <h1 className="modify-periodic-room-title">修改房间</h1>
                        </div>
                        <div className="user-schedule-cut-line" />
                    </div>
                    <div className="modify-periodic-room-body">
                        <div className="modify-periodic-room-mid">
                            <PeriodicRoomForm periodicUUID={periodicUUID} />
                        </div>
                    </div>
                </div>
            </MainPageLayout>
        );
    },
);
