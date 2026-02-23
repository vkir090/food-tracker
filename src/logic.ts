import {
  AppState,
  CategoryTotals,
  ExpenseEntry,
  MonthlyGoal,
  MonthlyHistoryPoint,
  PaceSnapshot
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
  return { essen, hausmittel, total: essen + hausmittel };
};

export const getMonthGoals = (goals: MonthlyGoal[], monthKey: string): MonthlyGoal => {
  const found = goals.find((g) => g.monthKey === monthKey);
  return (
    found ?? {
      monthKey,
      essenGoal: null,
      hausmittelGoal: null,
      combinedGoal: null
    }
  );
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
  currentMonthKey: string
): PaceSnapshot => {
  const currentDay = getCurrentDayInBerlin();
  const currentPaceSpent = expenses
    .filter(
      (e) => getMonthKeyFromDateString(e.date) === currentMonthKey && Number(e.date.slice(8, 10)) <= currentDay
    )
    .reduce((sum, e) => sum + e.amount, 0);

  const prevMonthKeys = Array.from(
    new Set(
      expenses
        .map((e) => getMonthKeyFromDateString(e.date))
        .filter((key) => key !== currentMonthKey)
    )
  );

  const partials: number[] = prevMonthKeys.map((monthKey) => {
    const maxDay = Math.min(currentDay, getLastDayOfMonthFromKey(monthKey));
    return expenses
      .filter((e) => getMonthKeyFromDateString(e.date) === monthKey)
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
