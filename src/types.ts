export type Language = "en" | "de" | "ru";

export const CATEGORIES = {
  ESSEN: "ESSEN",
  HAUSMITTEL: "HAUSMITTEL",
  ENTERTAINMENT: "ENTERTAINMENT"
} as const;

export type Category = (typeof CATEGORIES)[keyof typeof CATEGORIES];
export type CategoryFilter = Category | "ALL";

export type ExpenseEntry = {
  id: string;
  amount: number;
  category: Category;
  date: string; // YYYY-MM-DD in Europe/Berlin
  note?: string;
  createdAt: string; // ISO date-time
};

export type MonthlyGoal = {
  monthKey: string; // YYYY-MM
  essenGoal: number | null;
  hausmittelGoal: number | null;
  entertainmentGoal: number | null;
  combinedGoal?: number | null;
};

export type AppSettings = {
  language: Language;
  timezone: "Europe/Berlin";
};

export type AppState = {
  baseAmount: number;
  expenses: ExpenseEntry[];
  goals: MonthlyGoal[];
  settings: AppSettings;
};

export type CategoryTotals = {
  essen: number;
  hausmittel: number;
  entertainment: number;
  total: number;
};

export type MonthlyHistoryPoint = {
  monthKey: string;
  essen: number;
  hausmittel: number;
  entertainment: number;
  total: number;
};

export type PaceSnapshot = {
  current: number;
  average: number | null;
  delta: number | null;
  ratio: number | null;
  hasHistory: boolean;
};
