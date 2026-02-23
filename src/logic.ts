import {
  AppState,
  CategoryTotals,
  ExpenseEntry,
  MonthlyGoal,
  MonthlyHistoryPoint,
  PaceSnapshot,
  Category,
  CategoryFilter
} from "./types";
import {
  getCurrentDayInBerlin,
  getLastDayOfMonthFromKey,
  getMonthKeyFromDateString
} from "./dateUtils";

export const defaultState: AppState = {
  baseAmount: 0,
  expenses: [],
  goals: [],
  settings: {
    language: "en",
    timezone: "Europe/Berlin"
  }
};

export const getMonthTotals = (expenses: ExpenseEntry[], monthKey: string): CategoryTotals => {
  const filtered = expenses.filter((e) => getMonthKeyFromDateString(e.date) === monthKey);
  const essen = filtered
    .filter((e) => e.category === "ESSEN")
    .reduce((sum, e) => sum + e.amount, 0);
  const hausmittel = filtered
    .filter((e) => e.category === "HAUSMITTEL")
    .reduce((sum, e) => sum + e.amount, 0);
  const entertainment = filtered
    .filter((e) => e.category === "ENTERTAINMENT")
    .reduce((sum, e) => sum + e.amount, 0);
  return { essen, hausmittel, entertainment, total: essen + hausmittel + entertainment };
};

export const getMonthGoals = (goals: MonthlyGoal[], monthKey: string): MonthlyGoal => {
  const found = goals.find((g) => g.monthKey === monthKey);
  if (found) {
    return {
      monthKey,
      essenGoal: found.essenGoal ?? null,
      hausmittelGoal: found.hausmittelGoal ?? null,
      entertainmentGoal: found.entertainmentGoal ?? null,
      combinedGoal: found.combinedGoal ?? null
    };
  }
  return {
    monthKey,
    essenGoal: null,
    hausmittelGoal: null,
    entertainmentGoal: null,
    combinedGoal: null
  };
};

export const buildHistoryPoints = (expenses: ExpenseEntry[]): MonthlyHistoryPoint[] => {
  const monthKeys = Array.from(
    new Set(expenses.map((e) => getMonthKeyFromDateString(e.date)))
  ).sort();

  return monthKeys.map((key) => {
    const totals = getMonthTotals(expenses, key);
    return { monthKey: key, ...totals };
  });
};

export const computePaceSnapshot = (
  expenses: ExpenseEntry[],
  currentMonthKey: string,
  category: CategoryFilter = "ALL"
): PaceSnapshot => {
  const matchesCategory = (entry: ExpenseEntry) =>
    category === "ALL" ? true : entry.category === category;

  const currentDay = getCurrentDayInBerlin();
  const currentPaceSpent = expenses
    .filter(
      (e) =>
        getMonthKeyFromDateString(e.date) === currentMonthKey &&
        Number(e.date.slice(8, 10)) <= currentDay &&
        matchesCategory(e)
    )
    .reduce((sum, e) => sum + e.amount, 0);

  const prevMonthKeys = Array.from(
    new Set(
      expenses
        .filter(matchesCategory)
        .map((e) => getMonthKeyFromDateString(e.date))
        .filter((key) => key !== currentMonthKey)
    )
  );

  const partials: number[] = prevMonthKeys.map((monthKey) => {
    const maxDay = Math.min(currentDay, getLastDayOfMonthFromKey(monthKey));
    return expenses
      .filter((e) => getMonthKeyFromDateString(e.date) === monthKey && matchesCategory(e))
      .filter((e) => Number(e.date.slice(8, 10)) <= maxDay)
      .reduce((sum, e) => sum + e.amount, 0);
  });

  if (partials.length === 0) {
    return {
      current: currentPaceSpent,
      average: null,
      delta: null,
      ratio: null,
      hasHistory: false
    };
  }

  const average = partials.reduce((a, b) => a + b, 0) / partials.length;
  const delta = currentPaceSpent - average;
  const ratio = average === 0 ? null : currentPaceSpent / average;
  return {
    current: currentPaceSpent,
    average,
    delta,
    ratio,
    hasHistory: true
  };
};

const getDayNumber = (dateStr: string): number => Number(dateStr.slice(8, 10));

export const computeDailySeries = (
  expenses: ExpenseEntry[],
  currentMonthKey: string,
  category: CategoryFilter = "ALL"
) => {
  const matchesCategory = (entry: ExpenseEntry) =>
    category === "ALL" ? true : entry.category === category;

  const lastDayCurrent = getLastDayOfMonthFromKey(currentMonthKey);
  const today = getCurrentDayInBerlin();
  const dayLimit = Math.min(today, lastDayCurrent);
  const days = Array.from({ length: dayLimit }, (_, i) => i + 1);

  const currentDaily = new Array(dayLimit).fill(0);
  expenses
    .filter(
      (e) => getMonthKeyFromDateString(e.date) === currentMonthKey && matchesCategory(e)
    )
    .forEach((e) => {
      const d = getDayNumber(e.date);
      if (d >= 1 && d <= dayLimit) {
        currentDaily[d - 1] += e.amount;
      }
    });

  const prevMonthKeys = Array.from(
    new Set(
      expenses
        .filter((e) => getMonthKeyFromDateString(e.date) !== currentMonthKey && matchesCategory(e))
        .map((e) => getMonthKeyFromDateString(e.date))
    )
  );

  const averageSums = new Array(dayLimit).fill(0);
  const averageCounts = new Array(dayLimit).fill(0);

  prevMonthKeys.forEach((monthKey) => {
    const lastDay = getLastDayOfMonthFromKey(monthKey);
    const limit = Math.min(dayLimit, lastDay);
    const monthDaily = new Array(limit).fill(0);

    expenses
      .filter((e) => getMonthKeyFromDateString(e.date) === monthKey && matchesCategory(e))
      .forEach((e) => {
        const d = getDayNumber(e.date);
        if (d >= 1 && d <= limit) {
          monthDaily[d - 1] += e.amount;
        }
      });

    monthDaily.forEach((value, idx) => {
      averageSums[idx] += value;
      averageCounts[idx] += 1;
    });
  });

  const averageDaily = averageSums.map((sum, idx) =>
    averageCounts[idx] > 0 ? sum / averageCounts[idx] : 0
  );

  const toCumulative = (arr: number[]) => {
    const result: number[] = [];
    arr.reduce((acc, val) => {
      const next = acc + val;
      result.push(next);
      return next;
    }, 0);
    return result;
  };

  return {
    days,
    currentDaily,
    averageDaily,
    currentCumulative: toCumulative(currentDaily),
    averageCumulative: toCumulative(averageDaily),
    hasHistory: prevMonthKeys.length > 0
  };
};
