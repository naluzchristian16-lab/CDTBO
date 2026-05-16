import { useMemo, useState } from "react";
import { ReturnType as OrdersCtx }      from "../../hooks/useOrders";
import { ReturnType as ExpensesCtx }    from "../../hooks/useExpenses";
import { ReturnType as IngredientsCtx } from "../../hooks/useIngredients";

// ─── Types ────────────────────────────────────────────────────────────────────
// We receive the hook return values as props from AdminShell
interface Props {
  orders:      ReturnType<typeof import("../../hooks/useOrders").useOrders>;
  expenses:    ReturnType<typeof import("../../hooks/useExpenses").useExpenses>;
  ingredients: ReturnType<typeof import("../../hooks/useIngredients").useIngredients>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function SummaryCard({ label, value, sub, accent }: {
  label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <div style={{
      background:"#fff", border:"1px solid #E8DDD0", borderRadius:10,
      padding:"14px 16px", minWidth:0,
    }}>
      <div style={{ fontSize:11, color:"#8A6040", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>{label}</div>
      <div style={{
        fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:26,
        color: accent ? "#C0622A" : "#3B1F0E",
      }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:"#A09080", marginTop:2 }}>{sub}</div>}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Dashboard({ orders, expenses, ingredients }: Props) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  const dateOrders = useMemo(() => {
    return orders.completedOrders.filter(o =>
      new Date(o.createdAt).toISOString().slice(0, 10) === selectedDate
    );
  }, [orders.completedOrders, selectedDate]);

  // Revenue
  const revenue = dateOrders.reduce((s, o) => s + o.total, 0);

  // COGS — walk each order's items, find recipe, multiply ingredient cost × qty
  const cogs = useMemo(() => {
    let total = 0;
    for (const order of dateOrders) {
      for (const item of order.items) {
        const recipe = ingredients.getRecipeForProduct(item.id);
        if (!recipe) continue;
        for (const ri of recipe.ingredients) {
          const ing = ingredients.ingredients.find(i => i.id === ri.ingredientId);
          if (!ing) continue;
          total += ing.costPerUnit * ri.qty * item.qty;
        }
      }
    }
    return total;
  }, [dateOrders, ingredients]);

  // Expenses for selected date
  const dateExpenses = expenses.expensesForDate(selectedDate);
  const expenseTotal = dateExpenses.reduce((s, e) => s + e.amount, 0);

  // Gross & net profit
  const grossProfit = revenue - cogs;
  const netProfit   = grossProfit - expenseTotal;

  // Order type breakdown
  const byType = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of dateOrders) {
      map[o.orderType] = (map[o.orderType] ?? 0) + 1;
    }
    return map;
  }, [dateOrders]);

  // Top sellers (by qty)
  const topSellers = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const o of dateOrders) {
      for (const item of o.items) {
        if (!map[item.id]) map[item.id] = { name: item.name, qty: 0, revenue: 0 };
        map[item.id].qty     += item.qty;
        map[item.id].revenue += item.price * item.qty;
      }
    }
    return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 8);
  }, [dateOrders]);

  // Last 7 days revenue for mini chart
  const last7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const ds = d.toISOString().slice(0, 10);
      const rev = orders.completedOrders
        .filter(o => new Date(o.createdAt).toISOString().slice(0, 10) === ds)
        .reduce((s, o) => s + o.total, 0);
      return { date: ds, label: d.toLocaleDateString("en-PH", { weekday:"short" }), rev };
    });
  }, [orders.completedOrders]);

  const maxRev = Math.max(...last7.map(d => d.rev), 1);

  return (
    <div style={{ padding:16 }}>

      {/* Date picker */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
        <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:22, color:"#3B1F0E" }}>
          SALES DASHBOARD
        </div>
        <input
          type="date"
          value={selectedDate}
          max={new Date().toISOString().slice(0, 10)}
          onChange={e => setSelectedDate(e.target.value)}
          style={{
            marginLeft:"auto", padding:"6px 10px",
            border:"1px solid #DDD0C0", borderRadius:7,
            fontFamily:"'Barlow', sans-serif", fontSize:12,
            color:"#3B1F0E", background:"#fff", outline:"none",
          }}
        />
      </div>

      {/* KPI cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(150px, 1fr))", gap:10, marginBottom:16 }}>
        <SummaryCard label="Revenue"       value={fmt(revenue)}      sub={`${dateOrders.length} orders`} />
        <SummaryCard label="COGS"          value={fmt(cogs)}         sub="Ingredient cost" />
        <SummaryCard label="Gross Profit"  value={fmt(grossProfit)}  accent={grossProfit > 0} />
        <SummaryCard label="Other Expenses" value={fmt(expenseTotal)} sub={`${dateExpenses.length} entries`} />
        <SummaryCard label="Net Profit"    value={fmt(netProfit)}    accent={netProfit > 0} sub="After all expenses" />
      </div>

      {/* 7-day bar chart */}
      <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#6B4226", marginBottom:12, textTransform:"uppercase", letterSpacing:"0.5px" }}>
          Revenue — Last 7 Days
        </div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:80 }}>
          {last7.map(d => (
            <div key={d.date} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div
                title={fmt(d.rev)}
                style={{
                  width:"100%", borderRadius:"4px 4px 0 0",
                  background: d.date === selectedDate ? "#C0622A" : "#F5ECD7",
                  border: d.date === selectedDate ? "none" : "1px solid #E8DDD0",
                  height: `${Math.max(4, (d.rev / maxRev) * 68)}px`,
                  cursor:"pointer", transition:"background 0.15s",
                }}
                onClick={() => setSelectedDate(d.date)}
              />
              <span style={{ fontSize:9, color:"#8A6040", fontWeight:600 }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>

        {/* Order type breakdown */}
        <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, padding:"14px 16px" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#6B4226", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.5px" }}>
            By Order Type
          </div>
          {Object.entries(byType).length === 0
            ? <div style={{ fontSize:12, color:"#C8A98A" }}>No orders yet.</div>
            : Object.entries(byType).map(([type, count]) => (
              <div key={type} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:4, color:"#3B1F0E" }}>
                <span style={{ textTransform:"capitalize" }}>{type}</span>
                <span style={{ fontWeight:700 }}>{count}</span>
              </div>
            ))
          }
        </div>

        {/* Expense breakdown */}
        <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, padding:"14px 16px" }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#6B4226", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.5px" }}>
            Expenses
          </div>
          {dateExpenses.length === 0
            ? <div style={{ fontSize:12, color:"#C8A98A" }}>No expenses logged.</div>
            : dateExpenses.map(e => (
              <div key={e.id} style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4, color:"#3B1F0E" }}>
                <span style={{ color:"#8A6040" }}>{e.category} — {e.description}</span>
                <span style={{ fontWeight:600 }}>₱{e.amount}</span>
              </div>
            ))
          }
        </div>
      </div>

      {/* Top sellers */}
      <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, overflow:"hidden" }}>
        <div style={{ padding:"10px 14px", background:"#F5ECD7", fontSize:11, fontWeight:700, color:"#6B4226", textTransform:"uppercase", letterSpacing:"0.5px", display:"grid", gridTemplateColumns:"1fr 60px 80px" }}>
          <span>Product</span><span style={{ textAlign:"right" }}>Qty</span><span style={{ textAlign:"right" }}>Revenue</span>
        </div>
        {topSellers.length === 0
          ? <div style={{ padding:24, textAlign:"center", color:"#C8A98A", fontSize:13 }}>No sales data.</div>
          : topSellers.map((s, i) => (
            <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 60px 80px", padding:"9px 14px", borderTop:"1px solid #F0E8DC", fontSize:12, color:"#3B1F0E" }}>
              <span>{s.name}</span>
              <span style={{ textAlign:"right", fontWeight:700 }}>{s.qty}</span>
              <span style={{ textAlign:"right", color:"#C0622A", fontWeight:700 }}>{fmt(s.revenue)}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
}
