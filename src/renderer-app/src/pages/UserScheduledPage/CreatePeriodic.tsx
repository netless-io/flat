import React from "react";
import { observer } from "mobx-react-lite";
import { PeriodicEndType } from "../../constants/Periodic";
import { addDays, format, getDay, isBefore, startOfWeek, subDays } from "date-fns";
import { getPeriodicEndTypeName, getRoomTypeName } from "../../utils/getTypeName";
import { InputNumber, Select } from "antd";
import { RoomType, Week } from "../../apiMiddleware/flatServer/constants";
import { DatePicker } from "../../components/antd-date-fns";
import { zhCN } from "date-fns/locale";

const weekToName = (week: Week): string => {
    const t = addDays(startOfWeek(new Date()), week);
    return format(t, "iii", { locale: zhCN });
};

const weeksName = (weeks: Week[]): string => {
    return weeks.map(weekToName).join("、");
};

const formatISODayWeekiii = (date: Date): string => {
    // TODO: i18n
    return format(date, "yyyy/MM/dd iii", { locale: zhCN });
};

interface CreatePeriodicProps {
    weeks: Week[];
    roomType: RoomType;
    beginTime: Date;
    endTime: Date;
    endType: PeriodicEndType;
    rate: number;
    onChangeEndTime: (endTime: Date) => void;
    onChangeEndType: (endType: PeriodicEndType) => void;
    onChangeWeeks: (weeks: Week[]) => void;
    onChangeRate: (rate: number) => void;
}

export const CreatePeriodic = observer<CreatePeriodicProps>(function CreatePeriodic({
    weeks,
    roomType,
    beginTime,
    endTime,
    endType,
    rate,
    onChangeWeeks,
    onChangeEndTime,
    onChangeEndType,
    onChangeRate,
}) {
    const periodicEndDate = (): Date => {
        if (endType === PeriodicEndType.Rate) {
            let times = 0;
            let t = new Date(endTime);

            while (times < rate) {
                if (weeks.includes(getDay(t))) {
                    times++;
                }
                t = addDays(t, 1);
            }

            return subDays(t, 1);
        }

        return new Date(endTime);
    };

    const calcRoomsTimes = (): number => {
        if (endType === PeriodicEndType.Rate) {
            return rate;
        }

        let sum = 0;
        for (let t = beginTime; isBefore(t, endTime); t = addDays(t, 1)) {
            if (weeks.includes(getDay(t))) {
                sum++;
            }
        }
        return sum;
    };

    return (
        <>
            <div className="user-schedule-tips">
                {weeks.length > 0 ? (
                    <div className="user-schedule-tips-title">每{weeksName(weeks)}</div>
                ) : (
                    <div>暂未选择频率</div>
                )}
                <div className="user-schedule-tips-type">房间类型：{getRoomTypeName(roomType)}</div>
                <div className="user-schedule-tips-inner">
                    结束于 {formatISODayWeekiii(periodicEndDate())}，共 {calcRoomsTimes()} 个房间
                </div>
            </div>
            <div className="user-schedule-name">重复频率</div>
            <div className="user-schedule-inner">
                <Select
                    mode="multiple"
                    allowClear
                    className="user-schedule-inner-select"
                    value={weeks}
                    onChange={onChangeWeeks}
                >
                    {[
                        Week.Sunday,
                        Week.Monday,
                        Week.Tuesday,
                        Week.Wednesday,
                        Week.Thursday,
                        Week.Friday,
                        Week.Saturday,
                    ].map(e => {
                        const weekName = weeksName([e]);
                        return (
                            <Select.Option key={e} value={e} label={weekName}>
                                <div className="demo-option-label-item">{weekName}</div>
                            </Select.Option>
                        );
                    })}
                </Select>
            </div>
            <div className="user-schedule-name">结束重复</div>
            <div className="user-schedule-inner">
                <Select className="user-schedule-picker" value={endType} onChange={onChangeEndType}>
                    {(["Rate", "Time"] as const).map(type => {
                        const periodicEndTypeName = getPeriodicEndTypeName(type);

                        return (
                            <Select.Option key={type} value={type} label={periodicEndTypeName}>
                                <div className="option-label-item">{periodicEndTypeName}</div>
                            </Select.Option>
                        );
                    })}
                </Select>
                {endType === PeriodicEndType.Rate ? (
                    <InputNumber
                        className="user-schedule-picker option-label-item"
                        min={1}
                        max={50}
                        value={rate}
                        onChange={e => e && onChangeRate(Number(e))}
                    />
                ) : (
                    <DatePicker
                        className="user-schedule-picker"
                        format="YYYY-MM-DD"
                        allowClear={false}
                        value={endTime}
                        onChange={e => e && onChangeEndTime(endTime)}
                    />
                )}
            </div>
        </>
    );
});
