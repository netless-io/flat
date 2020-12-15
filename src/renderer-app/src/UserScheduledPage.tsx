import "./UserScheduledPage.less";
import React from "react";
import { Breadcrumb } from "antd";
import MainPageLayout from "./components/MainPageLayout";
import { HomeOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

export default class UserScheduledPage extends React.Component<{}> {
    public render(): React.ReactNode {
        return (
            <MainPageLayout>
                <div className="user-schedule-header">
                    <Breadcrumb>
                        <Link to={"/user/"}>
                            <Breadcrumb.Item onClick={() => {}}>
                                <HomeOutlined />
                                <span>首页</span>
                            </Breadcrumb.Item>
                        </Link>
                        <Breadcrumb.Item>房间详情</Breadcrumb.Item>
                    </Breadcrumb>
                </div>
                <div className="user-schedule-box">
                    <div>预定房间</div>
                    <div></div>
                </div>
            </MainPageLayout>
        );
    }
}
