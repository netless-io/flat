import React, { ReactNode } from "react";
import "./MainRoomMenu.less";
import { Button, Input, Modal, Checkbox, Dropdown, Menu, Select } from "antd";
import join from "../assets/image/join.svg";
import create from "../assets/image/creat.svg";
import dropdown from "../assets/image/dropdown.svg";
import book from "../assets/image/book.svg";
import { RouteComponentProps } from "react-router";
const { Option } = Select;
const modalWidth: number = 368;
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

    public render() {
        const { isScheduledVisible } = this.state;
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
                {this.renderJoinModal()}
                {this.renderCreateModal()}
            </div>
        );
    }

    private renderCreateModal = (): ReactNode => {
        const { isCreateModalVisible } = this.state;
        return (
            <Modal
                title="创建房间"
                width={modalWidth}
                visible={isCreateModalVisible}
                okText={"创建"}
                cancelText={"取消"}
                onOk={() => {
                    this.setState({ isCreateModalVisible: false });
                }}
                onCancel={() => {
                    this.setState({ isCreateModalVisible: false });
                }}
            >
                <div className="modal-inner-name">主题</div>
                <div className="modal-inner-input">
                    <Input placeholder={""} />
                </div>
                <div className="modal-inner-name">类型</div>
                <div className="modal-inner-input">
                    <Select style={{ width: 320 }} defaultValue="large">
                        <Option value="large">大班课</Option>
                        <Option value="medium">小班课</Option>
                        <Option value="small">一对一</Option>
                    </Select>
                </div>
                <div className="modal-inner-name">加入选项</div>
                <div className="modal-inner-check">
                    <Checkbox />
                    <span className="modal-inner-text">开启摄像头</span>
                </div>
            </Modal>
        );
    };
    private renderJoinModal = (): ReactNode => {
        const { isJoinModalVisible } = this.state;
        const menu = (
            <Menu className="modal-menu-item">
                <Menu.Item>1st menu item</Menu.Item>
                <Menu.Item>2nd menu item</Menu.Item>
                <Menu.Item>3rd menu item</Menu.Item>
                <Menu.Divider />
                <Button style={{ width: 320 }} type="link">
                    清空记录
                </Button>
            </Menu>
        );
        return (
            <Modal
                title="加入房间"
                width={modalWidth}
                visible={isJoinModalVisible}
                okText={"确认"}
                cancelText={"取消"}
                onOk={() => {
                    this.setState({ isJoinModalVisible: false });
                }}
                onCancel={() => {
                    this.setState({ isJoinModalVisible: false });
                }}
            >
                <div className="modal-inner-name">房间号</div>
                <div className="modal-inner-input">
                    <Input
                        suffix={
                            <Dropdown trigger={["click"]} placement="bottomRight" overlay={menu}>
                                <img
                                    className="modal-dropdown-icon"
                                    src={dropdown}
                                    alt={"dropdown"}
                                />
                            </Dropdown>
                        }
                    />
                </div>
                <div className="modal-inner-name">昵称</div>
                <div className="modal-inner-input">
                    <Input />
                </div>
                <div className="modal-inner-name">加入选项</div>
                <div className="modal-inner-check">
                    <Checkbox />
                    <span className="modal-inner-text">开启麦克风</span>
                </div>
                <div className="modal-inner-check">
                    <Checkbox />
                    <span className="modal-inner-text">开启摄像头</span>
                </div>
            </Modal>
        );
    };
}
