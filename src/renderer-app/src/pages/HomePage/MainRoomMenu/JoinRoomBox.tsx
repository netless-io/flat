import joinSVG from "../../../assets/image/join.svg";
import dropdownSVG from "../../../assets/image/dropdown.svg";

import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Input, Modal, Checkbox, Dropdown, Menu } from "antd";
import { getWechatInfo } from "../../../utils/localStorage/accounts";

export interface JoinRoomBoxProps {
    onJoinRoom: (roomUUID: string) => void;
}

export const JoinRoomBox = observer<JoinRoomBoxProps>(function JoinRoomBox({ onJoinRoom }) {
    const [roomUUID, setRoomUUID] = useState("");
    const [isShowModal, showModal] = useState(false);

    const historyMenu = (
        <Menu className="modal-menu-item">
            {/* {// @TODO add join room history
    joinRoomHistories.map(room => (
        <Menu.Item key={room.uuid}>{room.name || room.uuid}</Menu.Item>
    ))} */}
            <Menu.Divider />
            <Button className="modal-inner-select" type="link">
                清空记录
            </Button>
        </Menu>
    );

    return (
        <>
            <Button onClick={() => showModal(true)}>
                <img src={joinSVG} alt="join room" />
                加入房间
            </Button>
            <Modal
                title="加入房间"
                width={368}
                visible={isShowModal}
                okText={"确认"}
                cancelText={"取消"}
                onOk={() => {
                    onJoinRoom(roomUUID);
                    showModal(false);
                }}
                onCancel={() => {
                    showModal(false);
                }}
            >
                <div className="modal-inner-name">房间号</div>
                <div className="modal-inner-input">
                    <Input
                        value={roomUUID}
                        onChange={e => setRoomUUID(e.currentTarget.value)}
                        suffix={
                            <Dropdown
                                trigger={["click"]}
                                placement="bottomRight"
                                overlay={historyMenu}
                            >
                                <img
                                    className="modal-dropdown-icon"
                                    src={dropdownSVG}
                                    alt={"dropdown"}
                                />
                            </Dropdown>
                        }
                    />
                </div>
                <div className="modal-inner-name">昵称</div>
                <div className="modal-inner-input">
                    <Input value={getWechatInfo()?.name} disabled={true} />
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
        </>
    );
});
