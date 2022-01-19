import React, { useContext, useEffect } from "react";
import { EditRoomBody, EditRoomBodyProps } from "flat-components";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { PageStoreContext } from "../StoreProvider";
import "./style.less";

export type EditRoomPageProps = EditRoomBodyProps;

export const EditRoomPage = observer<EditRoomPageProps>(function EditRoomPage(props) {
    const { t } = useTranslation();
    const history = useHistory();
    const pageStore = useContext(PageStoreContext);

    useEffect(() => {
        pageStore.configure({
            title: (
                <div className="edit-room-page-header-title">
                    {props.type === "schedule"
                        ? t("home-page-hero-button-type.schedule")
                        : t("modify-room")}
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
