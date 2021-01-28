import { RoomType } from "../apiMiddleware/flatServer/constants";
import { PeriodicEndType } from "../constants/Periodic";

export const getTypeName = (type: RoomType): string => {
    const typeNameMap: Record<RoomType, string> = {
        [RoomType.OneToOne]: "一对一",
        [RoomType.SmallClass]: "小班课",
        [RoomType.BigClass]: "大班课",
    };
    return typeNameMap[type];
};

export const getPeriodicEndTypeName = (type: keyof typeof PeriodicEndType): string => {
    const endTypeNameMap: Record<PeriodicEndType, string> = {
        [PeriodicEndType.Rate]: "按次数",
        [PeriodicEndType.Time]: "按时间",
    };

    // @ts-ignore
    return endTypeNameMap[type];
};
