import format from "date-fns/format";
import isToday from "date-fns/isToday";
import isTomorrow from "date-fns/isTomorrow";
import { zhCN } from "date-fns/locale";
import React from "react";

type RoomListDateProps = {
    beginTime: number;
};

export default class RoomListDate extends React.PureComponent<RoomListDateProps> {
    public render(): JSX.Element {
        const { beginTime } = this.props;
        return (
            <time dateTime={new Date(beginTime).toUTCString()}>
                {format(beginTime, "MMMM do", { locale: zhCN })}
                {isToday(beginTime) && " 今天"}
                {isTomorrow(beginTime) && " 明天"}
            </time>
        );
    }
}
