import "./style.less";

import React from "react";
import { observer } from "mobx-react-lite";
import { EditRoomBody, EditRoomBodyProps, MainPageHeader } from "flat-components";
import { MainPageLayoutContainer } from "../MainPageLayoutContainer";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

export type EditRoomPageProps = EditRoomBodyProps;

export const EditRoomPage = observer<EditRoomPageProps>(function EditRoomPage(props) {
    const { t } = useTranslation();
    const history = useHistory();

    return (
        <MainPageLayoutContainer>
            <div className="edit-room-page">
                <div className="edit-room-page-header-container">
                    <MainPageHeader
                        title={
                            <span className="edit-room-page-header-title">
                                {props.type === "schedule"
                                    ? t("home-page-hero-button-type.schedule")
                                    : t("modify-room")}
                            </span>
                        }
                        onBackPreviousPage={() => history.goBack()}
                    />
                </div>
                <div className="edit-room-page-body">
                    <EditRoomBody {...props} />
                </div>
            </div>
        </MainPageLayoutContainer>
    );
});

export default EditRoomPage;
