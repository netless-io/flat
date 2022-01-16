import bookSVG from "../../../assets/image/book.svg";

import React from "react";
import { Button } from "antd";
import { RouteNameType, usePushHistory } from "../../../utils/routes";
import { useTranslation } from "react-i18next";

export const ScheduleRoomBox = React.memo<{}>(function ScheduleRoomBox() {
    const { t } = useTranslation();
    const pushHistory = usePushHistory();

    return (
        <Button onClick={() => pushHistory(RouteNameType.UserScheduledPage)}>
            <img alt="Schedule Room" src={bookSVG} />
            <span className="label">{t("home-page-hero-button-type.schedule")}</span>
        </Button>
    );
});

export default ScheduleRoomBox;
