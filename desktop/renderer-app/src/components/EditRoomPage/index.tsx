import "./style.less";

import React from "react";
import { observer } from "mobx-react-lite";
import { EditRoomBody, EditRoomBodyProps, MainPageHeader } from "flat-components";
import { MainPageLayoutContainer } from "../MainPageLayoutContainer";
import { generateRoutePath, RouteNameType } from "../../utils/routes";
import { useLastLocation } from "react-router-last-location";

export type EditRoomPageProps = EditRoomBodyProps;

export const EditRoomPage = observer<EditRoomPageProps>(function EditRoomPage(props) {
    const lastLocation = useLastLocation();
    return (
        <MainPageLayoutContainer>
            <div className="edit-room-page">
                <MainPageHeader
                    routePath={lastLocation?.pathname || generateRoutePath(RouteNameType.HomePage)}
                    title={props.type === "schedule" ? "预定房间" : "修改房间"}
                />
                <EditRoomBody {...props} />
            </div>
        </MainPageLayoutContainer>
    );
});

export default EditRoomPage;
