import { RoomType } from "../../apiMiddleware/flatServer/constants";

export interface ModifyRoomDefaultFormValues {
    title: string;
    beginDate: Date;
    beginTime: Date;
    endDate: Date;
    endTime: Date;
    roomType: RoomType;
}
