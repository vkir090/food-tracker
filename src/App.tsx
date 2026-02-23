import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatCurrency, languageOptions, translate } from "./i18n";
import {
  defaultState,
  buildHistoryPoints,
  computeDailySeries,
  computePaceSnapshot,
  getMonthGoals,
  getMonthTotals
} from "./logic";
import { loadState, saveState } from "./storage";
import { getBerlinTodayString, getCurrentMonthKey, getMonthKeyFromDateString, formatMonthLabel } from "./dateUtils";
import { Category, CategoryFilter, ExpenseEntry, Language, MonthlyGoal } from "./types";

type TabKey = "dashboard" | "stats" | "settings";

const CATEGORY_COLORS: Record<Category | "total", string> = {
  ESSEN: "#3b82f6",
  HAUSMITTEL: "#f59e0b",
  ENTERTAINMENT: "#8b5cf6",
  total: "#111827"
};

const randomId = () => Math.random().toString(36).slice(2, 10);

const usePersistentState = () => {
  const [state, setState] = useState(() => loadState() ?? defaultState);

  const updateState = (updater: (prev: typeof state) => typeof state) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  };

  return { state, updateState };
};

const ExpenseModal = ({
  onClose,
  onSave,
  language,
  currentBase
}: {
  onClose: () => void;
  onSave: (data: { amount: number; category: Category; date: string; note?: string }) => void;
  language: Language;
  currentBase: number;
}) => {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("ESSEN");
  const [date, setDate] = useState(getBerlinTodayString());
  const [note, setNote] = useState("");

  const amountValue = Number(amount);
  const invalid = Number.isNaN(amountValue) || amountValue <= 0;
  const willBeNegative = !invalid && amountValue > currentBase;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{translate(language, "expenseModalTitle")}</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (invalid) return;
            onSave({ amount: amountValue, category, date, note: note.trim() || undefined });
            onClose();
          }}
        >
          <div>
            <label>{translate(language, "amount")}</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <label>{translate(language, "category")}</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              <option value="ESSEN">{translate(language, "essen")}</option>
              <option value="HAUSMITTEL">{translate(language, "hausmittel")}</option>
              <option value="ENTERTAINMENT">{translate(language, "entertainment")}</option>
            </select>
          </div>
          <div>
            <label>{translate(language, "date")}</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label>{translate(language, "note")}</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={translate(language, "note")} />
          </div>
          {willBeNegative && <div className="warning small">{translate(language, "warningOverspend")}</div>}
          <div className="actions" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="btn ghost" onClick={onClose}>
              {translate(language, "cancel")}
            </button>
            <button type="submit" className="btn" disabled={invalid}>
              {translate(language, "save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FundsModal = ({
  onClose,
  onSave,
  language
}: {
  onClose: () => void;
  onSave: (amount: number) => void;
  language: Language;
}) => {
  const [amount, setAmount] = useState("");
  const amountValue = Number(amount);
  const invalid = Number.isNaN(amountValue) || amountValue <= 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{translate(language, "fundModalTitle")}</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (invalid) return;
            onSave(amountValue);
            onClose();
          }}
        >
          <div>
            <label>{translate(language, "addFundsLabel")}</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="actions" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="btn ghost" onClick={onClose}>
              {translate(language, "cancel")}
            </button>
            <button type="submit" className="btn" disabled={invalid}>
              {translate(language, "save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const App = () => {
  const { state, updateState } = usePersistentState();
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [showExpense, setShowExpense] = useState(false);
  const [showFunds, setShowFunds] = useState(false);
  const [lineMode, setLineMode] = useState<"cumulative" | "daily">("cumulative");
  const [lineCategory, setLineCategory] = useState<CategoryFilter>("ALL");

  const monthKey = getCurrentMonthKey();
  const [pieMonthKey, setPieMonthKey] = useState(monthKey);
  useEffect(() => {
    setPieMonthKey(monthKey);
  }, [monthKey]);

  const monthTotals = useMemo(() => getMonthTotals(state.expenses, monthKey), [state.expenses, monthKey]);
  const goals = useMemo(() => getMonthGoals(state.goals, monthKey), [state.goals, monthKey]);
  const comparisonTargets = [
    { key: "ALL" as CategoryFilter, label: "allCategories" },
    { key: "ESSEN" as CategoryFilter, label: "essen" },
    { key: "HAUSMITTEL" as CategoryFilter, label: "hausmittel" },
    { key: "ENTERTAINMENT" as CategoryFilter, label: "entertainment" }
  ];
  const comparisons = useMemo(
    () =>
      comparisonTargets.map((target) => ({
        ...target,
        snapshot: computePaceSnapshot(state.expenses, monthKey, target.key)
      })),
    [state.expenses, monthKey]
  );
  const combinedSnapshot = comparisons.find((c) => c.key === "ALL")?.snapshot;
  const historyPoints = useMemo(() => buildHistoryPoints(state.expenses), [state.expenses]);
  const dailySeries = useMemo(
    () => computeDailySeries(state.expenses, monthKey, lineCategory),
    [state.expenses, monthKey, lineCategory]
  );

  const remainingEssen = goals.essenGoal != null ? goals.essenGoal - monthTotals.essen : null;
  const remainingHaus = goals.hausmittelGoal != null ? goals.hausmittelGoal - monthTotals.hausmittel : null;
  const remainingEntertainment =
    goals.entertainmentGoal != null ? goals.entertainmentGoal - monthTotals.entertainment : null;
  const remainingCombined = goals.combinedGoal != null ? goals.combinedGoal - monthTotals.total : null;

  const motivation =
    !combinedSnapshot || !combinedSnapshot.hasHistory || combinedSnapshot.ratio == null
      ? null
      : combinedSnapshot.ratio <= 0.9
      ? "motivationPositive"
      : combinedSnapshot.ratio <= 1.1
      ? "motivationNeutral"
      : "motivationCaution";

  const currentLang = state.settings.language;

  const addExpense = (data: { amount: number; category: Category; date: string; note?: string }) => {
    const newExpense: ExpenseEntry = {
      id: randomId(),
      amount: data.amount,
      category: data.category,
      date: data.date,
      note: data.note,
      createdAt: new Date().toISOString()
    };
    updateState((prev) => ({
      ...prev,
      baseAmount: prev.baseAmount - data.amount,
      expenses: [...prev.expenses, newExpense]
    }));
  };

  const addFunds = (amount: number) => {
    updateState((prev) => ({ ...prev, baseAmount: prev.baseAmount + amount }));
  };

  const updateGoalsForMonth = (incoming: MonthlyGoal) => {
    updateState((prev) => {
      const others = prev.goals.filter((g) => g.monthKey !== incoming.monthKey);
      return { ...prev, goals: [...others, incoming] };
    });
  };

  const changeLanguage = (language: Language) => {
    updateState((prev) => ({ ...prev, settings: { ...prev.settings, language } }));
  };

  const resetAll = () => {
    updateState(() => ({
      ...defaultState,
      settings: { ...defaultState.settings, language: currentLang }
    }));
  };

  const currentMonthExpenses = state.expenses.filter(
    (e) => getMonthKeyFromDateString(e.date) === monthKey
  );

  const baseIsNegative = state.baseAmount < 0;

  return (
    <div className="app-shell">
      <div className="topbar">
        <div>
          <p className="muted small">{translate(currentLang, "currentMonth")}: {monthKey}</p>
          <h1 className="title">{translate(currentLang, "appTitle")}</h1>
        </div>
        <div className="nav">
          <button className={tab === "dashboard" ? "active" : ""} onClick={() => setTab("dashboard")}>
            {translate(currentLang, "dashboardTab")}
          </button>
          <button className={tab === "stats" ? "active" : ""} onClick={() => setTab("stats")}>
            {translate(currentLang, "statsTab")}
          </button>
          <button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}>
            {translate(currentLang, "settingsTab")}
          </button>
        </div>
      </div>

      {tab === "dashboard" && (
        <div className="grid" style={{ gap: 20 }}>
          <div className="card">
            <div className="balance-card">
              <div>
                <p className="muted">{translate(currentLang, "baseAmount")}</p>
                <div className="stat-value">{formatCurrency(state.baseAmount, currentLang)}</div>
                {baseIsNegative && <p className="warning small">{translate(currentLang, "warningNegative")}</p>}
              </div>
              <div className="balance-actions">
                <button className="btn" onClick={() => setShowExpense(true)}>
                  {translate(currentLang, "addExpense")}
                </button>
                <button className="btn ghost" onClick={() => setShowFunds(true)}>
                  {translate(currentLang, "addFunds")}
                </button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">{translate(currentLang, "remainingBudgetTitle")}</h3>
            <div className="grid cols-4">
              <BudgetTile
                label={translate(currentLang, "essen")}
                spent={monthTotals.essen}
                goal={goals.essenGoal}
                remaining={remainingEssen}
                language={currentLang}
              />
              <BudgetTile
                label={translate(currentLang, "hausmittel")}
                spent={monthTotals.hausmittel}
                goal={goals.hausmittelGoal}
                remaining={remainingHaus}
                language={currentLang}
              />
              <BudgetTile
                label={translate(currentLang, "entertainment")}
                spent={monthTotals.entertainment}
                goal={goals.entertainmentGoal}
                remaining={remainingEntertainment}
                language={currentLang}
              />
              <BudgetTile
                label={translate(currentLang, "combined")}
                spent={monthTotals.total}
                goal={goals.combinedGoal ?? null}
                remaining={remainingCombined}
                language={currentLang}
              />
            </div>
          </div>

          <div className="grid cols-2">
            <div className="card">
              <h3 className="section-title">{translate(currentLang, "paceTitle")}</h3>
              {!combinedSnapshot || !combinedSnapshot.hasHistory || combinedSnapshot.average == null ? (
                <p className="muted">{translate(currentLang, "paceNotEnough")}</p>
              ) : (
                <>
                  <p>
                    {combinedSnapshot.delta != null && combinedSnapshot.delta < 0
                      ? translate(currentLang, "paceBelow", {
                          amount: formatCurrency(Math.abs(combinedSnapshot.delta), currentLang)
                        })
                      : combinedSnapshot.delta != null && combinedSnapshot.delta > 0
                      ? translate(currentLang, "paceAbove", {
                          amount: formatCurrency(Math.abs(combinedSnapshot.delta), currentLang)
                        })
                      : translate(currentLang, "paceClose")}
                  </p>
                  <p className={motivation === "motivationPositive" ? "positive" : motivation === "motivationCaution" ? "warning" : "neutral"}>
                    {motivation ? translate(currentLang, motivation) : translate(currentLang, "paceNotEnough")}
                  </p>
                </>
              )}
              {combinedSnapshot && (
                <p className="muted small">
                  {translate(currentLang, "currentMonth")}: {formatCurrency(combinedSnapshot.current, currentLang)}
                  {combinedSnapshot.average != null
                    ? ` • ${translate(currentLang, "averageLabel")}: ${formatCurrency(combinedSnapshot.average, currentLang)}`
                    : ""}
                </p>
              )}
              <ComparisonTable language={currentLang} comparisons={comparisons} />
            </div>

            <div className="card">
              <h3 className="section-title">{translate(currentLang, "goalsTitle")}</h3>
              <GoalsForm
                language={currentLang}
                goals={goals}
                onSave={(g) => updateGoalsForMonth(g)}
                monthKey={monthKey}
              />
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">{translate(currentLang, "dashboardTab")}</h3>
            {currentMonthExpenses.length === 0 ? (
              <p className="muted">{translate(currentLang, "emptyState")}</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>{translate(currentLang, "date")}</th>
                    <th>{translate(currentLang, "category")}</th>
                    <th>{translate(currentLang, "note")}</th>
                    <th>{translate(currentLang, "amount")}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMonthExpenses
                    .sort((a, b) => (a.date < b.date ? 1 : -1))
                    .map((e) => (
                      <tr key={e.id}>
                        <td>{e.date}</td>
                        <td>
                          {e.category === "ESSEN"
                            ? translate(currentLang, "essen")
                            : e.category === "HAUSMITTEL"
                            ? translate(currentLang, "hausmittel")
                            : translate(currentLang, "entertainment")}
                        </td>
                        <td>{e.note ?? "-"}</td>
                        <td>{formatCurrency(e.amount, currentLang)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === "stats" && (
        <div className="grid" style={{ gap: 20 }}>
          <div className="card chart-card">
            <h3 className="section-title">{translate(currentLang, "monthlyChartTitle")}</h3>
            {historyPoints.length === 0 ? (
              <p className="muted">{translate(currentLang, "emptyState")}</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyPoints}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthKey" tickFormatter={formatMonthLabel} />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value), currentLang)} labelFormatter={formatMonthLabel} />
                  <Legend />
                  <Bar dataKey="essen" fill={CATEGORY_COLORS.ESSEN} name={translate(currentLang, "essen")} />
                  <Bar dataKey="hausmittel" fill={CATEGORY_COLORS.HAUSMITTEL} name={translate(currentLang, "hausmittel")} />
                  <Bar dataKey="entertainment" fill={CATEGORY_COLORS.ENTERTAINMENT} name={translate(currentLang, "entertainment")} />
                  <Bar dataKey="total" fill={CATEGORY_COLORS.total} name={translate(currentLang, "combined")} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card chart-card">
            <div className="chart-controls">
              <h3 className="section-title">{translate(currentLang, "lineChartTitle")}</h3>
              <div className="control-row">
                <button
                  className={`btn ${lineMode === "cumulative" ? "" : "ghost"}`}
                  onClick={() => setLineMode("cumulative")}
                >
                  {translate(currentLang, "modeCumulative")}
                </button>
                <button
                  className={`btn ${lineMode === "daily" ? "" : "ghost"}`}
                  onClick={() => setLineMode("daily")}
                >
                  {translate(currentLang, "modeDaily")}
                </button>
              </div>
              <div className="control-row">
                <span className="muted small">{translate(currentLang, "categoryFilter")}</span>
                <select
                  className="select-wide"
                  value={lineCategory}
                  onChange={(e) => setLineCategory(e.target.value as CategoryFilter)}
                >
                  <option value="ALL">{translate(currentLang, "allCategories")}</option>
                  <option value="ESSEN">{translate(currentLang, "essen")}</option>
                  <option value="HAUSMITTEL">{translate(currentLang, "hausmittel")}</option>
                  <option value="ENTERTAINMENT">{translate(currentLang, "entertainment")}</option>
                </select>
              </div>
            </div>
            {dailySeries.days.length === 0 ? (
              <p className="muted">{translate(currentLang, "emptyState")}</p>
            ) : !dailySeries.hasHistory ? (
              <p className="muted">{translate(currentLang, "historyNeeded")}</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailySeries.days.map((day, idx) => ({
                    day,
                    current: lineMode === "cumulative" ? dailySeries.currentCumulative[idx] : dailySeries.currentDaily[idx],
                    average: lineMode === "cumulative" ? dailySeries.averageCumulative[idx] : dailySeries.averageDaily[idx]
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value), currentLang)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="current"
                    stroke={CATEGORY_COLORS.total}
                    name={translate(currentLang, "currentLabel")}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke={CATEGORY_COLORS.ESSEN}
                    name={translate(currentLang, "averageLabel")}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card chart-card">
            <div className="chart-controls">
              <h3 className="section-title">{translate(currentLang, "pieChartTitle")}</h3>
              <div className="control-row">
                <label className="muted small" htmlFor="pie-month">
                  {translate(currentLang, "monthLabel")}
                </label>
                <select
                  id="pie-month"
                  className="select-wide"
                  value={pieMonthKey}
                  onChange={(e) => setPieMonthKey(e.target.value)}
                >
                  {Array.from(new Set([...historyPoints.map((h) => h.monthKey), monthKey]))
                    .sort()
                    .reverse()
                    .map((key) => (
                      <option value={key} key={key}>
                        {formatMonthLabel(key)}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            {(() => {
              const totals = getMonthTotals(state.expenses, pieMonthKey);
              const pieData = [
                { name: translate(currentLang, "essen"), value: totals.essen, color: CATEGORY_COLORS.ESSEN },
                { name: translate(currentLang, "hausmittel"), value: totals.hausmittel, color: CATEGORY_COLORS.HAUSMITTEL },
                { name: translate(currentLang, "entertainment"), value: totals.entertainment, color: CATEGORY_COLORS.ENTERTAINMENT }
              ];
              const totalValue = pieData.reduce((sum, item) => sum + item.value, 0);
              if (totalValue === 0) {
                return <p className="muted">{translate(currentLang, "emptyState")}</p>;
              }
              return (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip formatter={(value) => formatCurrency(Number(value), currentLang)} />
                    <Legend />
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius="70%">
                      {pieData.map((entry, index) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              );
            })()}
          </div>
        </div>
      )}

      {tab === "settings" && (
        <div className="grid" style={{ gap: 20 }}>
          <div className="card">
            <h3 className="section-title">{translate(currentLang, "language")}</h3>
            <div className="lang-switch">
              {languageOptions.map((lang) => (
                <button
                  key={lang.code}
                  className={`btn ${lang.code === currentLang ? "" : "ghost"}`}
                  onClick={() => changeLanguage(lang.code)}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <p className="muted small" style={{ marginTop: 10 }}>
              {translate(currentLang, "timezoneLabel")}
            </p>
          </div>

          <div className="card">
            <h3 className="section-title">{translate(currentLang, "resetAll")}</h3>
            <p className="muted small">{translate(currentLang, "confirmReset")}</p>
            <button className="btn secondary" onClick={resetAll}>
              {translate(currentLang, "resetAll")}
            </button>
          </div>
        </div>
      )}

      {showExpense && (
        <ExpenseModal
          onClose={() => setShowExpense(false)}
          onSave={addExpense}
          language={currentLang}
          currentBase={state.baseAmount}
        />
      )}
      {showFunds && (
        <FundsModal onClose={() => setShowFunds(false)} onSave={addFunds} language={currentLang} />
      )}
    </div>
  );
};

const ComparisonTable = ({
  language,
  comparisons
}: {
  language: Language;
  comparisons: { key: CategoryFilter; label: string; snapshot: ReturnType<typeof computePaceSnapshot> }[];
}) => {
  const hasAnyHistory = comparisons.some((c) => c.snapshot.hasHistory);
  return (
    <div style={{ marginTop: 12 }}>
      <table className="table comparison-table">
        <thead>
          <tr>
            <th>{translate(language, "category")}</th>
            <th>{translate(language, "currentLabel")}</th>
            <th>{translate(language, "averageLabel")}</th>
            <th>{translate(language, "deltaLabel")}</th>
          </tr>
        </thead>
        <tbody>
          {comparisons.map((c) => {
            const { snapshot } = c;
            const delta =
              snapshot.average == null || snapshot.delta == null ? null : snapshot.delta;
            const deltaClass = delta == null ? "" : delta > 0 ? "warning" : "positive";
            const deltaText =
              delta == null
                ? "—"
                : `${delta > 0 ? "+" : ""}${formatCurrency(delta, language)}`;
            return (
              <tr key={c.key}>
                <td>{translate(language, c.label as any)}</td>
                <td>{formatCurrency(snapshot.current, language)}</td>
                <td>
                  {snapshot.average != null ? formatCurrency(snapshot.average, language) : "—"}
                </td>
                <td className={deltaClass}>{deltaText}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!hasAnyHistory && <p className="muted small">{translate(language, "historyNeeded")}</p>}
    </div>
  );
};

const BudgetTile = ({
  label,
  spent,
  goal,
  remaining,
  language
}: {
  label: string;
  spent: number;
  goal: number | null;
  remaining: number | null;
  language: Language;
}) => {
  return (
    <div className="card">
      <p className="muted">{label}</p>
      <div className="stat-value">{formatCurrency(spent, language)}</div>
      <p className="muted small">
        {goal != null ? `${translate(language, "goalLabel")}: ${formatCurrency(goal, language)}` : translate(language, "goalLabel") + ": —"}
      </p>
      <p className={remaining != null && remaining < 0 ? "warning" : "positive"}>
        {translate(language, "remaining")}: {remaining != null ? formatCurrency(remaining, language) : "—"}
      </p>
    </div>
  );
};

const GoalsForm = ({
  language,
  goals,
  onSave,
  monthKey
}: {
  language: Language;
  goals: MonthlyGoal;
  onSave: (g: MonthlyGoal) => void;
  monthKey: string;
}) => {
  const [essenGoal, setEssenGoal] = useState(goals.essenGoal ?? "");
  const [hausGoal, setHausGoal] = useState(goals.hausmittelGoal ?? "");
  const [entertainmentGoal, setEntertainmentGoal] = useState(goals.entertainmentGoal ?? "");
  const [combinedGoal, setCombinedGoal] = useState(goals.combinedGoal ?? "");

  // Keep inputs in sync when month goals change (e.g., new month).
  useEffect(() => {
    setEssenGoal(goals.essenGoal ?? "");
    setHausGoal(goals.hausmittelGoal ?? "");
    setEntertainmentGoal(goals.entertainmentGoal ?? "");
    setCombinedGoal(goals.combinedGoal ?? "");
  }, [goals]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          monthKey,
          essenGoal: essenGoal === "" ? null : Number(essenGoal),
          hausmittelGoal: hausGoal === "" ? null : Number(hausGoal),
          entertainmentGoal: entertainmentGoal === "" ? null : Number(entertainmentGoal),
          combinedGoal: combinedGoal === "" ? null : Number(combinedGoal)
        });
      }}
    >
      <div className="grid cols-2">
        <div>
          <label>{translate(language, "goalEssen")}</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={essenGoal}
            onChange={(e) => setEssenGoal(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="0"
          />
        </div>
        <div>
          <label>{translate(language, "goalHausmittel")}</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={hausGoal}
            onChange={(e) => setHausGoal(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="0"
          />
        </div>
        <div>
          <label>{translate(language, "goalEntertainment")}</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={entertainmentGoal}
            onChange={(e) => setEntertainmentGoal(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="0"
          />
        </div>
        <div>
          <label>{translate(language, "goalCombined")}</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={combinedGoal}
            onChange={(e) => setCombinedGoal(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="0"
          />
        </div>
      </div>
      <div className="actions" style={{ marginTop: 10, justifyContent: "flex-end" }}>
        <button type="submit" className="btn">
          {translate(language, "updateGoals")}
        </button>
      </div>
    </form>
  );
};

export default App;
