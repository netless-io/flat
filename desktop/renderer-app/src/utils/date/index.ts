/** Minimum class duration in minutes */
export const MIN_CLASS_DURATION = 15;

/**
 * generate array of numbers in some range
 * @example
 * excludeRange(2, 5) //=> [2, 3, 4, 5]
 * excludeRange(3)    //=> [0, 1, 2]
 */
export const excludeRange = (slice1: number, slice2?: number): number[] =>
    slice2
        ? Array(slice2 - slice1 + 1)
              .fill(slice1)
              .map((i, k) => Number(i) + k)
        : Array.from(Array(slice1).keys());

/** get a now Date object with 0 second and 0 millisecond */
export const getRoughNow = (): Date => {
    const now = new Date();
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now;
};

export const compareDate = (date: Date, comparedDate: Date): -1 | 0 | 1 => {
    const diff = date.valueOf() - comparedDate.valueOf();
    if (diff < 0) {
        return -1;
    }
    if (diff > 0) {
        return 1;
    }
    return 0;
};

/**
 * compare with days
 */
export const compareDay = (date: Date, comparedDate: Date): -1 | 0 | 1 => {
    date = new Date(date);
    date.setHours(comparedDate.getHours());
    date.setMinutes(comparedDate.getMinutes());
    date.setSeconds(comparedDate.getSeconds());
    date.setMilliseconds(comparedDate.getMilliseconds());
    return compareDate(date, comparedDate);
};

/**
 * compare with hours
 */
export const compareHour = (date: Date, comparedDate: Date): -1 | 0 | 1 => {
    date = new Date(date);
    date.setMinutes(comparedDate.getMinutes());
    date.setSeconds(comparedDate.getSeconds());
    date.setMilliseconds(comparedDate.getMilliseconds());
    return compareDate(date, comparedDate);
};

/**
 * compare with minutes
 */
export const compareMinute = (date: Date, comparedDate: Date): -1 | 0 | 1 => {
    date = new Date(date);
    date.setSeconds(comparedDate.getSeconds());
    date.setMilliseconds(comparedDate.getMilliseconds());
    return compareDate(date, comparedDate);
};
