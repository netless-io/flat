import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router";
import { message } from "antd";
import { periodicSubRoomInfo, updatePeriodicSubRoom } from "../../apiMiddleware/flatServer";
import {
    EditRoomFormInitialValues,
    EditRoomFormValues,
    EditRoomPage,
    EditRoomType,
} from "../../components/EditRoomPage";
import LoadingPage from "../../LoadingPage";
import { useSafePromise } from "../../utils/hooks/lifecycle";

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

    const [initialValues, setInitialValues] = useState<EditRoomFormInitialValues>();

    useEffect(() => {
        sp(
            periodicSubRoomInfo({
                roomUUID,
                periodicUUID,
                needOtherRoomTimeInfo: true,
            }),
        )
            .then(({ roomInfo }) => {
                setInitialValues({
                    title: roomInfo.title,
                    type: roomInfo.roomType,
                    beginTime: new Date(roomInfo.beginTime),
                    endTime: new Date(roomInfo.endTime),
                    isPeriodic: false,
                });
            })
            .catch(e => {
                console.error(e);
                message.error("无法打开修改页面");
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
            type={EditRoomType.EditPeriodicSub}
            initialValues={initialValues}
            loading={isLoading}
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
            message.success("修改成功");
            history.goBack();
        } catch (error) {
            console.error(error);
            message.error(error.message);
            setLoading(false);
        }
    }
});
