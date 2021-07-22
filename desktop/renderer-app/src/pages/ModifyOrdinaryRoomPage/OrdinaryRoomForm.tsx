import { message } from "antd";
import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useHistory } from "react-router-dom";
import { EditRoomFormInitialValues, EditRoomFormValues, LoadingPage } from "flat-components";
import { ordinaryRoomInfo, updateOrdinaryRoom } from "../../apiMiddleware/flatServer";
import EditRoomPage from "../../components/EditRoomPage";
import { useSafePromise } from "../../utils/hooks/lifecycle";
import { errorTips } from "../../components/Tips/ErrorTips";
export interface OrdinaryRoomFormProps {
    roomUUID: string;
}

export const OrdinaryRoomForm = observer<OrdinaryRoomFormProps>(function RoomForm({ roomUUID }) {
    const [isLoading, setLoading] = useState(false);

    const history = useHistory();
    const sp = useSafePromise();

    const [initialValues, setInitialValues] = useState<EditRoomFormInitialValues>();

    useEffect(() => {
        sp(ordinaryRoomInfo(roomUUID))
            .then(({ roomInfo }) => {
                setInitialValues({
                    title: roomInfo.title,
                    type: roomInfo.roomType,
                    beginTime: new Date(roomInfo.beginTime),
                    endTime: new Date(roomInfo.endTime),
                    isPeriodic: false,
                    region: roomInfo.region,
                });
            })
            .catch(e => {
                console.error(e);
                errorTips(e);
                history.goBack();
            });
        // Only listen to roomUUID
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomUUID]);

    if (!initialValues) {
        return <LoadingPage />;
    }

    return (
        <EditRoomPage
            type="ordinary"
            initialValues={initialValues}
            loading={isLoading}
            onSubmit={editOrdinaryRoom}
        />
    );

    async function editOrdinaryRoom(values: EditRoomFormValues): Promise<void> {
        setLoading(true);

        try {
            await sp(
                updateOrdinaryRoom({
                    roomUUID: roomUUID,
                    beginTime: values.beginTime.valueOf(),
                    endTime: values.endTime.valueOf(),
                    title: values.title,
                    type: values.type,
                    docs: [],
                }),
            );
            void message.success("修改成功");
            history.goBack();
        } catch (e) {
            console.error(e);
            errorTips(e);
            setLoading(false);
        }
    }
});
