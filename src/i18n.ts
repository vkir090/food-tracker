import { Language } from "./types";

type TranslationKey =
  | "appTitle"
  | "dashboardTab"
  | "statsTab"
  | "settingsTab"
  | "baseAmount"
  | "addFunds"
  | "addExpense"
  | "expenseModalTitle"
  | "fundModalTitle"
  | "amount"
  | "category"
  | "date"
  | "note"
  | "save"
  | "cancel"
  | "essen"
  | "hausmittel"
  | "goalsTitle"
  | "goalEssen"
  | "goalHausmittel"
  | "goalCombined"
  | "updateGoals"
  | "paceTitle"
  | "paceNotEnough"
  | "paceBelow"
  | "paceAbove"
  | "paceClose"
  | "motivationPositive"
  | "motivationNeutral"
  | "motivationCaution"
  | "remaining"
  | "spent"
  | "goalLabel"
  | "combined"
  | "currentMonth"
  | "monthlyChartTitle"
  | "emptyState"
  | "remainingBudgetTitle"
  | "language"
  | "timezoneLabel"
  | "resetAll"
  | "confirmReset"
  | "warningNegative"
  | "warningOverspend"
  | "addFundsLabel"
  | "averageLabel";

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    appTitle: "Food & Home Budget",
    dashboardTab: "Dashboard",
    statsTab: "Statistics",
    settingsTab: "Settings",
    baseAmount: "Base amount",
    addFunds: "Add funds",
    addExpense: "Add shopping amount",
    expenseModalTitle: "Add shopping amount",
    fundModalTitle: "Add funds to base",
    amount: "Amount",
    category: "Category",
    date: "Date",
    note: "Note (optional)",
    save: "Save",
    cancel: "Cancel",
    essen: "Essen",
    hausmittel: "Hausmittel",
    goalsTitle: "Monthly goals",
    goalEssen: "Essen goal",
    goalHausmittel: "Hausmittel goal",
    goalCombined: "Combined goal (optional)",
    updateGoals: "Save goals",
    paceTitle: "Pace vs average",
    paceNotEnough: "Not enough history yet to compare your spending pace.",
    paceBelow: "You are €{amount} below your usual pace.",
    paceAbove: "You are €{amount} above your usual pace.",
    paceClose: "You're close to your usual pace.",
    motivationPositive: "Nice job — you're spending below your usual average this month.",
    motivationNeutral: "You're close to your usual pace. Keep going!",
    motivationCaution: "You're a bit above your usual pace, but you still have time to stay on track.",
    remaining: "Remaining",
    spent: "Spent",
    goalLabel: "Goal",
    combined: "Combined",
    currentMonth: "Current month",
    monthlyChartTitle: "Monthly totals",
    emptyState: "No expenses yet for this month.",
    remainingBudgetTitle: "Budget status",
    language: "Language",
    timezoneLabel: "Timezone: Europe/Berlin",
    resetAll: "Reset all data",
    confirmReset: "This clears all expenses and goals.",
    warningNegative: "Balance below zero — consider topping up.",
    warningOverspend: "This expense exceeds your base amount and will make it negative.",
    addFundsLabel: "Add amount",
    averageLabel: "Average"
  },
  de: {
    appTitle: "Food & Home Budget",
    dashboardTab: "Übersicht",
    statsTab: "Statistik",
    settingsTab: "Einstellungen",
    baseAmount: "Grundbetrag",
    addFunds: "Guthaben aufladen",
    addExpense: "Einkaufsbetrag hinzufügen",
    expenseModalTitle: "Einkaufsbetrag hinzufügen",
    fundModalTitle: "Grundbetrag erhöhen",
    amount: "Betrag",
    category: "Kategorie",
    date: "Datum",
    note: "Notiz (optional)",
    save: "Speichern",
    cancel: "Abbrechen",
    essen: "Essen",
    hausmittel: "Hausmittel",
    goalsTitle: "Monatsziele",
    goalEssen: "Ziel Essen",
    goalHausmittel: "Ziel Hausmittel",
    goalCombined: "Gesamtziel (optional)",
    updateGoals: "Ziele speichern",
    paceTitle: "Tempo vs. Durchschnitt",
    paceNotEnough: "Noch zu wenig Historie, um dein Ausgabetempo zu vergleichen.",
    paceBelow: "Du liegst um {amount} € unter deinem üblichen Tempo.",
    paceAbove: "Du liegst um {amount} € über deinem üblichen Tempo.",
    paceClose: "Du liegst nah an deinem üblichen Tempo.",
    motivationPositive: "Stark! Du liegst unter deinem üblichen Durchschnitt.",
    motivationNeutral: "Du bist nah an deinem üblichen Tempo. Weiter so!",
    motivationCaution: "Du liegst etwas über deinem üblichen Tempo, aber du hast noch Zeit gegenzusteuern.",
    remaining: "Verbleibend",
    spent: "Ausgegeben",
    goalLabel: "Ziel",
    combined: "Gesamt",
    currentMonth: "Aktueller Monat",
    monthlyChartTitle: "Monatliche Summen",
    emptyState: "Noch keine Ausgaben in diesem Monat.",
    remainingBudgetTitle: "Budget-Status",
    language: "Sprache",
    timezoneLabel: "Zeitzone: Europe/Berlin",
    resetAll: "Alle Daten zurücksetzen",
    confirmReset: "Löscht alle Ausgaben und Ziele.",
    warningNegative: "Kontostand unter Null — bitte aufladen.",
    warningOverspend: "Diese Ausgabe übersteigt den Grundbetrag und wird ihn ins Minus bringen.",
    addFundsLabel: "Betrag hinzufügen",
    averageLabel: "Durchschnitt"
  },
  ru: {
    appTitle: "Food & Home Budget",
    dashboardTab: "Сводка",
    statsTab: "Статистика",
    settingsTab: "Настройки",
    baseAmount: "Основной баланс",
    addFunds: "Пополнить баланс",
    addExpense: "Добавить покупку",
    expenseModalTitle: "Добавить покупку",
    fundModalTitle: "Пополнить основной баланс",
    amount: "Сумма",
    category: "Категория",
    date: "Дата",
    note: "Заметка (необязательно)",
    save: "Сохранить",
    cancel: "Отмена",
    essen: "Еда",
    hausmittel: "Хозяйственные товары",
    goalsTitle: "Месячные цели",
    goalEssen: "Лимит на еду",
    goalHausmittel: "Лимит на хозяйство",
    goalCombined: "Общий лимит (опционально)",
    updateGoals: "Сохранить цели",
    paceTitle: "Темп vs средний",
    paceNotEnough: "Недостаточно истории, чтобы сравнить темп трат.",
    paceBelow: "Вы на {amount} € ниже обычного темпа.",
    paceAbove: "Вы на {amount} € выше обычного темпа.",
    paceClose: "Вы близки к обычному темпу.",
    motivationPositive: "Отлично — траты ниже привычных.",
    motivationNeutral: "Вы около обычного темпа. Продолжайте!",
    motivationCaution: "Вы чуть выше обычного темпа, но еще есть время скорректироваться.",
    remaining: "Остаток",
    spent: "Потрачено",
    goalLabel: "Лимит",
    combined: "Суммарно",
    currentMonth: "Текущий месяц",
    monthlyChartTitle: "Помсячные суммы",
    emptyState: "В этом месяце пока нет расходов.",
    remainingBudgetTitle: "Статус бюджета",
    language: "Язык",
    timezoneLabel: "Часовой пояс: Europe/Berlin",
    resetAll: "Сбросить все данные",
    confirmReset: "Очистит все расходы и цели.",
    warningNegative: "Баланс ниже нуля — пополните при возможности.",
    warningOverspend: "Эта трата превысит баланс и уведет его в минус.",
    addFundsLabel: "Добавить сумму",
    averageLabel: "Среднее"
  }
};

export const languageOptions: { code: Language; label: string }[] = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "ru", label: "Русский" }
];

const localeByLanguage: Record<Language, string> = {
  en: "en-US",
  de: "de-DE",
  ru: "ru-RU"
};

export const translate = (
  language: Language,
  key: TranslationKey,
  vars?: Record<string, string | number>
): string => {
  const template = translations[language]?.[key] ?? translations.en[key] ?? key;
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
    template
  );
};

export const formatCurrency = (amount: number, language: Language): string =>
  new Intl.NumberFormat(localeByLanguage[language], {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2
  }).format(amount);
