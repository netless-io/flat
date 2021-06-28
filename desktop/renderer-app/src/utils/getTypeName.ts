import { RoomType, Week } from "../apiMiddleware/flatServer/constants";

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

export const getRoomTypeName = (type: RoomType): string => {
    const typeNameMap: Record<RoomType, string> = {
        [RoomType.OneToOne]: "一对一",
        [RoomType.SmallClass]: "小班课",
        [RoomType.BigClass]: "大班课",
    };
    return typeNameMap[type];
};
