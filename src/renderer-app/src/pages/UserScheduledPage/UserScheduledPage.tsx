import "./UserScheduledPage.less";
import React, { useState } from "react";
import { Button, Checkbox, Input } from "antd";
import { DatePicker, TimePicker } from "../../components/antd-date-fns";
import back from "../../assets/image/back.svg";
import MainPageLayout from "../../components/MainPageLayout";
import { Link } from "react-router-dom";
import { isBefore, addMinutes, roundToNearestMinutes, getDay, startOfDay } from "date-fns";
import { RoomType, Week } from "../../apiMiddleware/flatServer/constants";
import { createOrdinaryRoom, createPeriodicRoom } from "../../apiMiddleware/flatServer";
import { observer } from "mobx-react-lite";
import { RoomTypeSelect } from "../../components/RoomType";
import { RouteNameType, usePushHistory } from "../../utils/routes";
import { PeriodicEndType } from "../../constants/Periodic";
import { CreatePeriodic } from "../../components/Periodic/CreatePeriodic";
import { addHours } from "date-fns/fp";

const getInitialBeginTime = (): Date => {
    let time = roundToNearestMinutes(Date.now(), { nearestTo: 30 });
    if (isBefore(time, Date.now())) {
        time = addMinutes(time, 30);
    }
    return time;
};

const disabledDate = (beginTime: Date): boolean => {
    return isBefore(beginTime, startOfDay(new Date()));
};

export default observer(function X() {
    const pushHistory = usePushHistory();
    const [title, setTitle] = useState("");
    const [roomType, setRoomType] = useState(RoomType.BigClass);
    const [isPeriodic, setIsPeriodic] = useState(false);

    const initialBeginTime = getInitialBeginTime();
    const [beginTime, setBeginTime] = useState(initialBeginTime);
    const [endTime, setEndTime] = useState(addHours(1, initialBeginTime));
    const [periodicWeeks, setPeriodicWeeks] = useState<Week[]>([getDay(initialBeginTime)]);

    const [periodicEndType, setPeriodicEndType] = useState(PeriodicEndType.Rate);
    const [periodicRate, setPeriodicRate] = useState(0);
    const [periodicEndTime, setPeriodicEndTime] = useState(addMinutes(beginTime, 30));

    const changeTitle = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setTitle(event.target.value);
    };

    const onChangeBeginTime = (date: Date | null): void => {
        if (date !== null) {
            setPeriodicWeeks([getDay(date)]);
            setBeginTime(date);
            setEndTime(date);
        }
    };

    const onChangeEndTime = (date: Date | null): void => {
        if (date !== null) {
            setEndTime(date);
        }
    };

    const togglePeriodic = (): void => {
        setIsPeriodic(!isPeriodic);
    };

    const onChangeWeeks = (w: Week[]): void => {
        const week = getDay(beginTime);
        if (!w.includes(week)) {
            w.push(week);
        }

        setPeriodicWeeks(w.sort());
    };

    const createRoom = async (): Promise<void> => {
        try {
            const basePayload = {
                title,
                type: roomType,
                beginTime: beginTime.valueOf(),
                endTime: endTime.valueOf(),
            };

            if (isPeriodic) {
                await createPeriodicRoom({
                    ...basePayload,
                    periodic:
                        periodicEndType === PeriodicEndType.Rate
                            ? {
                                  weeks: periodicWeeks,
                                  rate: periodicRate,
                              }
                            : {
                                  weeks: periodicWeeks,
                                  endTime: periodicEndTime.valueOf(),
                              },
                });
            } else {
                await createOrdinaryRoom(basePayload);
            }

            pushHistory(RouteNameType.UserIndexPage, {});
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <MainPageLayout>
            <div className="user-schedule-box">
                <div className="user-schedule-nav">
                    <div className="user-schedule-title">
                        <Link to={"/user/"}>
                            <div className="user-back">
                                <img src={back} alt="back" />
                                <span>返回</span>
                            </div>
                        </Link>
                        <div className="user-segmentation" />
                        <div className="user-title">预定房间</div>
                    </div>
                    <div className="user-schedule-cut-line" />
                </div>
                <div className="user-schedule-body">
                    <div className="user-schedule-mid">
                        <div className="user-schedule-name">主题</div>
                        <div className="user-schedule-inner">
                            <Input value={title} onChange={changeTitle} />
                        </div>
                        <div className="user-schedule-name">类型</div>
                        <div className="user-schedule-inner">
                            <RoomTypeSelect
                                className="user-schedule-inner-select"
                                value={roomType}
                                onChange={setRoomType}
                            />
                        </div>
                        <div className="user-schedule-name">开始时间</div>
                        <div className="user-schedule-inner">
                            <DatePicker
                                className="user-schedule-picker"
                                disabledDate={disabledDate}
                                value={beginTime}
                                onChange={onChangeBeginTime}
                                allowClear={false}
                            />
                            <TimePicker
                                className="user-schedule-picker"
                                value={beginTime}
                                format="HH:mm"
                                onChange={onChangeBeginTime}
                                allowClear={false}
                            />
                        </div>
                        <div className="user-schedule-name">结束时间</div>
                        <div className="user-schedule-inner">
                            <DatePicker
                                className="user-schedule-picker"
                                disabledDate={disabledDate}
                                value={endTime}
                                onChange={onChangeEndTime}
                                allowClear={false}
                            />
                            <TimePicker
                                className="user-schedule-picker"
                                value={endTime}
                                format="HH:mm"
                                onChange={onChangeEndTime}
                                allowClear={false}
                            />
                        </div>
                        <div className="user-schedule-inner">
                            <Checkbox onChange={togglePeriodic}>
                                <span className="user-schedule-cycle">周期性房间</span>
                            </Checkbox>
                        </div>
                        {isPeriodic && (
                            <CreatePeriodic
                                weeks={periodicWeeks}
                                roomType={roomType}
                                beginTime={beginTime}
                                endTime={periodicEndTime}
                                endType={periodicEndType}
                                rate={periodicRate}
                                onChangeWeeks={onChangeWeeks}
                                onChangeEndTime={v => setPeriodicEndTime(v)}
                                onChangeEndType={v => {
                                    console.log(v);
                                    setPeriodicEndType(v);
                                }}
                                onChangeRate={v => setPeriodicRate(v)}
                            />
                        )}
                        <div className="user-schedule-under">
                            <Button className="user-schedule-cancel">取消</Button>
                            <Button className="user-schedule-ok" onClick={createRoom}>
                                预定
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </MainPageLayout>
    );
});
