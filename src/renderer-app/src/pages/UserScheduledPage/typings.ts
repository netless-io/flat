import { RoomType, Week } from "../../apiMiddleware/flatServer/constants";
import { PeriodicEndType } from "../../constants/Periodic";

export interface CreatePeriodicFormValues {
    title: string;
    type: RoomType;
    isPeriodic: boolean;
    beginTime: {
        date: Date;
        time: Date;
    };
    endTime: {
        date: Date;
        time: Date;
    };
    periodic: {
        endType: PeriodicEndType;
        weeks: Week[];
        rate: number;
        endTime: Date;
    };
}
