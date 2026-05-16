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
  size?: ProductSize;       // used when singleSize = true
  sizes?: ProductSize[];    // used when singleSize = false
}

export interface CartItem extends Product {
  qty: number;
  sizeType: string;
  price: number;
  addons: string[];
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus = "pending" | "completed";
export type OrderType   = "dine-in" | "pickup" | "delivery";

export interface Order {
  id: string;
  orderNumber: string;
  deviceId: string;
  items: CartItem[];
  orderType: OrderType;
  deliveryFee: number;
  discount: number;
  cash: number;
  total: number;
  status: OrderStatus;
  createdAt: number;        // Unix ms timestamp
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export interface Ingredient {
  id: string;
  name: string;
  unit: string;             // e.g. "ml", "g", "pcs"
  stock: number;            // current stock in that unit
  costPerUnit: number;      // ₱ per unit — used to compute COGS
  lowStockThreshold: number;// alert when stock drops below this
}

// ─── Recipes ──────────────────────────────────────────────────────────────────

export interface RecipeIngredient {
  ingredientId: string;
  qty: number;              // how many units consumed per 1 drink
}

export interface Recipe {
  id: string;               // same as Product.id
  productId: string;
  ingredients: RecipeIngredient[];
}

// ─── Expenses ─────────────────────────────────────────────────────────────────

export interface Expense {
  id: string;
  date: string;             // "YYYY-MM-DD"
  category: string;         // "Fuel" | "Food Allowance" | "Supplies" | "Other"
  description: string;
  amount: number;
  createdAt: number;
}
