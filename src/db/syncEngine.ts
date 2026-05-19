/**
 * syncEngine.ts
 * -------------
 * The bridge between IndexedDB (local) and Firebase (cloud).
 *
 * HOW IT WORKS
 * ──────────────────────────────────────────────────────────────────
 *  1. INITIAL LOAD  — pulls all Firestore collections into IndexedDB
 *                     (once per session, or on manual sync)
 *  2. WRITE         — always writes to IndexedDB first.
 *                     If online  → also writes to Firebase immediately.
 *                     If offline → enqueues in pendingWrites table.
 *  3. FLUSH         — called automatically when online status changes
 *                     to true (and by manual sync button).
 *                     Replays pendingWrites to Firebase in order.
 *  4. REAL-TIME     — onSnapshot listeners keep IndexedDB in sync
 *                     while online (writes from other devices land here).
 * ──────────────────────────────────────────────────────────────────
 */

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";

import { db as firestore } from "../firebase";
import {
  localDb,
  enqueuePendingWrite,
  removePendingWrite,
  getAllPendingWrites,
  setLastSyncedAt,
  PendingWrite,
} from "./localDb";

import { Dexie } from "dexie";

type CollectionName =
  | "orders"
  | "ingredients"
  | "recipes"
  | "expenses"
  | "restockLog"
  | "suppliers"
  | "cashReconciliations"
  | "products"
  | "categories";

function getTable(col: CollectionName) {
  const map = {
    orders: localDb.orders,
    ingredients: localDb.ingredients,
    recipes: localDb.recipes,
    expenses: localDb.expenses,
    restockLog: localDb.restockLog,
    suppliers: localDb.suppliers,
    cashReconciliations: localDb.cashReconciliations,
    products: localDb.products,
    categories: localDb.categories,
  } as const;

  return map[col];
}

let _unsubscribers: Unsubscribe[] = [];

const AUTHORITATIVE_COLLECTIONS: CollectionName[] = [
  "orders",
  "ingredients",
  "recipes",
  "expenses",
  "restockLog",
  "suppliers",
  "cashReconciliations",
];

const PRESERVE_IF_EMPTY_COLLECTIONS: CollectionName[] = [
  "products",
  "categories",
];

const ALL_COLLECTIONS: CollectionName[] = [
  ...AUTHORITATIVE_COLLECTIONS,
  ...PRESERVE_IF_EMPTY_COLLECTIONS,
];

export async function pullFromFirebase(): Promise<void> {
  await Promise.all(
    ALL_COLLECTIONS.map(async (col) => {
      const snap = await getDocs(collection(firestore, col));
      const table = getTable(col);

      const isPreserve = PRESERVE_IF_EMPTY_COLLECTIONS.includes(col);

      if (isPreserve && snap.empty) return;

      await localDb.transaction("rw", table as Dexie.Table, async () => {
        await (table as Dexie.Table).clear();

        if (!snap.empty) {
          await (table as Dexie.Table).bulkPut(
            snap.docs.map((d) => ({ id: d.id, ...d.data() }))
          );
        }
      });
    })
  );

  await setLastSyncedAt(new Date().toISOString());
}

export function startRealtimeListeners(): void {
  stopRealtimeListeners();

  _unsubscribers = ALL_COLLECTIONS.map((col) => {
    const table = getTable(col);

    return onSnapshot(collection(firestore, col), (snap) => {
      snap.docChanges().forEach((change) => {
        const data = { id: change.doc.id, ...change.doc.data() };

        if (change.type === "added" || change.type === "modified") {
          (table as Dexie.Table).put(data);
        } else if (change.type === "removed") {
          (table as Dexie.Table).delete(change.doc.id);
        }
      });
    });
  });
}

export function stopRealtimeListeners(): void {
  _unsubscribers.forEach((u) => u());
  _unsubscribers = [];
}

interface WriteArgs {
  col: CollectionName;
  docId: string;
  op: PendingWrite["op"];
  payload?: object;
  isOnline: boolean;
}

export async function syncWrite({
  col,
  docId,
  op,
  payload,
  isOnline,
}: WriteArgs) {
  const table = getTable(col);

  if (op === "set" || op === "update") {
    await (table as Dexie.Table).put({ id: docId, ...payload });
  } else if (op === "delete") {
    await (table as Dexie.Table).delete(docId);
  }

  if (isOnline) {
    try {
      const ref = doc(firestore, col, docId);

      if (op === "set") await setDoc(ref, payload!);
      if (op === "update")
        await updateDoc(ref, payload as Record<string, unknown>);
      if (op === "delete") await deleteDoc(ref);
    } catch (err) {
      console.warn("[syncEngine] Firebase write failed, queuing:", err);

      await enqueuePendingWrite({
        collection: col,
        docId,
        op,
        payload,
        createdAt: Date.now(),
      });
    }
  } else {
    await enqueuePendingWrite({
      collection: col,
      docId,
      op,
      payload,
      createdAt: Date.now(),
    });
  }
}

export async function flushPendingWrites(): Promise<{
  flushed: number;
  failed: number;
}> {
  const queue = await getAllPendingWrites();

  let flushed = 0;
  let failed = 0;

  for (const write of queue) {
    try {
      const ref = doc(firestore, write.collection, write.docId);

      if (write.op === "set") await setDoc(ref, write.payload!);
      if (write.op === "update")
        await updateDoc(ref, write.payload as Record<string, unknown>);
      if (write.op === "delete") await deleteDoc(ref);

      await removePendingWrite(write.id!);
      flushed++;
    } catch (err) {
      console.error("[syncEngine] Failed to flush write:", err);
      failed++;
      break;
    }
  }

  if (flushed > 0) {
    await setLastSyncedAt(new Date().toISOString());
  }

  return { flushed, failed };
}

