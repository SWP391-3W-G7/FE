import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const VN_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Format a date to Vietnam timezone (UTC+7)
 * @param date - Date string or Date object
 * @param formatStr - date-fns format string (default: "dd/MM/yyyy HH:mm")
 * @returns Formatted date string in Vietnam timezone
 */
export const formatVN = (date: string | Date, formatStr: string = "dd/MM/yyyy HH:mm"): string => {
    try {
        const zonedDate = toZonedTime(new Date(date), VN_TIMEZONE);
        return format(zonedDate, formatStr);
    } catch {
        return "N/A";
    }
};

/**
 * Format date only (no time) in Vietnam timezone
 */
export const formatDateVN = (date: string | Date): string => {
    return formatVN(date, "dd/MM/yyyy");
};

/**
 * Format time only in Vietnam timezone
 */
export const formatTimeVN = (date: string | Date): string => {
    return formatVN(date, "HH:mm");
};

/**
 * Format short date with time in Vietnam timezone
 */
export const formatShortVN = (date: string | Date): string => {
    return formatVN(date, "dd/MM HH:mm");
};
