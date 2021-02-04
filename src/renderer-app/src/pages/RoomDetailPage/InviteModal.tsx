import React from "react";
import { observer } from "mobx-react-lite";
import { Modal } from "antd";
import { differenceInCalendarDays, format } from "date-fns/fp";
import { RoomItem } from "../../stores/RoomStore";

const completeTimeFormat = format("yyyy-MM-dd HH:mm");
const onlySuffixTimeFormat = format("HH:mm");

export interface InviteModalProps {
    visible: boolean;
    room: RoomItem;
    onCopy: (text: string) => void;
    onCancel: () => void;
}

export const InviteModal = observer<InviteModalProps>(function InviteModal({
    visible,
    onCopy,
    onCancel,
    room,
}) {
    const { beginTime, endTime, ownerUserName, periodicUUID, roomUUID, title } = room;
    const uuid = periodicUUID || roomUUID;

    const formatBeginTime = completeTimeFormat(beginTime!);
    const formatEndTime =
        differenceInCalendarDays(beginTime!, endTime!) !== 0
            ? completeTimeFormat(endTime!)
            : onlySuffixTimeFormat(endTime!);

    return (
        <Modal
            width={460}
            visible={visible}
            onOk={() => onCopy(uuid)}
            onCancel={onCancel}
            okText="复制"
            cancelText="取消"
            className="invite-modal"
        >
            <div className="modal-header">
                <span>{ownerUserName} 邀请加入 FLAT 房间</span>
                <span>点击链接加入，或添加至房间列表</span>
            </div>
            <div className="modal-content">
                <div className="modal-content-left">
                    <span>房间主题</span>
                    <span>房间号</span>
                    <span>开始时间</span>
                </div>
                <div className="modal-content-right">
                    <span>{title}</span>
                    <span style={{ userSelect: "text" }}>{uuid}</span>
                    {/* @TODO Add time */}
                    <span>
                        {formatBeginTime}~{formatEndTime}
                    </span>
                </div>
            </div>
            {/* @TODO Add invite URL */}
            {/*<Input type="text" placeholder="https://netless.link/url/5f2259d5069bc052d2" />*/}
        </Modal>
    );
});
