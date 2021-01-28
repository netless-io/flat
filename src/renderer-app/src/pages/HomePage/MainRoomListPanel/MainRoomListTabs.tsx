import React from "react";
import classNames from "classnames";
import { ListRoomsType } from "../../../apiMiddleware/flatServer";

const listRoomTypeLocale = Object.freeze({
    [ListRoomsType.All]: "全部",
    [ListRoomsType.Today]: "今天",
    [ListRoomsType.Periodic]: "周期",
} as const);

const listRoomsTypeList = Object.freeze([
    ListRoomsType.All,
    ListRoomsType.Today,
    ListRoomsType.Periodic,
] as const);

export interface MainRoomListTabsProps {
    activeListRoomsType: ListRoomsType.All | ListRoomsType.Today | ListRoomsType.Periodic;
    onActiveListRoomsTypeChange: (
        listRoomsType: ListRoomsType.All | ListRoomsType.Today | ListRoomsType.Periodic,
    ) => void;
}

export const MainRoomListTabs = React.memo<MainRoomListTabsProps>(function MainRoomListTabs({
    activeListRoomsType,
    onActiveListRoomsTypeChange,
}) {
    return (
        <div>
            {listRoomsTypeList.map(listRoomType => (
                <span
                    key={listRoomType}
                    onClick={() => onActiveListRoomsTypeChange(listRoomType)}
                    className={classNames("room-list-tab", {
                        "is-active": listRoomType === activeListRoomsType,
                    })}
                >
                    {listRoomTypeLocale[listRoomType]}
                </span>
            ))}
        </div>
    );
});

export default MainRoomListTabs;
