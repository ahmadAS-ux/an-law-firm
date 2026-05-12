import { toRiyadhRange, parseRiyadhDate } from "./timezone";
import type { ReportPeriod, ReportPeriodPreset } from "./types";

const RIYADH_OFFSET_MS = 3 * 60 * 60 * 1000;

function nowRiyadh(): Date {
  return new Date(Date.now() + RIYADH_OFFSET_MS);
}

/** Returns the Riyadh date string for a shifted UTC timestamp (internal only). */
function riyadhDateStr(utcMs: number): string {
  const d = new Date(utcMs);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Returns the first day of the workweek containing a given Riyadh date.
 *  workweekDays: array of day-of-week numbers where 0=Sun … 6=Sat.
 */
function startOfRiyadhWorkWeek(riyadhNow: Date, workweekDays: number[]): Date {
  const sorted = [...workweekDays].sort((a, b) => a - b);
  const firstDay = sorted[0] ?? 0;
  const dow = riyadhNow.getUTCDay();
  let offset = dow - firstDay;
  if (offset < 0) offset += 7;
  return new Date(riyadhNow.getTime() - offset * 24 * 60 * 60 * 1000);
}

/** Counts workdays in a range using workweekDays config. */
export function countWorkdays(from: Date, to: Date, workweekDays: number[]): number {
  const daySet = new Set(workweekDays);
  let count = 0;
  const cur = new Date(from.getTime() + RIYADH_OFFSET_MS);
  const end = new Date(to.getTime() + RIYADH_OFFSET_MS);
  while (cur < end) {
    if (daySet.has(cur.getUTCDay())) count++;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return count;
}

/** Returns all Riyadh workday date strings in [from, to) half-open range. */
export function getWorkdayDateStrings(from: Date, to: Date, workweekDays: number[]): string[] {
  const daySet = new Set(workweekDays);
  const result: string[] = [];
  const cur = new Date(from.getTime() + RIYADH_OFFSET_MS);
  const end = new Date(to.getTime() + RIYADH_OFFSET_MS);
  while (cur < end) {
    if (daySet.has(cur.getUTCDay())) {
      result.push(riyadhDateStr(cur.getTime()));
    }
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return result;
}

export function buildPeriod(
  preset: ReportPeriodPreset,
  workweekDays: number[],
  customFrom?: string,
  customTo?: string
): ReportPeriod & { utcFrom: Date; utcTo: Date } {
  const now = nowRiyadh();
  let fromStr: string;
  let toStr: string;
  let label: string;
  let labelAr: string;

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthNamesAr = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

  switch (preset) {
    case "thisWeek": {
      const start = startOfRiyadhWorkWeek(now, workweekDays);
      const sorted = [...workweekDays].sort((a, b) => a - b);
      const lastDay = sorted[sorted.length - 1] ?? 4;
      const dow = start.getUTCDay();
      const offset = ((lastDay - dow) + 7) % 7;
      const end = new Date(start.getTime() + offset * 24 * 60 * 60 * 1000);
      fromStr = riyadhDateStr(start.getTime());
      toStr = riyadhDateStr(end.getTime());
      label = "This Week";
      labelAr = "هذا الأسبوع";
      break;
    }
    case "lastWeek": {
      const thisStart = startOfRiyadhWorkWeek(now, workweekDays);
      const lastStart = new Date(thisStart.getTime() - 7 * 24 * 60 * 60 * 1000);
      const sorted = [...workweekDays].sort((a, b) => a - b);
      const lastDay = sorted[sorted.length - 1] ?? 4;
      const dow = lastStart.getUTCDay();
      const offset = ((lastDay - dow) + 7) % 7;
      const lastEnd = new Date(lastStart.getTime() + offset * 24 * 60 * 60 * 1000);
      fromStr = riyadhDateStr(lastStart.getTime());
      toStr = riyadhDateStr(lastEnd.getTime());
      label = "Last Week";
      labelAr = "الأسبوع الماضي";
      break;
    }
    case "thisMonth": {
      const y = now.getUTCFullYear();
      const m = now.getUTCMonth();
      fromStr = riyadhDateStr(Date.UTC(y, m, 1));
      toStr = riyadhDateStr(Date.UTC(y, m + 1, 0));
      label = `${monthNames[m]} ${y}`;
      labelAr = `${monthNamesAr[m]} ${y}`;
      break;
    }
    case "lastMonth": {
      const y = now.getUTCFullYear();
      const m = now.getUTCMonth() - 1;
      const ym = m < 0 ? y - 1 : y;
      const mm = m < 0 ? 11 : m;
      fromStr = riyadhDateStr(Date.UTC(ym, mm, 1));
      toStr = riyadhDateStr(Date.UTC(ym, mm + 1, 0));
      label = `${monthNames[mm]} ${ym}`;
      labelAr = `${monthNamesAr[mm]} ${ym}`;
      break;
    }
    case "thisQuarter": {
      const y = now.getUTCFullYear();
      const m = now.getUTCMonth();
      const qStart = Math.floor(m / 3) * 3;
      fromStr = riyadhDateStr(Date.UTC(y, qStart, 1));
      toStr = riyadhDateStr(Date.UTC(y, qStart + 3, 0));
      label = `Q${Math.floor(m / 3) + 1} ${y}`;
      labelAr = `الربع ${Math.floor(m / 3) + 1} ${y}`;
      break;
    }
    case "yearToDate": {
      const y = now.getUTCFullYear();
      const m = now.getUTCMonth();
      const d = now.getUTCDate();
      fromStr = riyadhDateStr(Date.UTC(y, 0, 1));
      toStr = riyadhDateStr(Date.UTC(y, m, d));
      label = `Year to Date ${y}`;
      labelAr = `من بداية العام ${y}`;
      break;
    }
    case "custom": {
      fromStr = customFrom!;
      toStr = customTo!;
      label = `${fromStr} – ${toStr}`;
      labelAr = `${fromStr} – ${toStr}`;
      break;
    }
  }

  const { from: utcFrom, to: utcTo } = toRiyadhRange(
    parseRiyadhDate(fromStr),
    parseRiyadhDate(toStr)
  );

  return { preset, from: fromStr, to: toStr, label, labelAr, utcFrom, utcTo };
}
