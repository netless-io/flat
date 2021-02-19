import React, { useContext, useState } from "react";
import { observer } from "mobx-react-lite";
import { isBefore, addMinutes, roundToNearestMinutes, getDay, addWeeks } from "date-fns";
import { RoomType } from "../../apiMiddleware/flatServer/constants";
import { PeriodicEndType } from "../../constants/Periodic";
import { GlobalStoreContext, RoomStoreContext } from "../../components/StoreProvider";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import EditRoomPage, { EditRoomFormValues, EditRoomType } from "../../components/EditRoomPage";
import { useHistory } from "react-router";
import { errorTips } from "../../components/Tips/ErrorTips";

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
    const history = useHistory();
    const sp = useSafePromise();
    const roomStore = useContext(RoomStoreContext);
    const globalStore = useContext(GlobalStoreContext);
    const [isLoading, setLoading] = useState(false);

    const [defaultValues] = useState<EditRoomFormValues>(() => {
        const scheduleBeginTime = getInitialBeginTime();
        return {
            title: globalStore.wechat?.name ? `${globalStore.wechat.name}预定的房间` : "",
            type: RoomType.BigClass,
            isPeriodic: false,
            beginTime: new Date(scheduleBeginTime),
            endTime: addMinutes(scheduleBeginTime, 30),
            periodic: {
                endType: PeriodicEndType.Rate,
                weeks: [getDay(scheduleBeginTime)],
                rate: 7,
                endTime: addWeeks(scheduleBeginTime, 6),
            },
        };
    });

    return (
        <EditRoomPage
            type={EditRoomType.Schedule}
            initialValues={defaultValues}
            loading={isLoading}
            onSubmit={createRoom}
        />
    );

    async function createRoom(values: EditRoomFormValues): Promise<void> {
        setLoading(true);

        try {
            const basePayload = {
                title: values.title,
                type: values.type,
                beginTime: values.beginTime.valueOf(),
                endTime: values.endTime.valueOf(),
            };

            if (values.isPeriodic) {
                await sp(
                    roomStore.createPeriodicRoom({
                        ...basePayload,
                        periodic:
                            values.periodic.endType === PeriodicEndType.Rate
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
