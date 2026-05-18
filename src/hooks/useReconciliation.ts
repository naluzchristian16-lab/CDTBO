import { useEffect, useState } from "react";
import {
  collection, addDoc, onSnapshot,
  query, orderBy, where,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { CashReconciliation, Order } from "../types";

export function useReconciliation(completedOrders: Order[]) {
  const [records, setRecords] = useState<CashReconciliation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "cashReconciliation"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() } as CashReconciliation)));
      setLoading(false);
    });
    return unsub;
  }, []);

  /**
   * Compute expected cash for a given date from completed cash orders.
   * This is what *should* be in the drawer.
   */
  const getExpectedCash = (dateStr: string): number =>
    completedOrders
      .filter(o =>
        o.paymentMethod === "cash" &&
        new Date(o.createdAt).toISOString().slice(0, 10) === dateStr
      )
      .reduce((s, o) => s + o.total, 0);

  /**
   * Check if a reconciliation has already been submitted for a date.
   */
  const getRecordForDate = (dateStr: string) =>
    records.find(r => r.date === dateStr) ?? null;

  /**
   * Submit a cash count for a date.
   * Computes difference = actualCash - expectedCash.
   * Negative = cash is short. Positive = overage (rare but possible).
   */
  const submitReconciliation = async (
    dateStr: string,
    actualCash: number,
    notes: string
  ) => {
    const expectedCash = getExpectedCash(dateStr);
    const difference   = actualCash - expectedCash;

    await addDoc(collection(db, "cashReconciliation"), {
      date: dateStr,
      expectedCash,
      actualCash,
      difference,
      notes,
      submittedBy: auth.currentUser?.email ?? "unknown",
      createdAt: Date.now(),
    } as Omit<CashReconciliation, "id">);
  };

  return {
    records,
    loading,
    getExpectedCash,
    getRecordForDate,
    submitReconciliation,
  };
}
