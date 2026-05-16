import { useEffect, useState } from "react";
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, query, orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { Expense } from "../types";

export const EXPENSE_CATEGORIES = [
  "Fuel",
  "Food Allowance",
  "Supplies",
  "Utilities",
  "Maintenance",
  "Other",
] as const;

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const q = query(collection(db, "expenses"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setExpenses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Expense)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const addExpense = (data: Omit<Expense, "id" | "createdAt">) =>
    addDoc(collection(db, "expenses"), { ...data, createdAt: Date.now() });

  const updateExpense = (id: string, data: Partial<Expense>) =>
    updateDoc(doc(db, "expenses", id), data);

  const deleteExpense = (id: string) =>
    deleteDoc(doc(db, "expenses", id));

  // ── Derived ──────────────────────────────────────────────────────────────────

  const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

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
