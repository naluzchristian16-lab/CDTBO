// ─── Product / Cart ───────────────────────────────────────────────────────────

export interface ProductSize {
  label: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  coffee: boolean;
  singleSize?: boolean;
  size?: ProductSize;
  sizes?: ProductSize[];
}

export interface CartItem extends Product {
  qty: number;
  sizeType: string;
  price: number;
  addons: string[];
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus   = "pending" | "completed" | "voided";
export type OrderType     = "dine-in" | "pickup" | "delivery";
export type PaymentMethod = "cash" | "gcash" | "card";

export interface Order {
  id: string;
  orderNumber: string;
  deviceId: string;
  items: CartItem[];
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  deliveryFee: number;
  discount: number;
  cash: number;
  total: number;
  status: OrderStatus;
  createdAt: number;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

/**
 * How bulk-purchase conversion works:
 *
 * Two-level example (Emborg Milk):
 *   purchaseUnitName = "Case"
 *   purchaseUnitQty  = 12          ← 12 cartons per case
 *   subUnitName      = "Carton"
 *   subUnitQty       = 1000        ← 1000 ml per carton
 *   unit             = "ml"        ← the usage unit (used in recipes)
 *   purchasePrice    = ₱2,400      ← price per case
 *
 *   costPerUnit (ml) = 2400 ÷ 12 ÷ 1000 = ₱0.20 per ml   ✓
 *
 * One-level example (Strawberry Jam):
 *   purchaseUnitName = "Jar"
 *   purchaseUnitQty  = 1           ← 1 jar (no sub-unit)
 *   subUnitName      = ""          ← leave blank
 *   subUnitQty       = 3500        ← 3500 g per jar
 *   unit             = "g"
 *   purchasePrice    = ₱350
 *
 *   costPerUnit (g) = 350 ÷ 1 ÷ 3500 = ₱0.10 per g        ✓
 *
 * Simple example (no conversion needed, e.g. cups):
 *   purchaseUnitName = "Pack"
 *   purchaseUnitQty  = 100         ← 100 pcs per pack
 *   subUnitName      = ""
 *   subUnitQty       = 1           ← 1 pc per piece (identity)
 *   unit             = "pcs"
 *   purchasePrice    = ₱50
 *
 *   costPerUnit (pcs) = 50 ÷ 100 ÷ 1 = ₱0.50 per pcs      ✓
 *
 * costPerUnit is always derived and stored so hooks/recipes
 * never need to know about the purchase structure.
 */
export interface Ingredient {
  id: string;
  name: string;

  // ── Usage unit (what recipes use) ──────────────────────────────────────────
  unit: string;             // "ml" | "g" | "pcs" | "tbsp" | etc.
  stock: number;            // current stock in usage units
  costPerUnit: number;      // ₱ per usage unit — auto-computed from purchase info
  lowStockThreshold: number;

  // ── Purchase / bulk info ───────────────────────────────────────────────────
  purchaseUnitName: string; // e.g. "Case", "Jar", "Pack", "Box"
  purchaseUnitQty: number;  // how many sub-units (or usage units) per purchase unit
                            // e.g. 12 (cartons per case), 1 (jar is already the top)
  subUnitName: string;      // e.g. "Carton", "Bottle" — leave "" if only one level
  subUnitQty: number;       // how many usage units per sub-unit
                            // e.g. 1000 ml per carton, 3500 g per jar
                            // If no sub-unit, set this to the total usage units per purchase unit
  purchasePrice: number;    // price paid per purchase unit (used to recompute costPerUnit)
}

// ─── Recipes ──────────────────────────────────────────────────────────────────

export interface RecipeIngredient {
  ingredientId: string;
  qty: number;              // in usage units (ml, g, pcs…)
}

export interface Recipe {
  id: string;
  productId: string;
  ingredients: RecipeIngredient[];
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  notes: string;
}

// ─── Restock Log ──────────────────────────────────────────────────────────────

export interface RestockEntry {
  id: string;
  ingredientId: string;
  supplierId: string;
  qtyAdded: number;         // in usage units (already converted)
  purchaseUnitsAdded: number; // e.g. "2 cases" — for the log display
  costPerUnit: number;      // price per usage unit at time of purchase
  totalCost: number;
  date: string;
  notes: string;
  createdAt: number;
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  createdAt: number;
}

// ─── Cash Reconciliation ──────────────────────────────────────────────────────

export interface CashReconciliation {
  id: string;
  date: string;
  expectedCash: number;
  actualCash: number;
  difference: number;
  notes: string;
  submittedBy: string;
  createdAt: number;
}

// ─── Analytics helpers (computed client-side) ─────────────────────────────────

export interface DrinkStat {
  productId: string;
  name: string;
  qtySold: number;
  revenue: number;
  avgMargin: number;
}

export interface DailyStat {
  date: string;
  revenue: number;
  cogs: number;
  expenses: number;
  netProfit: number;
  orderCount: number;
  cupsCount: number;
}

// ─── Unit conversion helper (pure function, importable anywhere) ──────────────

/**
 * Compute cost per usage unit from bulk purchase info.
 *
 * @param purchasePrice  - price paid per purchase unit (e.g. ₱2400 per case)
 * @param purchaseUnitQty - sub-units per purchase unit (e.g. 12 cartons)
 * @param subUnitQty     - usage units per sub-unit (e.g. 1000 ml per carton)
 *                         pass 1 if there is no sub-unit level
 * @returns cost per single usage unit
 */
export function computeCostPerUnit(
  purchasePrice: number,
  purchaseUnitQty: number,
  subUnitQty: number
): number {
  const totalUsageUnits = purchaseUnitQty * subUnitQty;
  if (!totalUsageUnits) return 0;
  return purchasePrice / totalUsageUnits;
}

/**
 * Compute how many usage units are added when purchasing N purchase units.
 */
export function purchaseUnitsToUsageUnits(
  purchaseUnitsAdded: number,
  purchaseUnitQty: number,
  subUnitQty: number
): number {
  return purchaseUnitsAdded * purchaseUnitQty * subUnitQty;
}
