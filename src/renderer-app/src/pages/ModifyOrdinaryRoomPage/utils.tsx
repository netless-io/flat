export const MIN_DURATION = 15;

export function getFinalDate({ date, time }: { date: Date; time: Date }): Date {
    const result = new Date(date);
    result.setSeconds(time.getSeconds());
    result.setMinutes(time.getMinutes());
    result.setHours(time.getHours());
    return result;
}
