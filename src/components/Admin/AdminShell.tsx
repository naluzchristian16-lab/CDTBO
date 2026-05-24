import { useState } from "react";
import { useOrders }          from "../../hooks/useOrders";
import { useIngredients }     from "../../hooks/useIngredients";
import { useExpenses }        from "../../hooks/useExpenses";
import { useSuppliers }       from "../../hooks/useSuppliers";
import { useProducts }        from "../../hooks/useProducts";
import { useRestock }         from "../../hooks/useRestock";
import { useReconciliation }  from "../../hooks/useReconciliation";
import { useAnalytics }       from "../../hooks/useAnalytics";

import Dashboard      from "./Dashboard";
import Inventory      from "./Inventory";
import Recipes        from "./Recipes";
import Expenses       from "./Expenses";
import RestockLog     from "./RestockLog";
import Reconciliation from "./Reconciliation";
import ProductManager from "./ProductManager";

const TABS = [
  { id:"dashboard",      label:"📊 Dashboard"      },
  { id:"products",       label:"🛍 Products"        },
  { id:"inventory",      label:"📦 Inventory"      },
  { id:"recipes",        label:"📋 Recipes"        },
  { id:"expenses",       label:"💸 Expenses"       },
  { id:"restock",        label:"🛒 Restock"        },
  { id:"reconciliation", label:"🏦 Reconciliation" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function AdminShell() {
  const [tab, setTab] = useState<TabId>("dashboard");

  const ordersCtx         = useOrders();
  const ingredientsCtx    = useIngredients();
  const expensesCtx       = useExpenses();
  const suppliersCtx      = useSuppliers();
  const productsCtx       = useProducts();
  const restockCtx        = useRestock(ingredientsCtx.ingredients);
  const reconciliationCtx = useReconciliation(ordersCtx.completedOrders);

  const analyticsCtx = useAnalytics({
    orders:      ordersCtx.orders,
    ingredients: ingredientsCtx.ingredients,
    recipes:     ingredientsCtx.recipes,
    expenses:    expensesCtx.expenses,
  });

  const isLoading = ordersCtx.loading || ingredientsCtx.loading || expensesCtx.loading;

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:"#FAF6EF" }}>

      {/* Tab bar */}
      <div style={{
        display:"flex", gap:2, padding:"10px 12px 0",
        borderBottom:"1px solid #E8DDD0", background:"#fff",
        overflowX:"auto", flexShrink:0,
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:"8px 14px", border:"none",
            borderBottom: tab === t.id ? "2px solid #C0622A" : "2px solid transparent",
            background:"transparent",
            color: tab === t.id ? "#C0622A" : "#8A6040",
            fontFamily:"'Barlow', sans-serif",
            fontWeight: tab === t.id ? 700 : 500,
            fontSize:12, cursor:"pointer", whiteSpace:"nowrap",
            transition:"color 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex:1, overflowY:"auto" }}>
        {isLoading ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100%", color: "#8A6040",
            gap: 12, background: "#FAF6EF",
          }}>
            <div style={{ fontSize: 48 }}>⏳</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#3B1F0E" }}>Loading admin data...</div>
            <div style={{ fontSize: 12, color: "#C8A98A" }}>Syncing with Firebase</div>
          </div>
        ) : (
          <>
            {tab === "dashboard" && (
              <Dashboard
                orders={ordersCtx}
                expenses={expensesCtx}
                ingredients={ingredientsCtx}
                analytics={analyticsCtx}
                restock={restockCtx}
              />
            )}
            {tab === "products"       && <ProductManager />}
            {tab === "inventory"      && <Inventory   ingredients={ingredientsCtx} />}
            {tab === "recipes"        && <Recipes     ingredients={ingredientsCtx} products={productsCtx.products} />}
            {tab === "expenses"       && <Expenses    expenses={expensesCtx} />}
            {tab === "restock"        && (
              <RestockLog
                restock={restockCtx}
                suppliers={suppliersCtx}
                ingredients={ingredientsCtx}
              />
            )}
            {tab === "reconciliation" && (
              <Reconciliation
                reconciliation={reconciliationCtx}
                analytics={analyticsCtx}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
