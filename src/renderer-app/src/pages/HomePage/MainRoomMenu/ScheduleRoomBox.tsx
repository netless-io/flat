import bookSVG from "../../../assets/image/book.svg";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import { generateRoutePath, RouteNameType } from "../../../utils/routes";

export interface MainRoomMenuProps {}

export const ScheduleRoomBox = React.memo<MainRoomMenuProps>(function ScheduleRoomBox() {
    return (
        <Button>
            <Link to={generateRoutePath(RouteNameType.UserScheduledPage, {})}>
                <img src={bookSVG} alt="Schedule Room" />
                预定房间
            </Link>
        </Button>
    );
});

export default ScheduleRoomBox;
