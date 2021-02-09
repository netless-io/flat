import React, { useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { message, Modal } from "antd";
import { differenceInCalendarDays, format } from "date-fns/fp";
import { RoomItem } from "../../stores/RoomStore";
import { GlobalStoreContext, RoomStoreContext } from "../StoreProvider";
import { clipboard } from "electron";
import { getWeekNames } from "../WeekRateSelector";

const completeTimeFormat = format("yyyy-MM-dd HH:mm");
const onlySuffixTimeFormat = format("HH:mm");

export interface InviteModalProps {
    visible: boolean;
    room: RoomItem;
    onCancel: () => void;
}

export const InviteModal = observer<InviteModalProps>(function InviteModal({
    visible,
    room,
    onCancel,
}) {
    const globalStore = useContext(GlobalStoreContext);
    const roomStore = useContext(RoomStoreContext);

    const { beginTime, endTime, periodicUUID, roomUUID, title } = room;
    const uuid = periodicUUID || roomUUID;

    useEffect(() => {
        if (periodicUUID) {
            void roomStore.syncPeriodicRoomInfo(periodicUUID);
        }
    }, [periodicUUID, roomStore]);

    const formatBeginTime = completeTimeFormat(beginTime!);
    const formatEndTime =
        differenceInCalendarDays(beginTime!, endTime!) !== 0
            ? completeTimeFormat(endTime!)
            : onlySuffixTimeFormat(endTime!);

    const basePrefixText = `${globalStore.userName} 邀请你加入 Flat 房间
房间主题：${title}
开始时间：${formatBeginTime}～${formatEndTime}
`;
    const baseSuffixText = `
房间号：${uuid}

打开（没有安装的话请先下载并安装）并登录 Flat，点击加入房间，输入房间号即可加入和预约`;

    const onCopy = (): void => {
        if (periodicUUID) {
            const periodicInfo = roomStore.periodicRooms.get(periodicUUID);

            const content =
                periodicInfo?.periodic.weeks &&
                `重复周期：${getWeekNames(periodicInfo?.periodic.weeks || [])}`;

            clipboard.writeText(`${basePrefixText}${content}${baseSuffixText}`);
        } else {
            clipboard.writeText(`${basePrefixText}${baseSuffixText}`);
        }
        message.success("复制成功");
    };

    return (
        <Modal
            width={460}
            visible={visible}
            onOk={onCopy}
            onCancel={onCancel}
            okText="复制"
            cancelText="取消"
            className="invite-modal"
        >
            <div className="modal-header">
                <span>{globalStore.userName} 邀请加入 FLAT 房间</span>
                <span>可通过房间号加入和预约</span>
            </div>
            <div className="modal-content">
                <div className="modal-content-item">
                    <span>房间主题</span>
                    <span>{title}</span>
                </div>
                <div className="modal-content-item">
                    <span>房间号</span>
                    <span style={{ userSelect: "text" }}>{uuid}</span>
                </div>
                <div className="modal-content-item">
                    <span>开始时间</span>
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
