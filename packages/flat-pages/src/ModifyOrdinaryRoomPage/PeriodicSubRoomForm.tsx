import { message } from "antd";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import {
    EditRoomFormInitialValues,
    EditRoomFormValues,
    LoadingPage,
    errorTips,
} from "flat-components";
import { periodicSubRoomInfo, updatePeriodicSubRoom } from "@netless/flat-server-api";
import { useSafePromise } from "../utils/hooks/lifecycle";
import EditRoomPage from "../components/EditRoomPage";
import { useTranslate } from "@netless/flat-i18n";

export interface PeriodicSubRoomFormProps {
    roomUUID: string;
    periodicUUID: string;
}

export const PeriodicSubRoomForm = observer<PeriodicSubRoomFormProps>(function RoomForm({
    roomUUID,
    periodicUUID,
}) {
    const [isLoading, setLoading] = useState(false);

    const history = useHistory();
    const sp = useSafePromise();
    const t = useTranslate();

    const [initialValues, setInitialValues] = useState<EditRoomFormInitialValues>();
    const [previousPeriodicRoomBeginTime, setPreviousPeriodicRoomBeginTime] = useState<
        number | null
    >(0);
    const [nextPeriodicRoomBeginTime, setNextPeriodicRoomBeginTime] = useState<number | null>(0);
    const [nextPeriodicRoomEndTime, setNextPeriodicRoomEndTime] = useState<number | null>(0);
    useEffect(() => {
        sp(
            periodicSubRoomInfo({
                roomUUID,
                periodicUUID,
                needOtherRoomTimeInfo: true,
            }),
        )
            .then(data => {
                setInitialValues({
                    title: data.roomInfo.title,
                    type: data.roomInfo.roomType,
                    beginTime: new Date(data.roomInfo.beginTime),
                    endTime: new Date(data.roomInfo.endTime),
                    isPeriodic: false,
                    region: data.roomInfo.region,
                });
                setPreviousPeriodicRoomBeginTime(data.previousPeriodicRoomBeginTime);
                setNextPeriodicRoomBeginTime(data.nextPeriodicRoomBeginTime);
                setNextPeriodicRoomEndTime(data.nextPeriodicRoomEndTime);
            })
            .catch(e => {
                console.error(e);
                errorTips(e);
                history.goBack();
            });
        // Only listen to roomUUID
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomUUID, periodicUUID]);

    if (!initialValues) {
        return <LoadingPage />;
    }

    return (
        <EditRoomPage
            initialValues={initialValues}
            loading={isLoading}
            nextPeriodicRoomBeginTime={nextPeriodicRoomBeginTime}
            nextPeriodicRoomEndTime={nextPeriodicRoomEndTime}
            previousPeriodicRoomBeginTime={previousPeriodicRoomBeginTime}
            type="periodicSub"
            onSubmit={editPeriodicSubRoom}
        />
    );

    async function editPeriodicSubRoom(values: EditRoomFormValues): Promise<void> {
        setLoading(true);

        try {
            await sp(
                updatePeriodicSubRoom({
                    roomUUID: roomUUID,
                    periodicUUID: periodicUUID,
                    beginTime: values.beginTime.valueOf(),
                    endTime: values.endTime.valueOf(),
                }),
            );
            void message.success(t("edit-success"));
            history.goBack();
        } catch (e) {
            console.error(e);
            errorTips(e);
            setLoading(false);
        }
    }
});
