import { useEffect, useState } from "react";
import {
  collection, addDoc, onSnapshot,
  query, orderBy, writeBatch, doc, increment,
} from "firebase/firestore";
import { db } from "../firebase";
import { RestockEntry, Ingredient } from "../types";

export function useRestock(ingredients: Ingredient[]) {
  const [entries, setEntries] = useState<RestockEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "restockLog"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, snap => {
      setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() } as RestockEntry)));
      setLoading(false);
    });
    return unsub;
  }, []);

  /**
   * Log a restock purchase.
   * - Writes a RestockEntry to /restockLog
   * - Increments /ingredients/{id}.stock by qtyAdded
   * - Updates /ingredients/{id}.costPerUnit using weighted average:
   *     newCost = (oldStock × oldCost + qtyAdded × newCost) / (oldStock + qtyAdded)
   *   This keeps COGS accurate even if supplier prices fluctuate.
   */
  const logRestock = async (entry: Omit<RestockEntry, "id" | "createdAt" | "totalCost">) => {
    const totalCost = entry.qtyAdded * entry.costPerUnit;
    const ingredient = ingredients.find(i => i.id === entry.ingredientId);
    if (!ingredient) throw new Error("Ingredient not found");

    const oldStock   = ingredient.stock;
    const oldCost    = ingredient.costPerUnit;
    const newStock   = oldStock + entry.qtyAdded;

    // Weighted average cost per unit
    const weightedCost = newStock > 0
      ? (oldStock * oldCost + entry.qtyAdded * entry.costPerUnit) / newStock
      : entry.costPerUnit;

    const batch = writeBatch(db);

    // 1. Add restock log entry
    const logRef = doc(collection(db, "restockLog"));
    batch.set(logRef, {
      ...entry,
      totalCost,
      createdAt: Date.now(),
    });

    // 2. Update ingredient stock + weighted average cost
    batch.update(doc(db, "ingredients", entry.ingredientId), {
      stock: increment(entry.qtyAdded),
      costPerUnit: parseFloat(weightedCost.toFixed(4)),
    });

    await batch.commit();
  };

  // ── Derived helpers ──────────────────────────────────────────────────────────

  const entriesForDate = (dateStr: string) =>
    entries.filter(e => e.date === dateStr);

  const totalSpentForDate = (dateStr: string) =>
    entriesForDate(dateStr).reduce((s, e) => s + e.totalCost, 0);

  const totalSpentForRange = (from: string, to: string) =>
    entries
      .filter(e => e.date >= from && e.date <= to)
      .reduce((s, e) => s + e.totalCost, 0);

  return {
    entries,
    loading,
    logRestock,
    entriesForDate,
    totalSpentForDate,
    totalSpentForRange,
  };
}
