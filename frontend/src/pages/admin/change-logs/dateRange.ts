import { subMonths } from "date-fns";

const pad2 = (value: number) => String(value).padStart(2, "0");

const toDateInput = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

// Keep the previous month's last day when the current day does not exist there.
export const getDefaultBizChangeLogDateRange = (now = new Date()) => ({
  beginTime: toDateInput(subMonths(now, 1)),
  endTime: toDateInput(now)
});
