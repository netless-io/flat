import { RoomType } from "../apiMiddleware/flatServer/constants";
import React from "react";
import { Select } from "antd";
import { observer } from "mobx-react-lite";
import { getRoomTypeName } from "../utils/getTypeName";

export const RoomTypeSelect = observer<RoomTypeOptionProps>(function RoomTypeOption({
    value,
    onChange,
    className,
}) {
    return (
        <Select onChange={onChange} value={value} className={className}>
            {[RoomType.OneToOne, RoomType.SmallClass, RoomType.BigClass].map(e => {
                return (
                    <Select.Option key={e} value={e}>
                        {getRoomTypeName(e)}
                    </Select.Option>
                );
            })}
        </Select>
    );
});

interface RoomTypeOptionProps {
    value?: RoomType;
    onChange?: (value: RoomType) => void;
    className?: string;
}
