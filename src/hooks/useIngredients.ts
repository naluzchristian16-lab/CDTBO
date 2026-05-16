import { useEffect, useState } from "react";
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, getDocs, writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import { Ingredient, Recipe, CartItem } from "../types";

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes]         = useState<Recipe[]>([]);
  const [loading, setLoading]         = useState(true);

  // ── Real-time listeners ──────────────────────────────────────────────────────

  useEffect(() => {
    const unsubI = onSnapshot(collection(db, "ingredients"), snap => {
      setIngredients(snap.docs.map(d => ({ id: d.id, ...d.data() } as Ingredient)));
      setLoading(false);
    });
    const unsubR = onSnapshot(collection(db, "recipes"), snap => {
      setRecipes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Recipe)));
    });
    return () => { unsubI(); unsubR(); };
  }, []);

  // ── Ingredient CRUD ──────────────────────────────────────────────────────────

  const addIngredient = (data: Omit<Ingredient, "id">) =>
    addDoc(collection(db, "ingredients"), data);

  const updateIngredient = (id: string, data: Partial<Ingredient>) =>
    updateDoc(doc(db, "ingredients", id), data);

  const deleteIngredient = (id: string) =>
    deleteDoc(doc(db, "ingredients", id));

  const adjustStock = (id: string, delta: number, currentStock: number) =>
    updateDoc(doc(db, "ingredients", id), { stock: currentStock + delta });

  // ── Recipe CRUD ──────────────────────────────────────────────────────────────

  const saveRecipe = async (recipe: Omit<Recipe, "id">) => {
    // Check if a recipe for this product already exists
    const snap = await getDocs(collection(db, "recipes"));
    const existing = snap.docs.find(d => d.data().productId === recipe.productId);
    if (existing) {
      return updateDoc(doc(db, "recipes", existing.id), recipe);
    }
    return addDoc(collection(db, "recipes"), recipe);
  };

  const getRecipeForProduct = (productId: string) =>
    recipes.find(r => r.productId === productId) ?? null;

  // ── Stock deduction on checkout ──────────────────────────────────────────────
  // Called by Cashier after a successful order is placed.
  // Uses a Firestore batch so all deductions are atomic.

  const deductStockForOrder = async (items: CartItem[]) => {
    const batch = writeBatch(db);

    for (const item of items) {
      // Each product may have a recipe; size suffix doesn't affect ingredients
      // so we strip size suffixes and try both the base id and size-specific id.
      const baseId = item.id;
      const recipe = getRecipeForProduct(baseId);
      if (!recipe) continue;

      for (const ri of recipe.ingredients) {
        const ingredient = ingredients.find(i => i.id === ri.ingredientId);
        if (!ingredient) continue;

        const totalQtyUsed = ri.qty * item.qty;
        const newStock     = Math.max(0, ingredient.stock - totalQtyUsed);

        batch.update(doc(db, "ingredients", ri.ingredientId), { stock: newStock });
      }
    }

    await batch.commit();
  };

  // ── Derived helpers ──────────────────────────────────────────────────────────

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
