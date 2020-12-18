import React, { PureComponent } from "react";
import "./RoomDetailPage.less";
import MainPageLayout from "./components/MainPageLayout";
import { Link } from "react-router-dom";
import back from "./assets/image/back.svg";
import home_icon_gray from "./assets/image/home-icon-gray.svg";
import room_type from "./assets/image/room-type.svg";
import docs_icon from "./assets/image/docs-icon.svg";
import { Button } from "antd";

export type RoomDetailPageState = {
    isTeacher: boolean;
};

export default class RoomDetailPage extends PureComponent<{}, RoomDetailPageState> {
    public constructor(props: {}) {
        super(props);
        this.state = {
            isTeacher: true,
        };
    }

    private renderButton = (): React.ReactNode => {
        const { isTeacher } = this.state;
        if (isTeacher) {
            return (
                <div className="user-room-btn-box">
                    <Button className="user-room-btn" danger>
                        取消房间
                    </Button>
                    <Button className="user-room-btn">修改房间</Button>
                    <Button className="user-room-btn">邀请加入</Button>
                    <Button type="primary" className="user-room-btn">
                        进入房间
                    </Button>
                </div>
            );
        } else {
            return (
                <div className="user-room-btn-box">
                    <Button className="user-room-btn" danger>
                        删除房间
                    </Button>
                    <Button className="user-room-btn">邀请加入</Button>
                    <Button type="primary" className="user-room-btn">
                        进入房间
                    </Button>
                </div>
            );
        }
    };

    public render(): React.ReactNode {
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
                            <div className="user-title">房间详情</div>
                        </div>
                        <div className="user-schedule-cut-line" />
                    </div>
                    <div className="user-schedule-body">
                        <div className="user-schedule-mid">
                            <div className="user-room-time">
                                <div className="user-room-time-box">
                                    <div className="user-room-time-number">14:30</div>
                                    <div className="user-room-time-date">2020/11/25</div>
                                </div>
                                <div className="user-room-time-mid">
                                    <div className="user-room-time-during">1 小时</div>
                                    <div className="user-room-time-state">待开始</div>
                                </div>
                                <div className="user-room-time-box">
                                    <div className="user-room-time-number">15:30</div>
                                    <div className="user-room-time-date">2020/11/25</div>
                                </div>
                            </div>
                            <div className="user-room-cut-line" />
                            <div className="user-room-detail">
                                <div className="user-room-inf">
                                    <div className="user-room-docs-title">
                                        <img src={home_icon_gray} alt={"home_icon_gray"} />
                                        <span>房间号</span>
                                    </div>
                                    <div className="user-room-docs-right">
                                        5f2259d5069bc052d255f2259d50f225
                                    </div>
                                </div>
                                <div className="user-room-inf">
                                    <div className="user-room-docs-title">
                                        <img src={room_type} alt={"room_type"} />
                                        <span>房间类型</span>
                                    </div>
                                    <div className="user-room-docs-right">一对一</div>
                                </div>
                                <div className="user-room-docs">
                                    <div className="user-room-docs-title">
                                        <img src={docs_icon} alt={"docs_icon"} />
                                        <span>课件.xxx (动态)</span>
                                    </div>
                                    <div className="user-room-docs-set">缓存</div>
                                </div>
                                <div className="user-room-docs">
                                    <div className="user-room-docs-title">
                                        <img src={docs_icon} alt={"docs_icon"} />
                                        <span>课件.xxx (动态)</span>
                                    </div>
                                    <div className="user-room-docs-set">缓存</div>
                                </div>
                            </div>
                            {this.renderButton()}
                        </div>
                    </div>
                </div>
            </MainPageLayout>
        );
    }
}
