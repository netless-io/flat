import createSVG from "../../../assets/image/creat.svg";

import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Button, Input, Modal, Checkbox } from "antd";
import { RoomType } from "../../../apiMiddleware/flatServer/constants";
import { RoomTypeSelect } from "../../../components/RoomType";

export interface CreateRoomBoxProps {
    onCreateRoom: (title: string, type: RoomType) => void;
}

export const CreateRoomBox = observer<CreateRoomBoxProps>(function CreateRoomBox({ onCreateRoom }) {
    const [roomTitle, setRoomTitle] = useState("");
    const [roomType, setRoomType] = useState(RoomType.OneToOne);
    const [isShowModal, showModal] = useState(false);

    return (
        <>
            <Button onClick={() => showModal(true)}>
                <img src={createSVG} alt="create room" />
                创建房间
            </Button>
            <Modal
                title="创建房间"
                width={368}
                visible={isShowModal}
                okText={"创建"}
                cancelText={"取消"}
                onOk={() => {
                    onCreateRoom(roomTitle, roomType);
                    showModal(false);
                }}
                onCancel={() => showModal(false)}
            >
                <div className="modal-inner-name">主题</div>
                <div className="modal-inner-input">
                    <Input value={roomTitle} onChange={e => setRoomTitle(e.target.value)} />
                </div>
                <div className="modal-inner-name">类型</div>
                <div className="modal-inner-input">
                    <RoomTypeSelect
                        className="modal-inner-select"
                        value={roomType}
                        onChange={setRoomType}
                    />
                </div>
                <div className="modal-inner-name">加入选项</div>
                <div className="modal-inner-check">
                    <Checkbox>
                        <span className="modal-inner-text">开启摄像头</span>
                    </Checkbox>
                </div>
            </Modal>
        </>
    );
});

export default CreateRoomBox;
