const berlinFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

export const getBerlinDateString = (date: Date): string => berlinFormatter.format(date);

export const getBerlinTodayString = (): string => getBerlinDateString(new Date());

export const getCurrentMonthKey = (): string => getBerlinTodayString().slice(0, 7);

export const getMonthKeyFromDate = (date: Date): string => getBerlinDateString(date).slice(0, 7);

export const getMonthKeyFromDateString = (dateStr: string): string => dateStr.slice(0, 7);

export const parseDateParts = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return { year, month, day };
};

export const getDayFromDateString = (dateStr: string): number => parseDateParts(dateStr).day;

export const getLastDayOfMonthFromKey = (monthKey: string): number => {
  const [yearStr, monthStr] = monthKey.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
};

export const getCurrentDayInBerlin = (): number => getDayFromDateString(getBerlinTodayString());

export const formatMonthLabel = (monthKey: string): string => {
  const [yearStr, monthStr] = monthKey.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  const date = new Date(Date.UTC(year, monthIndex, 1));
  return date.toLocaleString("en-US", { month: "short", year: "numeric" });
};
