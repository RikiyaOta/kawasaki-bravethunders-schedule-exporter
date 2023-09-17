const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * @param {{year: number, month: number}} yearMonthList 
 * @returns {Promise<{year: number, month: number, pageContnt: string}[]>}
 */
export const fetchPage = async (yearMonthList) => {
    const kawasakiBravethundersSchedulePageUrl = new URL("https://kawasaki-bravethunders.com/schedule/");

    const result = [];

    for (const {year, month} of yearMonthList) {
        const params = new URLSearchParams({
            scheduleYear: year,
            scheduleMonth: month
        });
        const url = `${kawasakiBravethundersSchedulePageUrl.toString()}?${params.toString()}`;
        await sleep();
        const pageContent = await fetch(url).then(resp => resp.text());
        result.push({ year, month, pageContent });
    }

    return result;
};