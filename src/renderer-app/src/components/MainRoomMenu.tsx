import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button, Input, Modal, Checkbox, Dropdown, Menu, Select } from "antd";
import join from "../assets/image/join.svg";
import create from "../assets/image/creat.svg";
import dropdown from "../assets/image/dropdown.svg";
import book from "../assets/image/book.svg";
import { getJoinRoomHistories, LSJoinRoomHistoryItem } from "../utils/localStorage/history";
import { RoomType } from "../apiMiddleware/flatServer/constants";
import "./MainRoomMenu.less";

const { Option } = Select;

export type MainRoomMenuProps = {
    onCreateRoom(title: string, type: RoomType): unknown;
    onJoinRoom(roomID: string): void;
};

export type MainRoomMenuState = {
    isJoinModalVisible: boolean;
    isCreateModalVisible: boolean;
    isScheduledVisible: boolean;
    createTitle: string;
    createType: RoomType;
    joinRoomHistories: LSJoinRoomHistoryItem[];
    roomID: string;
};

export class MainRoomMenu extends React.PureComponent<MainRoomMenuProps, MainRoomMenuState> {
    private readonly modalWidth: number = 368;
    public constructor(props: MainRoomMenuProps) {
        super(props);
        this.state = {
            isJoinModalVisible: false,
            isCreateModalVisible: false,
            isScheduledVisible: false,
            createTitle: "",
            createType: RoomType.BigClass,
            joinRoomHistories: [],
            roomID: "",
        };
    }

    public render() {
        return (
            <div className="content-header-container">
                <Button
                    onClick={() => {
                        this.setState({
                            isJoinModalVisible: true,
                            joinRoomHistories: getJoinRoomHistories(),
                        });
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
                <Link to={"/user/scheduled/"}>
                    <Button>
                        <img src={book} alt="book room" />
                        预定房间
                    </Button>
                </Link>
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
                width={this.modalWidth}
                visible={isCreateModalVisible}
                okText={"创建"}
                cancelText={"取消"}
                onOk={() => {
                    this.props.onCreateRoom(this.state.createTitle, this.state.createType);
                    this.setState({ isCreateModalVisible: false });
                }}
                onCancel={() => {
                    this.setState({ isCreateModalVisible: false });
                }}
            >
                <div className="modal-inner-name">主题</div>
                <div className="modal-inner-input">
                    <Input
                        value={this.state.createTitle}
                        onChange={e => this.setState({ createTitle: e.target.value })}
                    />
                </div>
                <div className="modal-inner-name">类型</div>
                <div className="modal-inner-input">
                    <Select
                        className="modal-inner-select"
                        value={this.state.createType}
                        onChange={e => this.setState({ createType: e })}
                    >
                        <Option value={RoomType.BigClass}>大班课</Option>
                        <Option value={RoomType.SmallClass}>小班课</Option>
                        <Option value={RoomType.OneToOne}>一对一</Option>
                    </Select>
                </div>
                <div className="modal-inner-name">加入选项</div>
                <div className="modal-inner-check">
                    <Checkbox>
                        <span className="modal-inner-text">开启摄像头</span>
                    </Checkbox>
                </div>
            </Modal>
        );
    };
    private renderJoinModal = (): ReactNode => {
        const { isJoinModalVisible, joinRoomHistories } = this.state;
        const menu = (
            <Menu className="modal-menu-item">
                {joinRoomHistories.map(room => (
                    <Menu.Item key={room.uuid}>{room.name || room.uuid}</Menu.Item>
                ))}
                <Menu.Divider />
                <Button className="modal-inner-select" type="link">
                    清空记录
                </Button>
            </Menu>
        );
        return (
            <Modal
                title="加入房间"
                width={this.modalWidth}
                visible={isJoinModalVisible}
                okText={"确认"}
                cancelText={"取消"}
                onOk={() => {
                    this.props.onJoinRoom(this.state.roomID);
                    this.setState({ isJoinModalVisible: false });
                }}
                onCancel={() => {
                    this.setState({ isJoinModalVisible: false });
                }}
            >
                <div className="modal-inner-name">房间号</div>
                <div className="modal-inner-input">
                    <Input
                        value={this.state.roomID}
                        onChange={e => {
                            this.setState({ roomID: e.currentTarget.value });
                        }}
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
                    <Checkbox>
                        <span className="modal-inner-text">开启麦克风</span>
                    </Checkbox>
                </div>
                <div className="modal-inner-check">
                    <Checkbox>
                        <span className="modal-inner-text">开启摄像头</span>
                    </Checkbox>
                </div>
            </Modal>
        );
    };
}
