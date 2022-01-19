import React, { useContext, useState } from "react";
import { addMinutes, addWeeks, getDay, isBefore, roundToNearestMinutes } from "date-fns";
import { EditRoomFormValues } from "flat-components";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { RoomType } from "../../api-middleware/flatServer/constants";
import EditRoomPage from "../../components/EditRoomPage";
import {
    ConfigStoreContext,
    GlobalStoreContext,
    RoomStoreContext,
} from "../../components/StoreProvider";
import { errorTips } from "../../components/Tips/ErrorTips";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { useWindowSize } from "../../utils/hooks/use-window-size";

const getInitialBeginTime = (): Date => {
    const now = new Date();
    let time = roundToNearestMinutes(now, { nearestTo: 30 });
    if (isBefore(time, now)) {
        time = addMinutes(time, 30);
    }
    time.setSeconds(0);
    time.setMilliseconds(0);
    return time;
};

export const UserScheduledPage = observer(function UserScheduledPage() {
    const { t } = useTranslation();
    useWindowSize("Main");

    const history = useHistory();
    const sp = useSafePromise();
    const roomStore = useContext(RoomStoreContext);
    const globalStore = useContext(GlobalStoreContext);
    const configStore = useContext(ConfigStoreContext);
    const [isLoading, setLoading] = useState(false);

    const [defaultValues] = useState<EditRoomFormValues>(() => {
        const scheduleBeginTime = getInitialBeginTime();
        return {
            title: globalStore.userInfo?.name
                ? t("schedule-room-default-title", { name: globalStore.userInfo.name })
                : "",
            type: RoomType.BigClass,
            isPeriodic: false,
            region: configStore.getRegion(),
            beginTime: new Date(scheduleBeginTime),
            endTime: addMinutes(scheduleBeginTime, 30),
            periodic: {
                endType: "rate",
                weeks: [getDay(scheduleBeginTime)],
                rate: 7,
                endTime: addWeeks(scheduleBeginTime, 6),
            },
        };
    });

    return (
        <EditRoomPage
            initialValues={defaultValues}
            loading={isLoading}
            type="schedule"
            onSubmit={createRoom}
        />
    );

    async function createRoom(values: EditRoomFormValues): Promise<void> {
        setLoading(true);

        try {
            const basePayload = {
                title: values.title,
                type: values.type,
                region: values.region,
                beginTime: values.beginTime.valueOf(),
                endTime: values.endTime.valueOf(),
            };

            if (values.isPeriodic) {
                await sp(
                    roomStore.createPeriodicRoom({
                        ...basePayload,
                        periodic:
                            values.periodic.endType === "rate"
                                ? {
                                      weeks: values.periodic.weeks,
                                      rate: values.periodic.rate,
                                  }
                                : {
                                      weeks: values.periodic.weeks,
                                      endTime: values.periodic.endTime.valueOf(),
                                  },
                    }),
                );
            } else {
                await sp(roomStore.createOrdinaryRoom(basePayload));
            }

            history.goBack();
        } catch (e) {
            console.error(e);
            errorTips(e);
            setLoading(false);
        }
    }
});

export default UserScheduledPage;
