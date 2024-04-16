// Create/update room rules:
// * now <= begin
// * duration(begin, end) >= 15 minutes
// * prev.begin < begin < next.begin
// * end <= next.end

import { getRoughNow } from "../../../utils/room";
import { MIN_CLASS_DURATION } from "./constants";

/**
 * Pass `null` in `endTime` when choosing `beginTime`.
 */
export function isAllowed(
    beginTime: Date,
    endTime: Date | null | undefined,
    prevBeginTime: number | null | undefined,
    nextBeginTime: number | null | undefined,
    nextEndTime: number | null | undefined,
): boolean {
    nextBeginTime ||= nextEndTime;

    const now = getRoughNow().getTime();
    const begin = beginTime.getTime();
    const end = endTime ? endTime.getTime() : begin + MIN_CLASS_DURATION * 60 * 1000;
    const duration = end - begin;

    return (
        now <= begin &&
        duration >= MIN_CLASS_DURATION * 60 * 1000 &&
        (!prevBeginTime || prevBeginTime < begin) &&
        (!nextBeginTime || begin < nextBeginTime) &&
        (!nextEndTime || !end || end <= nextEndTime)
    );
}
