import bookSVG from "../../../assets/image/book.svg";

import React from "react";
import { Button } from "antd";
import { RouteNameType, usePushHistory } from "../../../utils/routes";

export interface MainRoomMenuProps {}

export const ScheduleRoomBox = React.memo<MainRoomMenuProps>(function ScheduleRoomBox() {
    const pushHistory = usePushHistory();

    return (
        <Button onClick={() => pushHistory(RouteNameType.UserScheduledPage)}>
            <img src={bookSVG} alt="Schedule Room" />
            <span className="label">预定房间</span>
        </Button>
    );
});

export default ScheduleRoomBox;
