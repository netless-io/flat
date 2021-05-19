import { RoomType } from "../apiMiddleware/flatServer/constants";
import React from "react";
import { Select } from "antd";
import { observer } from "mobx-react-lite";
import { getRoomTypeName } from "../utils/getTypeName";
import { SelectProps } from "antd/lib/select";

const RoomTypeList = Object.freeze([RoomType.BigClass, RoomType.SmallClass, RoomType.OneToOne]);

type RoomTypeSelectProps = SelectProps<RoomType>;

export const RoomTypeSelect = observer<RoomTypeSelectProps>(function RoomTypeOption(props) {
    return (
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
});
