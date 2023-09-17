/**
 * 川崎ブレイブサンダース様ホームページのスケジュールのページの
 * HTML をファイルとして保存する。
 * 
 * # 警告
 * ホームページに対して負荷をかけるような実行をしないこと。
 * 絶対に迷惑をかけたくない。
 */

import fs from 'fs';

const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * @param {{year: number, month: number}} yearMonthList 
 * @returns {Promise<void>}
 */
export const fetchPage = async (yearMonthList) => {
    const kawasakiBravethundersSchedulePageUrl = new URL("https://kawasaki-bravethunders.com/schedule/");

    for (const {year, month} of yearMonthList) {
        const params = new URLSearchParams({
            scheduleYear: year,
            scheduleMonth: month
        });
        const url = `${kawasakiBravethundersSchedulePageUrl.toString()}?${params.toString()}`;
        await sleep();
        const page = await fetch(url).then(resp => resp.text());
        fs.writeFileSync(`./input/kawasaki-bravethunders-schedule-${year}-${month}.html`, page);
    }
};