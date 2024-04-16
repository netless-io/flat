import { message } from "antd";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useHistory, useParams } from "react-router-dom";
import {
    EditRoomFormInitialValues,
    EditRoomFormValues,
    getEndTimeFromRate,
    getRateFromEndTime,
    LoadingPage,
    errorTips,
} from "flat-components";
import { useSafePromise } from "../utils/hooks/lifecycle";
import EditRoomPage from "../components/EditRoomPage";
import { RouteNameType, RouteParams, usePushHistory } from "../utils/routes";
import { useTranslate } from "@netless/flat-i18n";
import { periodicRoomInfo, updatePeriodicRoom } from "@netless/flat-server-api";
import { useLoginCheck } from "../utils/use-login-check";

/**
 * TODO: we forget set i18n in current file!!!
 */

type ModifyPeriodicRoomPageProps = {
    periodicUUID: string;
};

export const ModifyPeriodicRoomPage = observer<ModifyPeriodicRoomPageProps>(
    function ModifyPeriodicRoomPage() {
        useLoginCheck();

        const { periodicUUID } = useParams<RouteParams<RouteNameType.ModifyPeriodicRoomPage>>();
        const history = useHistory();
        const pushHistory = usePushHistory();
        const sp = useSafePromise();
        const t = useTranslate();
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
                        region: periodic.region,
                        periodic:
                            periodic.rate === null || periodic.rate === void 0
                                ? {
                                      weeks: periodic.weeks,
                                      endType: "time",
                                      ...getRateFromEndTime(
                                          beginTime,
                                          periodic.weeks,
                                          periodicEndTime,
                                      ),
                                  }
                                : {
                                      weeks: periodic.weeks,
                                      endType: "rate",
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
                initialValues={initialValues}
                loading={isLoading}
                type="periodic"
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
                void message.success(t("edit-success"));
                pushHistory(RouteNameType.HomePage);
            } catch (e) {
                console.error(e);
                errorTips(e);
                setLoading(false);
            }
        }
    },
);

export default ModifyPeriodicRoomPage;
