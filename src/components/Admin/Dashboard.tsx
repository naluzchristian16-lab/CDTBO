import { useMemo, useState } from "react";
import { useOrders }      from "../../hooks/useOrders";
import { useExpenses }    from "../../hooks/useExpenses";
import { useIngredients } from "../../hooks/useIngredients";
import { useAnalytics }   from "../../hooks/useAnalytics";
import { useRestock }     from "../../hooks/useRestock";
import { DailyStat, DrinkStat } from "../../types";

interface Props {
  orders:      ReturnType<typeof useOrders>;
  expenses:    ReturnType<typeof useExpenses>;
  ingredients: ReturnType<typeof useIngredients>;
  analytics:   ReturnType<typeof useAnalytics>;
  restock:     ReturnType<typeof useRestock>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const peso = (n: number) =>
  `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

type Period = "today" | "7days" | "30days";

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color }: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, padding:"12px 14px", minWidth:0 }}>
      <div style={{ fontSize:10, color:"#8A6040", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>{label}</div>
      <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:24, color: color ?? "#3B1F0E" }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:"#A09080", marginTop:2 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:16, color:"#3B1F0E", letterSpacing:"0.5px", marginBottom:10, textTransform:"uppercase" }}>
      {children}
    </div>
  );
}

function TopDrinksList({ drinks, title }: { drinks: DrinkStat[]; title: string }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, overflow:"hidden" }}>
      <div style={{ padding:"10px 14px", background:"#F5ECD7", fontSize:11, fontWeight:700, color:"#6B4226", textTransform:"uppercase", letterSpacing:"0.5px" }}>
        {title}
      </div>
      {drinks.length === 0
        ? <div style={{ padding:"20px 14px", fontSize:12, color:"#C8A98A", textAlign:"center" }}>No data yet.</div>
        : drinks.map((d, i) => (
          <div key={d.productId} style={{ display:"grid", gridTemplateColumns:"24px 1fr 50px 60px 60px", alignItems:"center", padding:"9px 14px", borderTop:"1px solid #F0E8DC", fontSize:12 }}>
            <span style={{ fontWeight:800, color:"#C0622A", fontFamily:"'Barlow Condensed', sans-serif", fontSize:15 }}>{i + 1}</span>
            <span style={{ fontWeight:600, color:"#3B1F0E" }}>{d.name}</span>
            <span style={{ textAlign:"right", fontWeight:700, color:"#3B1F0E" }}>{d.qtySold} cups</span>
            <span style={{ textAlign:"right", color:"#C0622A", fontWeight:700 }}>{peso(d.revenue)}</span>
            <span style={{ textAlign:"right", color: d.avgMargin > 60 ? "#3B6B28" : d.avgMargin > 30 ? "#8A6040" : "#C0622A", fontWeight:600, fontSize:11 }}>
              {d.avgMargin > 0 ? `${d.avgMargin.toFixed(0)}%` : "—"}
            </span>
          </div>
        ))
      }
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Dashboard({ orders, expenses, ingredients, analytics, restock }: Props) {
  const [period, setPeriod] = useState<Period>("today");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  const today = new Date().toISOString().slice(0, 10);

  // Pick which daily stats array to use based on period
  const trendData: DailyStat[] = period === "30days" ? analytics.last30Days : analytics.last7Days;

  // For KPI totals, sum across the trend period (or just today)
  const periodStats = useMemo(() => {
    const rows = period === "today"
      ? analytics.last7Days.filter(d => d.date === today)
      : trendData;
    return rows.reduce((acc, d) => ({
      revenue:    acc.revenue    + d.revenue,
      cogs:       acc.cogs       + d.cogs,
      expenses:   acc.expenses   + d.expenses,
      netProfit:  acc.netProfit  + d.netProfit,
      orderCount: acc.orderCount + d.orderCount,
    }), { revenue:0, cogs:0, expenses:0, netProfit:0, orderCount:0 });
  }, [period, trendData, today]);

  // Payment breakdown for the period
  const dateFrom = period === "today" ? today
    : period === "7days"  ? analytics.last7Days[0]?.date  ?? today
    : analytics.last30Days[0]?.date ?? today;

  const payments = analytics.paymentBreakdown(dateFrom, today);

  // Restock spend for period
  const restockSpend = restock.totalSpentForRange(dateFrom, today);

  // Bar chart max
  const maxRev = Math.max(...trendData.map(d => d.revenue), 1);
  const maxCups = Math.max(...trendData.map(d => d.cupsCount), 1);

  const periodLabel = period === "today" ? "Today" : period === "7days" ? "Last 7 Days" : "Last 30 Days";

  return (
    <div style={{ padding:16 }}>

      {/* Header + period toggle */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:22, color:"#3B1F0E" }}>
          DASHBOARD
        </div>
        <div style={{ display:"flex", gap:4, marginLeft:"auto" }}>
          {(["today","7days","30days"] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding:"6px 12px", borderRadius:6, border:"none", cursor:"pointer",
              fontFamily:"'Barlow', sans-serif", fontSize:12, fontWeight:600,
              background: period === p ? "#C0622A" : "#F5ECD7",
              color:      period === p ? "#fff"    : "#6B4226",
            }}>
              {p === "today" ? "Today" : p === "7days" ? "7 Days" : "30 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* ── CUPS SOLD BANNER ── */}
      <div style={{ background:"#3B1F0E", borderRadius:10, padding:"14px 16px", marginBottom:16, display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10 }}>
        {[
          { label:"Cups Today",     value: analytics.cupsToday,    sub:"☕" },
          { label:"Cups This Week", value: analytics.cupsThisWeek, sub:"📅" },
          { label:"Cups All-Time",  value: analytics.cupsAllTime,  sub:"🏆" },
        ].map(c => (
          <div key={c.label} style={{ textAlign:"center" }}>
            <div style={{ fontSize:9, color:"#C0622A", fontWeight:700, textTransform:"uppercase", letterSpacing:"1px", marginBottom:2 }}>{c.label}</div>
            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:32, color:"#F5ECD7", lineHeight:1 }}>
              {c.value.toLocaleString()}
            </div>
            <div style={{ fontSize:16, marginTop:2 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* ── KPI CARDS ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))", gap:10, marginBottom:16 }}>
        <KpiCard label={`Revenue (${periodLabel})`}    value={peso(periodStats.revenue)}   sub={`${periodStats.orderCount} orders`} />
        <KpiCard label="COGS"                          value={peso(periodStats.cogs)}       sub="Ingredient cost" />
        <KpiCard label="Gross Profit"                  value={peso(periodStats.revenue - periodStats.cogs)} color={periodStats.revenue - periodStats.cogs > 0 ? "#C0622A" : "#888"} />
        <KpiCard label="Other Expenses"                value={peso(periodStats.expenses)} />
        <KpiCard label="Restock Spend"                 value={peso(restockSpend)}          sub="Inventory purchases" />
        <KpiCard label="Net Profit"                    value={peso(periodStats.netProfit)} color={periodStats.netProfit > 0 ? "#3B6B28" : "#C0622A"} sub="After all costs" />
      </div>

      {/* ── PAYMENT BREAKDOWN ── */}
      <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, padding:"12px 16px", marginBottom:16 }}>
        <SectionTitle>💳 Payment Methods — {periodLabel}</SectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10 }}>
          {[
            { label:"💵 Cash",  value: payments.cash,  color:"#3B6B28" },
            { label:"📱 GCash", value: payments.gcash, color:"#0066CC" },
            { label:"💳 Card",  value: payments.card,  color:"#8B2FC9" },
          ].map(p => (
            <div key={p.label} style={{ textAlign:"center", padding:"10px 0" }}>
              <div style={{ fontSize:11, color:"#8A6040", fontWeight:600, marginBottom:4 }}>{p.label}</div>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:20, color: p.value > 0 ? p.color : "#C8A98A" }}>
                {peso(p.value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TREND CHART (skip for "today") ── */}
      {period !== "today" && (
        <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
          <SectionTitle>📈 Revenue & Cups — {periodLabel}</SectionTitle>
          <div style={{ display:"flex", alignItems:"flex-end", gap: period === "30days" ? 2 : 6, height:90, marginBottom:6 }}>
            {trendData.map(d => (
              <div key={d.date} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                {/* Revenue bar */}
                <div title={`Revenue: ${peso(d.revenue)}\nCups: ${d.cupsCount}`} style={{
                  width:"100%", borderRadius:"3px 3px 0 0",
                  background: d.date === today ? "#C0622A" : "#F5ECD7",
                  border: "1px solid #E8DDD0",
                  height:`${Math.max(3, (d.revenue / maxRev) * 70)}px`,
                  cursor:"pointer", transition:"background 0.15s",
                }} onClick={() => setSelectedDate(d.date)} />
                {period === "7days" && (
                  <span style={{ fontSize:8, color:"#8A6040", fontWeight:600 }}>
                    {new Date(d.date + "T00:00").toLocaleDateString("en-PH", { weekday:"short" })}
                  </span>
                )}
              </div>
            ))}
          </div>
          {/* Cups sparkline */}
          <div style={{ display:"flex", alignItems:"flex-end", gap: period === "30days" ? 2 : 6, height:30 }}>
            {trendData.map(d => (
              <div key={d.date} title={`${d.cupsCount} cups`} style={{
                flex:1, borderRadius:"2px 2px 0 0",
                background: d.date === today ? "#3B1F0E" : "#E8DDD0",
                height:`${Math.max(2, (d.cupsCount / maxCups) * 28)}px`,
              }} />
            ))}
          </div>
          <div style={{ fontSize:10, color:"#8A6040", marginTop:4, display:"flex", gap:12 }}>
            <span>🟫 Revenue bars</span><span>⬛ Cups sparkline</span>
          </div>
        </div>
      )}

      {/* ── TOP 5 DRINKS ── */}
      <SectionTitle>🏅 Top Drinks</SectionTitle>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
        <TopDrinksList drinks={analytics.top5Today}   title="🌅 Top 5 Today" />
        <TopDrinksList drinks={analytics.top5AllTime} title="🏆 Top 5 All-Time" />
      </div>

      {/* ── PROFIT MARGIN RANKING ── */}
      <SectionTitle>💹 Best Margin Products</SectionTitle>
      <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, overflow:"hidden", marginBottom:16 }}>
        <div style={{ display:"grid", gridTemplateColumns:"24px 1fr 80px 80px 70px", padding:"8px 14px", background:"#F5ECD7", fontSize:11, fontWeight:700, color:"#6B4226", textTransform:"uppercase", letterSpacing:"0.5px" }}>
          <span>#</span><span>Product</span><span style={{ textAlign:"right" }}>Sold</span><span style={{ textAlign:"right" }}>Revenue</span><span style={{ textAlign:"right" }}>Margin</span>
        </div>
        {analytics.marginRanking.length === 0
          ? <div style={{ padding:"20px 14px", fontSize:12, color:"#C8A98A", textAlign:"center" }}>Add recipes to see margin data.</div>
          : analytics.marginRanking.map((d, i) => (
            <div key={d.productId} style={{ display:"grid", gridTemplateColumns:"24px 1fr 80px 80px 70px", alignItems:"center", padding:"9px 14px", borderTop:"1px solid #F0E8DC", fontSize:12 }}>
              <span style={{ fontWeight:800, color:"#C0622A", fontFamily:"'Barlow Condensed', sans-serif", fontSize:14 }}>{i + 1}</span>
              <span style={{ fontWeight:600, color:"#3B1F0E" }}>{d.name}</span>
              <span style={{ textAlign:"right", color:"#8A6040" }}>{d.qtySold}</span>
              <span style={{ textAlign:"right", fontWeight:700, color:"#C0622A" }}>{peso(d.revenue)}</span>
              <div style={{ textAlign:"right" }}>
                <span style={{
                  padding:"2px 7px", borderRadius:8, fontSize:11, fontWeight:700,
                  background: d.avgMargin > 60 ? "#E8F5E9" : d.avgMargin > 30 ? "#FFF8E1" : "#FDECEA",
                  color:      d.avgMargin > 60 ? "#3B6B28" : d.avgMargin > 30 ? "#8A6040" : "#C0622A",
                }}>
                  {d.avgMargin.toFixed(0)}%
                </span>
              </div>
            </div>
          ))
        }
      </div>

    </div>
  );
}
