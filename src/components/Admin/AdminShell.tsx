import { useState } from "react";
import { useOrders }      from "../../hooks/useOrders";
import { useIngredients } from "../../hooks/useIngredients";
import { useExpenses }    from "../../hooks/useExpenses";
import Dashboard  from "./Dashboard";
import Inventory  from "./Inventory";
import Recipes    from "./Recipes";
import Expenses   from "./Expenses";

const TABS = [
  { id:"dashboard",  label:"📊 Dashboard"  },
  { id:"inventory",  label:"📦 Inventory"  },
  { id:"recipes",    label:"📋 Recipes"    },
  { id:"expenses",   label:"💸 Expenses"   },
] as const;

type TabId = typeof TABS[number]["id"];

export default function AdminShell() {
  const [tab, setTab] = useState<TabId>("dashboard");

  // All three hooks live here so data is shared between tabs
  // (e.g. Dashboard needs orders + expenses + ingredients for COGS)
  const ordersCtx      = useOrders();
  const ingredientsCtx = useIngredients();
  const expensesCtx    = useExpenses();

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", background:"#FAF6EF" }}>

      {/* Tab bar */}
      <div style={{
        display:"flex", gap:4, padding:"10px 16px 0",
        borderBottom:"1px solid #E8DDD0", background:"#fff",
        overflowX:"auto",
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding:"8px 16px",
              border:"none",
              borderBottom: tab === t.id ? "2px solid #C0622A" : "2px solid transparent",
              background:"transparent",
              color: tab === t.id ? "#C0622A" : "#8A6040",
              fontFamily:"'Barlow', sans-serif",
              fontWeight: tab === t.id ? 700 : 500,
              fontSize:13,
              cursor:"pointer",
              whiteSpace:"nowrap",
              transition:"color 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content — overflow scrolls within */}
      <div style={{ flex:1, overflowY:"auto" }}>
        {tab === "dashboard" && (
          <Dashboard
            orders={ordersCtx}
            expenses={expensesCtx}
            ingredients={ingredientsCtx}
          />
        )}
        {tab === "inventory" && (
          <Inventory ingredients={ingredientsCtx} />
        )}
        {tab === "recipes" && (
          <Recipes ingredients={ingredientsCtx} />
        )}
        {tab === "expenses" && (
          <Expenses expenses={expensesCtx} />
        )}
      </div>
    </div>
  );
}
