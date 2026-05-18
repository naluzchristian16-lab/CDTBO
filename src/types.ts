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

export type OrderStatus    = "pending" | "completed" | "voided";
export type OrderType      = "dine-in" | "pickup" | "delivery";
export type PaymentMethod  = "cash" | "gcash" | "card";

export interface Order {
  id: string;
  orderNumber: string;
  deviceId: string;
  items: CartItem[];
  orderType: OrderType;
  paymentMethod: PaymentMethod;   // NEW
  deliveryFee: number;
  discount: number;
  cash: number;
  total: number;
  status: OrderStatus;
  createdAt: number;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  stock: number;
  costPerUnit: number;
  lowStockThreshold: number;
}

export interface RecipeIngredient {
  ingredientId: string;
  qty: number;
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
  qtyAdded: number;
  costPerUnit: number;
  totalCost: number;
  date: string;         // "YYYY-MM-DD"
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

// ─── Analytics helpers (computed client-side, not stored) ─────────────────────

export interface DrinkStat {
  productId: string;
  name: string;
  qtySold: number;
  revenue: number;
  avgMargin: number;    // % gross margin if recipe exists
}

export interface DailyStat {
  date: string;         // "YYYY-MM-DD"
  revenue: number;
  cogs: number;
  expenses: number;
  netProfit: number;
  orderCount: number;
  cupsCount: number;
}
