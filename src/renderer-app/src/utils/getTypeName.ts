import { RoomStatus, RoomType, Week } from "../apiMiddleware/flatServer/constants";
import { PeriodicEndType } from "../constants/Periodic";

export const getWeekName = (week: Week): string => {
    const weekNameMap: Record<Week, string> = {
        [Week.Sunday]: "周日",
        [Week.Monday]: "周一",
        [Week.Tuesday]: "周二",
        [Week.Wednesday]: "周三",
        [Week.Thursday]: "周四",
        [Week.Friday]: "周五",
        [Week.Saturday]: "周六",
    };
    return weekNameMap[week];
};

export const getRoomStatusName = (status: RoomStatus): string => {
    const statusNameMap: Record<RoomStatus, string> = {
        [RoomStatus.Idle]: "待开始",
        [RoomStatus.Started]: "进行中",
        [RoomStatus.Paused]: "已暂停",
        [RoomStatus.Stopped]: "已结束",
    };
    return statusNameMap[status];
};

export const getRoomTypeName = (type: RoomType): string => {
    const typeNameMap: Record<RoomType, string> = {
        [RoomType.OneToOne]: "一对一",
        [RoomType.SmallClass]: "小班课",
        [RoomType.BigClass]: "大班课",
    };
    return typeNameMap[type];
};

export const getPeriodicEndTypeName = (type: keyof typeof PeriodicEndType): string => {
    const endTypeNameMap: Record<PeriodicEndType, string> = {
        [PeriodicEndType.Rate]: "限定房间个数",
        [PeriodicEndType.Time]: "结束于某天",
    };

    return endTypeNameMap[type];
};
