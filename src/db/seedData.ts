/**
 * seedData.ts
 * -----------
 * Initializes IndexedDB with sample ingredients, suppliers, and recipes
 * on first app load. This ensures the admin page isn't blank when empty.
 */

import { localDb } from "./localDb";
import { Ingredient, Recipe, Supplier } from "../types";

export async function seedInitialData() {
  try {
    // Check if data already exists
    const ingredientCount = await localDb.ingredients.count();
    
    if (ingredientCount > 0) {
      console.log("✅ Database already seeded, skipping initialization");
      return; // Already has data
    }

    console.log("📦 Seeding initial data...");

    // Sample suppliers
    const suppliers: Supplier[] = [
      {
        id: "supplier-coffee-ph",
        name: "Local Coffee Distributor",
        contactPerson: "Maria Santos",
        phone: "+63 917 123 4567",
        email: "maria@coffeedistributor.ph",
      },
      {
        id: "supplier-dairy-ph",
        name: "Premium Milk & Cream Co",
        contactPerson: "Juan Dela Cruz",
        phone: "+63 917 234 5678",
        email: "juan@dairyph.com",
      },
      {
        id: "supplier-supplies-ph",
        name: "Cafe Supplies Manila",
        contactPerson: "Rosa Garcia",
        phone: "+63 917 345 6789",
        email: "rosa@cafesupplies.ph",
      },
    ];

    // Sample ingredients
    const ingredients: Ingredient[] = [
      {
        id: "ing-arabica-beans",
        name: "Arabica Coffee Beans",
        unit: "kg",
        stock: 15,
        cost: 350,
        lowStockThreshold: 3,
        supplier: "supplier-coffee-ph",
        lastRestockDate: new Date().toISOString().split('T')[0],
      },
      {
        id: "ing-robusta-beans",
        name: "Robusta Coffee Beans",
        unit: "kg",
        stock: 10,
        cost: 250,
        lowStockThreshold: 2,
        supplier: "supplier-coffee-ph",
        lastRestockDate: new Date().toISOString().split('T')[0],
      },
      {
        id: "ing-whole-milk",
        name: "Whole Milk",
        unit: "L",
        stock: 25,
        cost: 65,
        lowStockThreshold: 5,
        supplier: "supplier-dairy-ph",
        lastRestockDate: new Date().toISOString().split('T')[0],
      },
      {
        id: "ing-skim-milk",
        name: "Skim Milk",
        unit: "L",
        stock: 15,
        cost: 55,
        lowStockThreshold: 3,
        supplier: "supplier-dairy-ph",
        lastRestockDate: new Date().toISOString().split('T')[0],
      },
      {
        id: "ing-sugar",
        name: "White Sugar",
        unit: "kg",
        stock: 8,
        cost: 45,
        lowStockThreshold: 2,
        supplier: "supplier-supplies-ph",
        lastRestockDate: new Date().toISOString().split('T')[0],
      },
      {
        id: "ing-brown-sugar",
        name: "Brown Sugar",
        unit: "kg",
        stock: 5,
        cost: 55,
        lowStockThreshold: 1,
        supplier: "supplier-supplies-ph",
        lastRestockDate: new Date().toISOString().split('T')[0],
      },
      {
        id: "ing-vanilla",
        name: "Vanilla Syrup",
        unit: "bottle",
        stock: 12,
        cost: 120,
        lowStockThreshold: 2,
        supplier: "supplier-supplies-ph",
        lastRestockDate: new Date().toISOString().split('T')[0],
      },
      {
        id: "ing-caramel",
        name: "Caramel Syrup",
        unit: "bottle",
        stock: 10,
        cost: 130,
        lowStockThreshold: 2,
        supplier: "supplier-supplies-ph",
        lastRestockDate: new Date().toISOString().split('T')[0],
      },
      {
        id: "ing-hazelnut",
        name: "Hazelnut Syrup",
        unit: "bottle",
        stock: 8,
        cost: 140,
        lowStockThreshold: 1,
        supplier: "supplier-supplies-ph",
        lastRestockDate: new Date().toISOString().split('T')[0],
      },
      {
        id: "ing-whipped-cream",
        name: "Whipped Cream",
        unit: "can",
        stock: 20,
        cost: 95,
        lowStockThreshold: 5,
        supplier: "supplier-dairy-ph",
        lastRestockDate: new Date().toISOString().split('T')[0],
      },
    ];

    // Sample recipes (assuming you have these product IDs in your products.ts)
    const recipes: Recipe[] = [
      {
        id: "recipe-americano",
        productId: "americano",
        name: "Americano",
        ingredients: [
          { ingredientId: "ing-arabica-beans", qty: 0.025 },
        ],
      },
      {
        id: "recipe-espresso",
        productId: "espresso",
        name: "Espresso",
        ingredients: [
          { ingredientId: "ing-arabica-beans", qty: 0.015 },
        ],
      },
      {
        id: "recipe-latte",
        productId: "latte",
        name: "Latte",
        ingredients: [
          { ingredientId: "ing-arabica-beans", qty: 0.015 },
          { ingredientId: "ing-whole-milk", qty: 0.3 },
          { ingredientId: "ing-sugar", qty: 0.01 },
        ],
      },
      {
        id: "recipe-cappuccino",
        productId: "cappuccino",
        name: "Cappuccino",
        ingredients: [
          { ingredientId: "ing-arabica-beans", qty: 0.018 },
          { ingredientId: "ing-whole-milk", qty: 0.25 },
          { ingredientId: "ing-sugar", qty: 0.01 },
        ],
      },
      {
        id: "recipe-vanilla-latte",
        productId: "vanilla-latte",
        name: "Vanilla Latte",
        ingredients: [
          { ingredientId: "ing-arabica-beans", qty: 0.015 },
          { ingredientId: "ing-whole-milk", qty: 0.3 },
          { ingredientId: "ing-vanilla", qty: 0.02 },
          { ingredientId: "ing-sugar", qty: 0.01 },
        ],
      },
      {
        id: "recipe-caramel-latte",
        productId: "caramel-latte",
        name: "Caramel Latte",
        ingredients: [
          { ingredientId: "ing-arabica-beans", qty: 0.015 },
          { ingredientId: "ing-whole-milk", qty: 0.3 },
          { ingredientId: "ing-caramel", qty: 0.025 },
          { ingredientId: "ing-sugar", qty: 0.01 },
        ],
      },
      {
        id: "recipe-cold-brew",
        productId: "cold-brew",
        name: "Cold Brew",
        ingredients: [
          { ingredientId: "ing-arabica-beans", qty: 0.03 },
        ],
      },
    ];

    // Write all data in parallel
    await Promise.all([
      localDb.suppliers.bulkAdd(suppliers),
      localDb.ingredients.bulkAdd(ingredients),
      localDb.recipes.bulkAdd(recipes),
    ]);

    console.log("✅ Sample data seeded successfully!");
    console.log(`   • ${suppliers.length} suppliers`);
    console.log(`   • ${ingredients.length} ingredients`);
    console.log(`   • ${recipes.length} recipes`);

    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("❌ Error seeding initial data:", errorMsg);
    
    // Don't throw - app should still work with empty data
    // Users can create their own data through the UI
    return false;
  }
}

export async function clearAllData() {
  try {
    console.warn("🗑️ Clearing all database data...");
    await Promise.all([
      localDb.orders.clear(),
      localDb.ingredients.clear(),
      localDb.recipes.clear(),
      localDb.expenses.clear(),
      localDb.restockLog.clear(),
      localDb.suppliers.clear(),
      localDb.cashReconciliations.clear(),
      localDb.pendingWrites.clear(),
      localDb.meta.clear(),
    ]);
    console.log("✅ All data cleared");
    return true;
  } catch (error) {
    console.error("❌ Error clearing data:", error);
    return false;
  }
}
