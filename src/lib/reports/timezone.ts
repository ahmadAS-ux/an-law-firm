// Asia/Riyadh is UTC+3 with no DST — safe to use fixed arithmetic.
// NEVER use raw `new Date()` for date comparisons in reports; use these helpers.

const RIYADH_OFFSET_MS = 3 * 60 * 60 * 1000;

export const FIRM_TIMEZONE = "Asia/Riyadh";

/** Returns the start of the given date in Riyadh calendar time, as a UTC Date. */
function startOfRiyadhDay(date: Date): Date {
  const riyadhMs = date.getTime() + RIYADH_OFFSET_MS;
  const d = new Date(riyadhMs);
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - RIYADH_OFFSET_MS
  );
}

/**
 * Converts a from/to date pair into a UTC half-open range [from, to).
 * Inputs are treated as Riyadh calendar dates (midnight Riyadh = UTC−3h).
 * CRITICAL: queries must use `date >= from AND date < to` — never BETWEEN.
 */
export function toRiyadhRange(fromDate: Date, toDate: Date): { from: Date; to: Date } {
  const from = startOfRiyadhDay(fromDate);
  const toExclusive = new Date(startOfRiyadhDay(toDate).getTime() + 24 * 60 * 60 * 1000);
  return { from, to: toExclusive };
}

/**
 * Parses a YYYY-MM-DD string as a Riyadh calendar date and returns its UTC equivalent.
 * Use for custom period ?from=YYYY-MM-DD query params.
 */
export function parseRiyadhDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) - RIYADH_OFFSET_MS);
}

/** Returns the start of today in Riyadh calendar time (UTC equivalent). */
export function riyadhToday(): Date {
  return startOfRiyadhDay(new Date());
}

/** Counts calendar days between two dates in Riyadh time (not raw 24-hour blocks). */
export function riyadhCalendarDaysBetween(earlier: Date, later: Date): number {
  const a = startOfRiyadhDay(earlier);
  const b = startOfRiyadhDay(later);
  return Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));
}

/** Returns the Riyadh calendar date string (YYYY-MM-DD) for a given UTC date. */
export function toRiyadhDateString(date: Date): string {
  const d = new Date(date.getTime() + RIYADH_OFFSET_MS);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
