import { useLiveQuery }    from "dexie-react-hooks";
import { localDb }         from "../db/localDb";
import { syncWrite }       from "../db/syncEngine";
import { useOnlineStatus } from "./useOnlineStatus";
import { Expense }         from "../types";
import { v4 as uuidv4 }    from "uuid";

export const EXPENSE_CATEGORIES = [
  "Fuel",
  "Food Allowance",
  "Supplies",
  "Utilities",
  "Maintenance",
  "Other",
] as const;

export function useExpenses() {
  const isOnline = useOnlineStatus();

  // ── Live query from IndexedDB — works offline ─────────────────────────────
  const expenses: Expense[] = useLiveQuery(
    () => localDb.expenses.orderBy("createdAt").reverse().toArray(), [], []
  ) ?? [];

  const loading = expenses.length === 0;

  // ── Write ops ─────────────────────────────────────────────────────────────

  const addExpense = async (data: Omit<Expense, "id" | "createdAt">) => {
    const id      = uuidv4();
    const expense: Expense = { id, ...data, createdAt: Date.now() };
    await syncWrite({ col: "expenses", docId: id, op: "set", payload: expense, isOnline });
    return id;
  };

  const updateExpense = async (id: string, data: Partial<Expense>) =>
    syncWrite({ col: "expenses", docId: id, op: "update", payload: data, isOnline });

  const deleteExpense = async (id: string) =>
    syncWrite({ col: "expenses", docId: id, op: "delete", isOnline });

  // ── Derived ───────────────────────────────────────────────────────────────

  const todayStr = new Date().toISOString().slice(0, 10);

  const todayExpenses = expenses.filter(e => e.date === todayStr);

  const todayExpenseTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const expensesForDate = (dateStr: string) =>
    expenses.filter(e => e.date === dateStr);

  const expenseTotalForDate = (dateStr: string) =>
    expensesForDate(dateStr).reduce((sum, e) => sum + e.amount, 0);

  return {
    expenses,
    loading,
    todayExpenses,
    todayExpenseTotal,
    expensesForDate,
    expenseTotalForDate,
    addExpense,
    updateExpense,
    deleteExpense,
  };
}
