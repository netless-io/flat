import React, { ReactNode } from "react";
import "./MainRoomMenu.less";
import { Button, Input, Modal, Radio } from "antd";
import join from "../assets/image/join.svg";
import create from "../assets/image/creat.svg";
import book from "../assets/image/book.svg";
import { RouteComponentProps } from "react-router";

export type MainRoomMenuState = {
    isJoinModalVisible: boolean;
    isCreateModalVisible: boolean;
    isScheduledVisible: boolean;
};

export class MainRoomMenu extends React.PureComponent<{}, MainRoomMenuState> {
    public constructor(props: RouteComponentProps<{}>) {
        super(props);
        this.state = {
            isJoinModalVisible: false,
            isCreateModalVisible: false,
            isScheduledVisible: false,
        };
    }
    private renderModal = (): ReactNode => {
        return null;
    };
    public render() {
        const { isJoinModalVisible, isCreateModalVisible, isScheduledVisible } = this.state;
        return (
            <div className="content-header-container">
                <Button
                    onClick={() => {
                        this.setState({ isJoinModalVisible: true });
                    }}
                >
                    <img src={join} alt="join room" />
                    加入房间
                </Button>
                <Button
                    onClick={() => {
                        this.setState({ isCreateModalVisible: true });
                    }}
                >
                    <img src={create} alt="create room" />
                    创建房间
                </Button>
                <Button
                    onClick={() => {
                        this.setState({ isScheduledVisible: true });
                    }}
                >
                    <img src={book} alt="book room" />
                    预定房间
                </Button>
                <Modal
                    title="加入房间"
                    width={368}
                    visible={isJoinModalVisible}
                    onOk={() => {
                        this.setState({ isJoinModalVisible: false });
                    }}
                    onCancel={() => {
                        this.setState({ isJoinModalVisible: false });
                    }}
                >
                    <div>房间号</div>
                    <Input />
                    <div>昵称</div>
                    <Input />
                    <div>加入选项</div>
                </Modal>
                <Modal
                    title="创建房间"
                    width={368}
                    visible={isCreateModalVisible}
                    onOk={() => {
                        this.setState({ isCreateModalVisible: false });
                    }}
                    onCancel={() => {
                        this.setState({ isCreateModalVisible: false });
                    }}
                >
                    <p>创建房间</p>
                </Modal>
                <Modal
                    title="预定房间"
                    width={368}
                    visible={isScheduledVisible}
                    onOk={() => {
                        this.setState({ isScheduledVisible: false });
                    }}
                    onCancel={() => {
                        this.setState({ isScheduledVisible: false });
                    }}
                >
                    <p>预定房间</p>
                </Modal>
            </div>
        );
    }
}
