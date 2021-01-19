import format from "date-fns/format";
import React from "react";

type RoomListDurationProps = {
    beginTime: number;
    endTime: number;
};

export default class RoomListDuration extends React.PureComponent<RoomListDurationProps> {
    public render() {
        return (
            <>
                <span>{format(this.props.beginTime, "HH:mm")}</span>
                <span> ~ </span>
                {this.props.endTime && <span>{format(this.props.endTime, "HH:mm")}</span>}
            </>
        );
    }
}
