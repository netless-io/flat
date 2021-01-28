import bookSVG from "../../../assets/image/book.svg";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import { generateRoutePath, RouteNameType } from "../../../utils/routes";

export interface MainRoomMenuProps {}

export const ScheduleRoomBox = React.memo<MainRoomMenuProps>(function ScheduleRoomBox() {
    return (
        <Link to={generateRoutePath(RouteNameType.UserScheduledPage, {})}>
            <Button>
                <img src={bookSVG} alt="Schedule Room" />
                预定房间
            </Button>
        </Link>
    );
});

export default ScheduleRoomBox;
