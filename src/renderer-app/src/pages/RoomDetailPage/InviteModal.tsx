import React from "react";
import { observer } from "mobx-react-lite";
import { Input, Modal } from "antd";
import { RoomItem } from "../../stores/RoomStore";

export interface InviteModalProps {
    visible: boolean;
    room: RoomItem;
    onCancel: () => void;
}

export const InviteModal = observer<InviteModalProps>(function InviteModal({
    visible,
    onCancel,
    room,
}) {
    return (
        <Modal width={460} visible={visible} onCancel={onCancel} okText="复制" cancelText="取消">
            <div className="modal-header">
                <div>邀请加入 FLAT 房间</div>
                <span>点击链接加入，或添加至房间列表</span>
            </div>
            <div className="modal-content">
                <div className="modal-content-left">
                    <span>房间主题</span>
                    <span>房间号</span>
                    <span>开始时间</span>
                </div>
                <div className="modal-content-right">
                    <div>{room.title}</div>
                    <span style={{ userSelect: "text" }}>{room.roomUUID}</span>
                    {/* @TODO Add time */}
                    <div>2020/11/21 11:21~11~22</div>
                </div>
            </div>
            {/* @TODO Add invite URL */}
            <Input type="text" placeholder="https://netless.link/url/5f2259d5069bc052d2" />
        </Modal>
    );
});
