import { useHistory, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { message } from "antd";
import { observer } from "mobx-react-lite";
import { PeriodicEndType } from "../../constants/Periodic";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import EditRoomPage, {
    EditRoomFormInitialValues,
    EditRoomFormValues,
    EditRoomType,
} from "../../components/EditRoomPage";
import { RouteNameType, RouteParams } from "../../utils/routes";
import { periodicRoomInfo, updatePeriodicRoom } from "../../apiMiddleware/flatServer";
import { getEndTimeFromRate, getRateFromEndTime } from "../../components/EditRoomPage/utils";
import LoadingPage from "../../LoadingPage";
import { errorTips } from "../../components/Tips/ErrorTips";

type ModifyPeriodicRoomPageProps = {
    periodicUUID: string;
};

export const ModifyPeriodicRoomPage = observer<ModifyPeriodicRoomPageProps>(
    function ModifyPeriodicRoomPage() {
        const { periodicUUID } = useParams<RouteParams<RouteNameType.ModifyPeriodicRoomPage>>();
        const history = useHistory();
        const sp = useSafePromise();
        const [isLoading, setLoading] = useState(false);
        const [initialValues, setInitialValues] = useState<EditRoomFormInitialValues>();

        useEffect(() => {
            sp(periodicRoomInfo(periodicUUID))
                .then(({ periodic, rooms }) => {
                    const beginTime = new Date(rooms[0].beginTime);
                    const periodicEndTime = new Date(periodic.endTime);
                    setInitialValues({
                        title: periodic.title,
                        type: periodic.roomType,
                        beginTime,
                        endTime: new Date(rooms[0].endTime),
                        isPeriodic: true,
                        periodic:
                            periodic.rate === null || periodic.rate === void 0
                                ? {
                                      weeks: periodic.weeks,
                                      endType: PeriodicEndType.Time,
                                      ...getRateFromEndTime(
                                          beginTime,
                                          periodic.weeks,
                                          periodicEndTime,
                                      ),
                                  }
                                : {
                                      weeks: periodic.weeks,
                                      endType: PeriodicEndType.Rate,
                                      rate: periodic.rate,
                                      endTime: getEndTimeFromRate(
                                          beginTime,
                                          periodic.weeks,
                                          periodic.rate,
                                      ),
                                  },
                    });
                })
                .catch(e => {
                    console.error(e);
                    errorTips(e);
                    history.goBack();
                });
            // Only listen to roomUUID
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [periodicUUID]);

        if (!initialValues) {
            return <LoadingPage />;
        }

        return (
            <EditRoomPage
                type={EditRoomType.EditPeriodic}
                initialValues={initialValues}
                loading={isLoading}
                onSubmit={editPeriodicRoom}
            />
        );

        async function editPeriodicRoom(values: EditRoomFormValues): Promise<void> {
            setLoading(true);

            try {
                await sp(
                    updatePeriodicRoom({
                        periodicUUID: periodicUUID,
                        beginTime: values.beginTime.valueOf(),
                        endTime: values.endTime.valueOf(),
                        title: values.title,
                        type: values.type,
                        docs: [],
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
                message.success("修改成功");
                history.goBack();
            } catch (e) {
                console.error(e);
                errorTips(e);
                setLoading(false);
            }
        }
    },
);
