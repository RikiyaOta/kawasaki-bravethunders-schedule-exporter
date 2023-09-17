import { parse } from "./parse-cli-arguments.js";
import { fetchPage } from "./fetch-schedule-page.js";
import { generateCsv } from "./generate-csv-for-google-calendar.js";

const [, , startMonth, endMonth] = process.argv;

const yearMonthList = parse(startMonth, endMonth);

await fetchPage(yearMonthList);

await generateCsv(yearMonthList);