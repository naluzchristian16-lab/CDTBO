/**
 * useIngredients.ts  (offline-first version)
 * -------------------------------------------
 * All reads come from IndexedDB (via Dexie live query).
 * All writes go through syncEngine.syncWrite() which:
 *   - Always writes to IndexedDB first (instant, offline-safe)
 *   - If online: also writes to Firebase immediately
 *   - If offline: queues write for later flush
 */

import { useLiveQuery }    from "dexie-react-hooks";
import { localDb }         from "../db/localDb";
import { syncWrite }       from "../db/syncEngine";
import { useOnlineStatus } from "./useOnlineStatus";
import { Ingredient, Recipe, CartItem } from "../types";
import { v4 as uuidv4 }    from "uuid";

export function useIngredients() {
  const isOnline = useOnlineStatus();

  // ── Live queries from IndexedDB — reactive, works offline ────────────────
  // undefined = Dexie still resolving; [] = resolved but empty
  const rawIngredients = useLiveQuery(
    () => localDb.ingredients.toArray(), []
  );

  const rawRecipes = useLiveQuery(
    () => localDb.recipes.toArray(), []
  );

  const ingredients: Ingredient[] = rawIngredients ?? [];
  const recipes: Recipe[]         = rawRecipes ?? [];

  // loading only while Dexie hasn't resolved yet — not when db is simply empty
  const loading = rawIngredients === undefined || rawRecipes === undefined;

  // ── Ingredient CRUD ───────────────────────────────────────────────────────

  const addIngredient = async (data: Omit<Ingredient, "id">) => {
    const id = uuidv4();
    await syncWrite({ col: "ingredients", docId: id, op: "set", payload: { id, ...data }, isOnline });
    return id;
  };

  const updateIngredient = async (id: string, data: Partial<Ingredient>) => {
    await syncWrite({ col: "ingredients", docId: id, op: "update", payload: data, isOnline });
  };

  const deleteIngredient = async (id: string) => {
    await syncWrite({ col: "ingredients", docId: id, op: "delete", isOnline });
  };

  const adjustStock = async (id: string, delta: number, currentStock: number) => {
    await syncWrite({
      col: "ingredients", docId: id, op: "update",
      payload: { stock: currentStock + delta },
      isOnline,
    });
  };

  // ── Recipe CRUD ───────────────────────────────────────────────────────────

  const saveRecipe = async (recipe: Omit<Recipe, "id">) => {
    const existing = await localDb.recipes
      .where("productId").equals(recipe.productId).first();

    if (existing) {
      await syncWrite({
        col: "recipes", docId: existing.id, op: "update",
        payload: recipe, isOnline,
      });
    } else {
      const id = uuidv4();
      await syncWrite({
        col: "recipes", docId: id, op: "set",
        payload: { id, ...recipe }, isOnline,
      });
    }
  };

  const getRecipeForProduct = (productId: string): Recipe | null =>
    recipes.find(r => r.productId === productId) ?? null;

  // ── Stock deduction on checkout ───────────────────────────────────────────

  const deductStockForOrder = async (items: CartItem[]) => {
    for (const item of items) {
      const recipe = getRecipeForProduct(item.id);
      if (!recipe) continue;

      for (const ri of recipe.ingredients) {
        const ingredient = ingredients.find(i => i.id === ri.ingredientId);
        if (!ingredient) continue;

        const totalQtyUsed = ri.qty * item.qty;
        const newStock     = Math.max(0, ingredient.stock - totalQtyUsed);

        await syncWrite({
          col: "ingredients", docId: ri.ingredientId, op: "update",
          payload: { stock: newStock },
          isOnline,
        });
      }
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const lowStockIngredients = ingredients.filter(
    i => i.stock <= i.lowStockThreshold
  );

  return {
    ingredients,
    recipes,
    loading,
    lowStockIngredients,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    adjustStock,
    saveRecipe,
    getRecipeForProduct,
    deductStockForOrder,
  };
}
