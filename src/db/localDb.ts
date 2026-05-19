/**
 * localDb.ts
 * ----------
 * Local IndexedDB database powered by Dexie.
 * All reads/writes in the app go here first — Firebase is synced
 * on top. This means every tab works fully offline.
 *
 * Install: npm install dexie
 */

import Dexie, { Table } from "dexie";
import {
  Order, Ingredient, Recipe, Expense,
  RestockEntry, Supplier, CashReconciliation,
} from "../types";

// ── Pending write: one queued Firebase operation ──────────────────────────────

export type WriteOp = "set" | "update" | "delete";

export interface PendingWrite {
  id?:         number;          // Dexie auto-increment key
  collection:  string;          // Firestore collection, e.g. "orders"
  docId:       string;          // Firestore document ID
  op:          WriteOp;
  payload?:    object;          // data for set/update (undefined for delete)
  createdAt:   number;          // timestamp — flush in order
}

// ── Database class ────────────────────────────────────────────────────────────

class BrewPosDb extends Dexie {
  orders!:             Table<Order>;
  ingredients!:        Table<Ingredient>;
  recipes!:            Table<Recipe>;
  expenses!:           Table<Expense>;
  restockLog!:         Table<RestockEntry>;
  suppliers!:          Table<Supplier>;
  cashReconciliations!:Table<CashReconciliation>;
  pendingWrites!:      Table<PendingWrite>;
  meta!:               Table<{ key: string; value: string }>;  // e.g. lastSyncedAt

  constructor() {
    super("BrewPosDb");

    this.version(1).stores({
      // Firestore id field is the primary key for every collection table
      orders:              "id, status, createdAt, deviceId",
      ingredients:         "id, name",
      recipes:             "id, productId",
      expenses:            "id, date, category, createdAt",   // ← added createdAt
      restockLog:          "id, ingredientId, date, createdAt",
      suppliers:           "id, name",
      cashReconciliations: "id, date",

      // Sync queue — auto-increment id, indexed by createdAt for ordered flush
      pendingWrites:       "++id, collection, docId, createdAt",

      // Generic key-value store for metadata
      meta:                "key",
    });

    // ── Version 2: adds createdAt index to expenses ───────────────────────────
    // Required for useExpenses → localDb.expenses.orderBy("createdAt")
    this.version(2).stores({
      orders:              "id, status, createdAt, deviceId",
      ingredients:         "id, name",
      recipes:             "id, productId",
      expenses:            "id, date, category, createdAt",   // ← createdAt indexed
      restockLog:          "id, ingredientId, date, createdAt",
      suppliers:           "id, name",
      cashReconciliations: "id, date",
      pendingWrites:       "++id, collection, docId, createdAt",
      meta:                "key",
    });
  }
}

export const localDb = new BrewPosDb();

// ── Meta helpers ──────────────────────────────────────────────────────────────

export async function getLastSyncedAt(): Promise<string | null> {
  const row = await localDb.meta.get("lastSyncedAt");
  return row?.value ?? null;
}

export async function setLastSyncedAt(iso: string) {
  await localDb.meta.put({ key: "lastSyncedAt", value: iso });
}

// ── Pending write helpers ─────────────────────────────────────────────────────

/**
 * Enqueue a write for later Firebase sync.
 * Called by syncEngine.write() when offline.
 */
export async function enqueuePendingWrite(write: Omit<PendingWrite, "id">) {
  await localDb.pendingWrites.add(write);
}

/**
 * Remove a pending write after it has been successfully synced.
 */
export async function removePendingWrite(id: number) {
  await localDb.pendingWrites.delete(id);
}

/**
 * Get all pending writes, oldest first.
 */
export async function getAllPendingWrites(): Promise<PendingWrite[]> {
  return localDb.pendingWrites.orderBy("createdAt").toArray();
}
