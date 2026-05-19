/**
 * useProducts.ts
 * --------------
 * Manages the dynamic product catalog stored in IndexedDB (+ synced to Firebase).
 * On first load, seeds from the static products.ts file so existing menus work.
 */

import { useLiveQuery } from "dexie-react-hooks";
import { localDb }      from "../db/localDb";
import { syncWrite }    from "../db/syncEngine";
import { useOnlineStatus } from "./useOnlineStatus";
import { Product }      from "../types";
import { products as SEED_PRODUCTS, categories as SEED_CATEGORIES } from "../data/products";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useRef } from "react";

export interface CategoryRow {
  id:        string;
  name:      string;
  sortOrder: number;
}

export function useProducts() {
  const isOnline   = useOnlineStatus();
  const seededRef  = useRef(false);

  // Live queries
  const rawProducts   = useLiveQuery(() => localDb.products.orderBy("name").toArray(),   []);
  const rawCategories = useLiveQuery(() => localDb.categories.orderBy("sortOrder").toArray(), []);

  // Seed once: if no products in DB, load from static file
  useEffect(() => {
    if (seededRef.current) return;
    if (rawProducts === undefined || rawCategories === undefined) return; // still loading
    seededRef.current = true;

    if (rawProducts.length === 0) {
      (async () => {
        // Seed categories (skip "All Products" — it's a UI-only filter)
        const cats = SEED_CATEGORIES.filter(c => c !== "All Products");
        await localDb.categories.bulkPut(
          cats.map((name, i) => ({ id: uuidv4(), name, sortOrder: i }))
        );

        // Seed products
        await localDb.products.bulkPut(SEED_PRODUCTS);
      })();
    }
  }, [rawProducts, rawCategories]);

  const products:   Product[]     = rawProducts   ?? [];
  const catRows:    CategoryRow[] = rawCategories ?? [];
  const categories: string[]      = ["All Products", ...catRows.map(c => c.name)];
  const loading = rawProducts === undefined || rawCategories === undefined;

  // ── Product CRUD ─────────────────────────────────────────────────────────────

  const addProduct = async (p: Omit<Product, "id">) => {
    const id = uuidv4();
    const product: Product = { ...p, id };
    await syncWrite({ col: "products" as any, docId: id, op: "set", payload: product, isOnline });
    return id;
  };

  const updateProduct = async (id: string, changes: Partial<Product>) => {
    await syncWrite({ col: "products" as any, docId: id, op: "update", payload: changes, isOnline });
  };

  const deleteProduct = async (id: string) => {
    await syncWrite({ col: "products" as any, docId: id, op: "delete", isOnline });
  };

  // ── Category CRUD ────────────────────────────────────────────────────────────

  const addCategory = async (name: string) => {
    const id        = uuidv4();
    const sortOrder = catRows.length;
    const cat       = { id, name, sortOrder };
    await syncWrite({ col: "categories" as any, docId: id, op: "set", payload: cat, isOnline });
    return id;
  };

  const deleteCategory = async (id: string) => {
    await syncWrite({ col: "categories" as any, docId: id, op: "delete", isOnline });
  };

  return {
    products,
    categories,
    catRows,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
  };
}
