import React from "react";

import { RouteNameType, usePushHistory } from "../../utils/routes";

import { HomePageHeroButton } from "flat-components";

export const ScheduleRoomBox = React.memo<{}>(function ScheduleRoomBox() {
    const pushHistory = usePushHistory();

    return (
        <HomePageHeroButton
            type="schedule"
            onClick={() => pushHistory(RouteNameType.UserScheduledPage)}
        />
    );
});

export default ScheduleRoomBox;
