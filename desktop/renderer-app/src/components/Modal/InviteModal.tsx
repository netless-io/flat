import "./InviteModal.less";

import React, { useContext, useEffect, useMemo } from "react";
import { observer } from "mobx-react-lite";
import { message, Modal } from "antd";
import { differenceInCalendarDays, format } from "date-fns/fp";
import { RoomItem } from "../../stores/RoomStore";
import { GlobalStoreContext, RoomStoreContext } from "../StoreProvider";
import { clipboard } from "electron";
import { getWeekNames } from "../WeekRateSelector";
import { errorTips } from "../Tips/ErrorTips";

const completeTimeFormat = format("yyyy-MM-dd HH:mm");
const onlySuffixTimeFormat = format("HH:mm");

export interface InviteModalProps {
    visible: boolean;
    room: RoomItem;
    // after copy is performed
    onCopied: () => void;
    onCancel: () => void;
}

export const InviteModal = observer<InviteModalProps>(function InviteModal({
    visible,
    room,
    onCopied,
    onCancel,
}) {
    const globalStore = useContext(GlobalStoreContext);
    const roomStore = useContext(RoomStoreContext);

    const { beginTime, endTime, periodicUUID, roomUUID, title } = room;
    const uuid = periodicUUID || roomUUID;

    useEffect(() => {
        if (periodicUUID) {
            roomStore.syncPeriodicRoomInfo(periodicUUID).catch(errorTips);
        }
    }, [periodicUUID, roomStore]);

    const formattedTimeRange = useMemo<string>(() => {
        if (!beginTime || !endTime) {
            return "";
        }

        const formatBeginTime = completeTimeFormat(beginTime!);
        const formatEndTime =
            differenceInCalendarDays(beginTime!, endTime!) !== 0
                ? completeTimeFormat(endTime!)
                : onlySuffixTimeFormat(endTime!);

        return `${formatBeginTime}~${formatEndTime}`;
    }, [beginTime, endTime]);

    const onCopy = (): void => {
        const basePrefixText =
            `${globalStore.userName} 邀请你加入 Flat 房间\n` +
            `房间主题：${title}\n` +
            (formattedTimeRange ? `开始时间：${formattedTimeRange}\n` : "");
        const baseSuffixText =
            `\n房间号：${uuid}\n\n` +
            `打开（没有安装的话请先下载并安装）并登录 Flat，点击加入房间，输入房间号即可加入和预约`;

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
        onCopied();
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
            <div className="invite-modal-header">
                <span>{globalStore.userName} 邀请加入 FLAT 房间</span>
                <span>可通过房间号加入和预约</span>
            </div>
            <div className="invite-modal-content">
                <div className="invite-modal-content-item">
                    <span>房间主题</span>
                    <span className="invite-modal-content-title">{title}</span>
                </div>
                <div className="invite-modal-content-item">
                    <span>房间号</span>
                    <span style={{ userSelect: "text" }}>{uuid}</span>
                </div>
                {formattedTimeRange && (
                    <div className="invite-modal-content-item">
                        <span>开始时间</span>
                        <span>{formattedTimeRange}</span>
                    </div>
                )}
            </div>
            {/* @TODO Add invite URL */}
            {/*<Input type="text" placeholder="https://netless.link/url/5f2259d5069bc052d2" />*/}
        </Modal>
    );
});
