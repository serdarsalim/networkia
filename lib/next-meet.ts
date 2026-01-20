import { type NextMeetCadence } from "@/lib/types";

const DAY_MS = 1000 * 60 * 60 * 24;

const pad2 = (value: number) => String(value).padStart(2, "0");

const toMidnight = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

const parseCalendarDate = (value: string) => {
  const datePart = value.split("T")[0];
  const [year, month, day] = datePart.split("-").map((part) => Number(part));
  if (!year || !month || !day) {
    return null;
  }
  return new Date(year, month - 1, day);
};

const formatCalendarDate = (value: Date) =>
  `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(
    value.getDate()
  )}`;

const addMonthsClamped = (value: Date, months: number) => {
  const day = value.getDate();
  const start = new Date(value.getFullYear(), value.getMonth() + months, 1);
  const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  return new Date(start.getFullYear(), start.getMonth(), Math.min(day, lastDay));
};

const getNextMeetFromCadence = (
  base: Date,
  cadence: NextMeetCadence,
  today: Date
) => {
  const baseMidnight = toMidnight(base);
  const todayMidnight = toMidnight(today);
  if (baseMidnight.getTime() >= todayMidnight.getTime()) {
    return baseMidnight;
  }

  if (cadence === "weekly" || cadence === "biweekly") {
    const intervalDays = cadence === "weekly" ? 7 : 14;
    const diffDays = Math.floor(
      (todayMidnight.getTime() - baseMidnight.getTime()) / DAY_MS
    );
    const intervalsToAdd = Math.floor(diffDays / intervalDays) + 1;
    const next = new Date(baseMidnight);
    next.setDate(next.getDate() + intervalsToAdd * intervalDays);
    return next;
  }

  const intervalMonths = cadence === "monthly" ? 1 : 3;
  const monthsDiff =
    (todayMidnight.getFullYear() - baseMidnight.getFullYear()) * 12 +
    (todayMidnight.getMonth() - baseMidnight.getMonth());
  let intervalsToAdd = Math.floor(monthsDiff / intervalMonths);
  let next = addMonthsClamped(baseMidnight, intervalsToAdd * intervalMonths);
  if (next.getTime() < todayMidnight.getTime()) {
    intervalsToAdd += 1;
    next = addMonthsClamped(baseMidnight, intervalsToAdd * intervalMonths);
  }
  return next;
};

export const getEffectiveNextMeetDate = (
  nextMeetDate: string | null | undefined,
  cadence: NextMeetCadence | null | undefined,
  now: Date = new Date()
) => {
  if (!nextMeetDate) {
    return { date: null as Date | null, didAdvance: false };
  }
  const parsed = parseCalendarDate(nextMeetDate);
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return { date: null as Date | null, didAdvance: false };
  }
  if (!cadence) {
    return { date: toMidnight(parsed), didAdvance: false };
  }
  const next = getNextMeetFromCadence(parsed, cadence, now);
  const didAdvance = toMidnight(parsed).getTime() < toMidnight(now).getTime();
  return { date: next, didAdvance };
};

export const toDateInputValue = (value: Date) =>
  formatCalendarDate(value);

export const getCadenceRrule = (
  cadence: NextMeetCadence | null | undefined
) => {
  if (!cadence) {
    return null;
  }
  switch (cadence) {
    case "weekly":
      return "RRULE:FREQ=WEEKLY;INTERVAL=1";
    case "biweekly":
      return "RRULE:FREQ=WEEKLY;INTERVAL=2";
    case "monthly":
      return "RRULE:FREQ=MONTHLY;INTERVAL=1";
    case "quarterly":
      return "RRULE:FREQ=MONTHLY;INTERVAL=3";
    default:
      return null;
  }
};
