import "./index.less";

import React, { useMemo } from "react";
import { Modal } from "antd";
import { differenceInCalendarDays, format } from "date-fns/fp";
import { RoomInfo, Week } from "../../types/room";
import { getWeekNames } from "../../utils/room";

const completeTimeFormat = format("yyyy-MM-dd HH:mm");
const onlySuffixTimeFormat = format("HH:mm");

export interface InviteModalProps {
    visible: boolean;
    room: RoomInfo;
    userName: string;
    // repeated weeks for periodic rooms
    periodicWeeks?: Week[];
    onCopy: (text: string) => void;
    onCancel: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
    visible,
    room,
    periodicWeeks,
    userName,
    onCopy,
    onCancel,
}) => {
    const { beginTime, endTime, periodicUUID, roomUUID, title } = room;
    const uuid = periodicUUID || roomUUID;

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

    const onCopyClicked = (): void => {
        const basePrefixText =
            `${userName} 邀请你加入 Flat 房间\n` +
            `房间主题：${title}\n` +
            (formattedTimeRange ? `开始时间：${formattedTimeRange}\n` : "");
        const baseSuffixText =
            `\n房间号：${uuid}\n\n` +
            `打开（没有安装的话请先下载并安装）并登录 Flat，点击加入房间，输入房间号即可加入和预约`;

        if (periodicUUID) {
            const content = periodicWeeks ? `重复周期：${getWeekNames(periodicWeeks || [])}` : "";

            onCopy(`${basePrefixText}${content}${baseSuffixText}`);
        } else {
            onCopy(`${basePrefixText}${baseSuffixText}`);
        }
    };

    return (
        <Modal
            width={460}
            visible={visible}
            onOk={onCopyClicked}
            onCancel={onCancel}
            okText="复制"
            cancelText="取消"
            className="invite-modal"
        >
            <div className="invite-modal-header">
                <span>{userName} 邀请加入 FLAT 房间</span>
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
};
