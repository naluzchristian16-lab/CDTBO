/**
 * useProducts.ts
 * --------------
 * Manages the dynamic product catalog stored in IndexedDB (+ synced to Firebase).
 * On first load, seeds from the static products.ts file so existing menus work.
 */

import { useLiveQuery } from "dexie-react-hooks";
import { localDb } from "../db/localDb";
import { syncWrite } from "../db/syncEngine";
import { useOnlineStatus } from "./useOnlineStatus";
import { Product } from "../types";
import { products as SEED_PRODUCTS, categories as SEED_CATEGORIES } from "../data/products";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useRef } from "react";

export interface CategoryRow {
  id: string;
  name: string;
  sortOrder: number;
}

export function useProducts() {
  const isOnline = useOnlineStatus();
  const seededRef = useRef(false);

  const rawProducts = useLiveQuery(
    () => localDb.products.orderBy("name").toArray(),
    []
  );

  const rawCategories = useLiveQuery(
    () => localDb.categories.orderBy("sortOrder").toArray(),
    []
  );

  useEffect(() => {
    if (rawProducts === undefined) return;
    if (rawProducts.length > 0) return;
    if (seededRef.current) return;

    seededRef.current = true;

    (async () => {
      const cats = SEED_CATEGORIES.filter(c => c !== "All Products");

      const catCount = await localDb.categories.count();

      if (catCount === 0) {
        await localDb.categories.bulkPut(
          cats.map((name, i) => ({
            id: uuidv4(),
            name,
            sortOrder: i,
          }))
        );
      }

      await localDb.products.bulkPut(SEED_PRODUCTS);
    })();

    return () => {
      seededRef.current = false;
    };
  }, [rawProducts]);

  const products: Product[] = rawProducts ?? [];
  const catRows: CategoryRow[] = rawCategories ?? [];
  const categories: string[] = ["All Products", ...catRows.map(c => c.name)];
  const loading = rawProducts === undefined || rawCategories === undefined;

  const addProduct = async (p: Omit<Product, "id">) => {
    const id = uuidv4();
    const product: Product = { ...p, id };

    await syncWrite({
      col: "products",
      docId: id,
      op: "set",
      payload: product,
      isOnline,
    });

    return id;
  };

  const updateProduct = async (id: string, changes: Partial<Product>) => {
    await syncWrite({
      col: "products",
      docId: id,
      op: "update",
      payload: changes,
      isOnline,
    });
  };

  const deleteProduct = async (id: string) => {
    await syncWrite({
      col: "products",
      docId: id,
      op: "delete",
      isOnline,
    });
  };

  const addCategory = async (name: string) => {
    const id = uuidv4();
    const sortOrder = catRows.length;

    const cat = { id, name, sortOrder };

    await syncWrite({
      col: "categories",
      docId: id,
      op: "set",
      payload: cat,
      isOnline,
    });

    return id;
  };

  const deleteCategory = async (id: string) => {
    await syncWrite({
      col: "categories",
      docId: id,
      op: "delete",
      isOnline,
    });
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
