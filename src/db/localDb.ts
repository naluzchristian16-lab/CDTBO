import Dexie, { Table } from "dexie";
import {
  Order, Ingredient, Recipe, Expense,
  RestockEntry, Supplier, CashReconciliation, Product,
} from "../types";

export type WriteOp = "set" | "update" | "delete";

export interface PendingWrite {
  id?:         number;
  collection:  string;
  docId:       string;
  op:          WriteOp;
  payload?:    object;
  createdAt:   number;
}

class BrewPosDb extends Dexie {
  orders!:             Table<Order>;
  ingredients!:        Table<Ingredient>;
  recipes!:            Table<Recipe>;
  expenses!:           Table<Expense>;
  restockLog!:         Table<RestockEntry>;
  suppliers!:          Table<Supplier>;
  cashReconciliations!:Table<CashReconciliation>;
  pendingWrites!:      Table<PendingWrite>;
  meta!:               Table<{ key: string; value: string }>;
  // NEW: dynamic product catalog
  products!:           Table<Product>;
  categories!:         Table<{ id: string; name: string; sortOrder: number }>;

  constructor() {
    super("BrewPosDb");

    this.version(1).stores({
      orders:              "id, status, createdAt, deviceId",
      ingredients:         "id, name",
      recipes:             "id, productId",
      expenses:            "id, date, category, createdAt",
      restockLog:          "id, ingredientId, date, createdAt",
      suppliers:           "id, name",
      cashReconciliations: "id, date",
      pendingWrites:       "++id, collection, docId, createdAt",
      meta:                "key",
    });

    this.version(2).stores({
      orders:              "id, status, createdAt, deviceId",
      ingredients:         "id, name",
      recipes:             "id, productId",
      expenses:            "id, date, category, createdAt",
      restockLog:          "id, ingredientId, date, createdAt",
      suppliers:           "id, name",
      cashReconciliations: "id, date",
      pendingWrites:       "++id, collection, docId, createdAt",
      meta:                "key",
    });

    // Version 3: adds dynamic product & category tables
    this.version(3).stores({
      orders:              "id, status, createdAt, deviceId",
      ingredients:         "id, name",
      recipes:             "id, productId",
      expenses:            "id, date, category, createdAt",
      restockLog:          "id, ingredientId, date, createdAt",
      suppliers:           "id, name",
      cashReconciliations: "id, date",
      pendingWrites:       "++id, collection, docId, createdAt",
      meta:                "key",
      products:            "id, name, category",
      categories:          "id, name, sortOrder",
    });
  }
}

export const localDb = new BrewPosDb();

export async function getLastSyncedAt(): Promise<string | null> {
  const row = await localDb.meta.get("lastSyncedAt");
  return row?.value ?? null;
}

export async function setLastSyncedAt(iso: string) {
  await localDb.meta.put({ key: "lastSyncedAt", value: iso });
}

export async function enqueuePendingWrite(write: Omit<PendingWrite, "id">) {
  await localDb.pendingWrites.add(write);
}

export async function removePendingWrite(id: number) {
  await localDb.pendingWrites.delete(id);
}

export async function getAllPendingWrites(): Promise<PendingWrite[]> {
  return localDb.pendingWrites.orderBy("createdAt").toArray();
}
