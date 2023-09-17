import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.tz.setDefault("Asia/Tokyo");

const parseMonth = (month) => dayjs(`${month}-01`, "YYYY-MM-DD", true);

const isValidMonth = (month) => {
    return parseMonth(month).isValid();
};

export const parse = (startMonth, endMonth) => {

    if (!isValidMonth(startMonth)) {
        console.error(`Invalid startMonth: ${startMonth}`);
        process.exit(1);
    }

    if (endMonth !== undefined && !isValidMonth(endMonth)) {
        console.error(`Invalid endMonth: ${endMonth}`);
        process.exit(1);
    }

    const start = parseMonth(startMonth);

    /**
     * もし`endMonth`が未入力の場合は`startMonth`と同じ値が指定されたとみなす。
     */
    const end = !!endMonth ? parseMonth(endMonth) : parseMonth(startMonth);

    if (end.isBefore(start)) {
        console.error(`\`endMonth\`(${endMonth}) must be equal or after \`startMonth\`(${startMonth})`);
        process.exit(1);
    }

    const yearMonthList =
        Array(end.diff(start, "month") + 1)
            .fill(start)
            .map((day, index) => day.add(index, "month"))
            .map(day => ({year: day.year(), month: day.month() + 1}));

    return yearMonthList;
};