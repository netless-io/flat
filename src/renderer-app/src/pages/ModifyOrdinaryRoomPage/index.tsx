import React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import back from "../../assets/image/back.svg";
import MainPageLayout from "../../components/MainPageLayout";
import { OrdinaryRoomForm } from "../../components/RoomInfoForm/OrdinaryRoomForm";

type ModifyOrdinaryRoomPageProps = RouteComponentProps & {
    roomUUID: string;
    periodicUUID: string;
};

export default class ModifyOrdinaryRoomPage extends React.PureComponent<ModifyOrdinaryRoomPageProps> {
    public render(): React.ReactNode {
        const { roomUUID, periodicUUID } = this.props.location.state as ModifyOrdinaryRoomPageProps;
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
                        <div className="user-schedule-mid">
                            <OrdinaryRoomForm roomUUID={roomUUID} />
                        </div>
                    </div>
                </div>
            </MainPageLayout>
        );
    }
}
