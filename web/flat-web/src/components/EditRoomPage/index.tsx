import "./style.less";

import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { EditRoomBody, EditRoomBodyProps } from "flat-components";
import { useHistory } from "react-router";
import { useContext } from "react";
import { PageStoreContext } from "../StoreProvider";

export type EditRoomPageProps = EditRoomBodyProps;

export const EditRoomPage = observer<EditRoomPageProps>(function EditRoomPage(props) {
    const history = useHistory();
    const pageStore = useContext(PageStoreContext);

    useEffect(() => {
        pageStore.configure({
            title: (
                <div className="edit-room-page-header-title">
                    {props.type === "schedule" ? "预定房间" : "修改房间"}
                </div>
            ),
            onBackPreviousPage: () => history.goBack(),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="edit-room-page">
            <div className="edit-room-page-body">
                <div className="edit-room-page-body-content">
                    <EditRoomBody {...props} />
                </div>
            </div>
        </div>
    );
});

export default EditRoomPage;
