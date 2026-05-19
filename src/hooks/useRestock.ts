import { useLiveQuery }    from "dexie-react-hooks";
import { localDb }         from "../db/localDb";
import { syncWrite }       from "../db/syncEngine";
import { useOnlineStatus } from "./useOnlineStatus";
import { RestockEntry, Ingredient } from "../types";
import { v4 as uuidv4 }    from "uuid";

export function useRestock(ingredients: Ingredient[]) {
  const isOnline = useOnlineStatus();

  // ── Live query from IndexedDB — works offline ─────────────────────────────
  const entries: RestockEntry[] = useLiveQuery(
    () => localDb.restockLog.orderBy("createdAt").reverse().toArray(), [], []
  ) ?? [];

  const loading = entries.length === 0;

  // ── logRestock ────────────────────────────────────────────────────────────
  // Two writes in one call:
  //   1. RestockEntry → restockLog
  //   2. Ingredient stock + weighted-average costPerUnit → ingredients
  // Both go through syncWrite so they're queued offline correctly.

  const logRestock = async (
    entry: Omit<RestockEntry, "id" | "createdAt" | "totalCost">
  ) => {
    const ingredient = ingredients.find(i => i.id === entry.ingredientId);
    if (!ingredient) throw new Error("Ingredient not found");

    const totalCost    = entry.qtyAdded * entry.costPerUnit;
    const oldStock     = ingredient.stock;
    const oldCost      = ingredient.costPerUnit;
    const newStock     = oldStock + entry.qtyAdded;

    // Weighted average cost per unit
    const weightedCost = newStock > 0
      ? (oldStock * oldCost + entry.qtyAdded * entry.costPerUnit) / newStock
      : entry.costPerUnit;

    // 1. Log the restock entry
    const logId = uuidv4();
    const restockDoc: RestockEntry = {
      id: logId,
      ...entry,
      totalCost,
      createdAt: Date.now(),
    };
    await syncWrite({
      col: "restockLog", docId: logId, op: "set",
      payload: restockDoc, isOnline,
    });

    // 2. Update ingredient stock + weighted cost
    await syncWrite({
      col: "ingredients", docId: entry.ingredientId, op: "update",
      payload: {
        stock:       newStock,
        costPerUnit: parseFloat(weightedCost.toFixed(4)),
      },
      isOnline,
    });
  };

  // ── Derived helpers ───────────────────────────────────────────────────────

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
