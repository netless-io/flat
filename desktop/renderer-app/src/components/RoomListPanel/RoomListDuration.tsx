import format from "date-fns/format";
import React from "react";

type RoomListDurationProps = {
    beginTime?: number;
    endTime?: number;
};

export const RoomListDuration = React.memo<RoomListDurationProps>(function RoomListDuration({
    beginTime,
    endTime,
}) {
    return beginTime && endTime ? (
        <>
            <span>{format(beginTime, "HH:mm")}</span>
            <span> ~ </span>
            {endTime && <span>{format(endTime, "HH:mm")}</span>}
        </>
    ) : null;
});

export default RoomListDuration;
