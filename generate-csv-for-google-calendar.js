import fs from 'fs';
import path from 'path';
import { parse } from 'node-html-parser';
import dayjs from 'dayjs';
import { createObjectCsvWriter } from 'csv-writer';
import * as R from 'remeda';

/**
 * @param {{year: number, month: number, pageContnt: string}} param0 
 * @returns 
 */
const parseScheduleFor = ({year, month, pageContent}) => {
    const root = parse(pageContent);
    const scheduleRows = root.querySelector(".schedule-ul").childNodes.filter((element) => element.rawTagName === "li");
    return scheduleRows.map((row) => ({year, month, row}));
};

/**
 * カレンダー予定のタイトル
 * @param {HTMLElement} scheduleRow 
 * @returns {string}
 */
const subject = (scheduleRow) => {
    const tableTag = scheduleRow.childNodes[3];
    const studiumTd = tableTag.querySelector("td.stadium-detail");
    const homeaway = scheduleRow.childNodes[1].innerText;
    const teamname = studiumTd.querySelector("div.sp.stadium-team p.team-name").innerText;
    return `[${homeaway}]川崎ブレイブサンダースvs${teamname}`;
};

/**
 * 日付情報の取得
 */
const dateInfo = (scheduleRow, year, month) => {
    const tableTag = scheduleRow.childNodes[3];
    const dayTd = tableTag.querySelector("td.day-box");

    /**
     * 10.8 みたいな感じ。
     */
    const rawDayStr = dayTd.querySelector("p.day").innerText;
    const day = rawDayStr.split(".")[1];

    const startTd = tableTag.querySelector("td.start-time-box")
    /**
     * 18:05 みたいな感じ。
     * 日時が未確定の場合は、空文字になる
     */
    const rawStartTime = startTd.querySelector("p.start-time").innerText.trim();

    const startDate = `${month.toString().padStart(2, "0")}/${day.padStart(2, "0")}/${year}`;
    const endDate = startDate;

    if(rawStartTime === "") {
        // この場合は、時間が未確定
        return { startDate, endDate };
    }

    const startTime = dayjs(`2023-01-01 ${rawStartTime}`).format("hh:mm A");
    /**
     * 終了時刻は開始から２時間にしておく。時刻の計算だけしたいので、日付はテキトー。
     */
    const endTime = dayjs(`2023-01-01 ${rawStartTime}`).add(2, 'hours').format("hh:mm A");

    return { startDate, startTime, endDate, endTime };
};

const location = (scheduleRow) => {
    const tableTag = scheduleRow.childNodes[3];
    const studiumTd = tableTag.querySelector("td.stadium-detail");
    return studiumTd.querySelector("div.sp.stadium-team p.stadium-name").childNodes[0] + " " + studiumTd.querySelector("div.sp.stadium-team p.stadium-name").childNodes[1].innerText
};

const description = (scheduleRow) => {
    const tableTag = scheduleRow.childNodes[3];
    const ticketTd = tableTag.querySelector("td.ticket-box.pc");
    const ticketUrl = ticketTd.querySelector("a.ticket-btn")?._attrs?.href;

    if (ticketUrl) {
        return `チケットはこちらから → ${ticketUrl}`;
    } else {
        return "チケット詳細は後日公開される（はず）。";
    }
};

/**
 * 既に試合が終了している予定かどうか判定する。
 *
 * NOTE: 既に試合が終了している場合はCSVに出力しないこととする。
 */
const isFinishedSchedule = ({row: scheduleRow}) => {
    /**
     * 試合終了した予定の行は`td.result-area`要素にて結果が表示されている。
     * まだ試合終了していない予定にはこの要素は存在しない。よってこちらの存在の有無で判定する。
     */
    const resultArea = scheduleRow.childNodes[3].querySelector("td.result-area");
    return resultArea !== null;
};

const writeCsv = (records, startMonth, endMonth) => {
    const outputFilePath = `dist/川崎ブレイブサンダース試合日程${startMonth}〜${endMonth}（Googleカレンダー用）.csv`;
    const csvWriter = createObjectCsvWriter({
        path: outputFilePath,
        header: [
            {id: 'subject', title: 'Subject'},
            {id: 'startDate', title: 'Start Date'},
            {id: 'startTime', title: 'Start Time'},
            {id: 'endDate', title: 'End Date'},
            {id: 'endTime', title: 'End Time'},
            {id: 'location', title: 'Location'},
            {id: 'description', title: 'Description'},
            {id: 'allDayEvent', title: 'All Day Event'},
        ]
    });
     
    fs.mkdirSync(path.dirname(outputFilePath), {recursive: true});
    return csvWriter.writeRecords(records);
};

const formatRow = ({year, month, row}) => {
    return {
        subject: subject(row),
        ...dateInfo(row, year, month),
        location: location(row),
        description: description(row),
        allDayEvent: "False",
    };
};

const formatMonth = ({year, month}) => {
    return `${year}-${month.toString().padStart(2, "0")}`;
};

export const generateCsv = async (pageContents) => {
    const records = R.pipe(
        pageContents,
        R.flatMap(parseScheduleFor),
        R.filter(scheduleRow => !isFinishedSchedule(scheduleRow)),
        R.map(formatRow)
    );

    const startMonth = formatMonth(pageContents[0]);
    const endMonth = formatMonth(pageContents[pageContents.length - 1]);

    return writeCsv(records, startMonth, endMonth);
};
