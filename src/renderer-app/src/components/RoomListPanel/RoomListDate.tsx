import format from "date-fns/format";
import isToday from "date-fns/isToday";
import isTomorrow from "date-fns/isTomorrow";
import { zhCN } from "date-fns/locale";
import React from "react";

type RoomListDateProps = {
    beginTime?: number;
};

export const RoomListDate = React.memo<RoomListDateProps>(function RoomListDate({ beginTime }) {
    return beginTime ? (
        <time dateTime={new Date(beginTime).toUTCString()}>
            {format(beginTime, "MMM do", { locale: zhCN })}
            {isToday(beginTime) ? " 今天" : isTomorrow(beginTime) ? " 明天" : null}
        </time>
    ) : null;
});

export default RoomListDate;
