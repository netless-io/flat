import "./index.less";

import React from "react";
import { RoomDetailBody, RoomDetailBodyProps } from "./RoomDetailBody";
import { RoomDetailFooter, RoomDetailFooterProps } from "./RoomDetailFooter";

export type RoomDetailPanelProps = RoomDetailBodyProps & RoomDetailFooterProps;

export const RoomDetailPanel: React.FC<RoomDetailPanelProps> = ({ roomInfo, ...restProps }) => {
    return (
        <div className="room-detail-panel-container">
            <div className="room-detail-panel-body">
                <RoomDetailBody roomInfo={roomInfo} />
            </div>
            <div className="room-detail-panel-footer">
                <RoomDetailFooter {...restProps} />
            </div>
        </div>
    );
};
