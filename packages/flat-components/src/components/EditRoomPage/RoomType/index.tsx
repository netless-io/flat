import React from "react";
import { Select, SelectProps } from "antd";
import { RoomType } from "../../../types/room";
import { getRoomTypeName } from "../../../utils/room";

const RoomTypeList = Object.freeze([RoomType.BigClass, RoomType.SmallClass, RoomType.OneToOne]);

interface RoomTypeSelectProps extends SelectProps<RoomType> {}

export const RoomTypeSelect: React.FC<RoomTypeSelectProps> = props => (
    <Select {...props}>
        {RoomTypeList.map(e => {
            return (
                <Select.Option key={e} value={e}>
                    {getRoomTypeName(e)}
                </Select.Option>
            );
        })}
    </Select>
);
