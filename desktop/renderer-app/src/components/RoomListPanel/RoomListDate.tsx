import format from "date-fns/format";
import isToday from "date-fns/isToday";
import isTomorrow from "date-fns/isTomorrow";
import { zhCN } from "date-fns/locale";
import React from "react";
import calendarSVG from "../../assets/image/calendar.svg";

type RoomListDateProps = {
    beginTime?: number;
};

export const RoomListDate = React.memo<RoomListDateProps>(function RoomListDate({ beginTime }) {
    return beginTime ? (
        <time dateTime={new Date(beginTime).toUTCString()}>
            <img src={calendarSVG} alt="" style={{ marginTop: -4, marginRight: 4 }} />
            {format(beginTime, "MMMdo", { locale: zhCN })}
            {" · "}
            {isToday(beginTime)
                ? "今天"
                : isTomorrow(beginTime)
                ? "明天"
                : format(beginTime, "E", { locale: zhCN })}
        </time>
    ) : null;
});

export default RoomListDate;
