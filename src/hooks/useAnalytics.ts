import { useMemo } from "react";
import { Order, Ingredient, Recipe, Expense, DrinkStat, DailyStat } from "../types";

interface Props {
  orders:      Order[];
  ingredients: Ingredient[];
  recipes:     Recipe[];
  expenses:    Expense[];
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function dateStr(ts: number) {
  return new Date(ts).toISOString().slice(0, 10);
}

function rangeArr(days: number): string[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return d.toISOString().slice(0, 10);
  });
}

// Compute COGS for a single order item given current recipes + ingredient costs
function itemCogs(
  item: { id: string; qty: number },
  recipes: Recipe[],
  ingredients: Ingredient[]
): number {
  const recipe = recipes.find(r => r.productId === item.id);
  if (!recipe) return 0;
  return recipe.ingredients.reduce((s, ri) => {
    const ing = ingredients.find(i => i.id === ri.ingredientId);
    return s + (ing ? ing.costPerUnit * ri.qty * item.qty : 0);
  }, 0);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAnalytics({ orders, ingredients, recipes, expenses }: Props) {

  const completedOrders = useMemo(
    () => orders.filter(o => o.status === "completed"),
    [orders]
  );

  // ── Cups sold ────────────────────────────────────────────────────────────────

  const today = new Date().toISOString().slice(0, 10);

  const weekStart = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  })();

  const cupsForDate = useMemo(() => (date: string) =>
    completedOrders
      .filter(o => dateStr(o.createdAt) === date)
      .reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0),
    [completedOrders]
  );

  const cupsToday = useMemo(() => cupsForDate(today), [cupsForDate, today]);

  const cupsThisWeek = useMemo(() =>
    completedOrders
      .filter(o => dateStr(o.createdAt) >= weekStart)
      .reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0),
    [completedOrders, weekStart]
  );

  const cupsAllTime = useMemo(() =>
    completedOrders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0),
    [completedOrders]
  );

  // ── Drink stats builder ───────────────────────────────────────────────────────
  // Builds a sorted DrinkStat[] from a subset of orders

  const buildDrinkStats = useMemo(() => (subset: Order[]): DrinkStat[] => {
    const map = new Map<string, DrinkStat>();

    for (const order of subset) {
      for (const item of order.items) {
        const existing = map.get(item.id);
        const cogs = itemCogs(item, recipes, ingredients);
        const revenue = item.price * item.qty;
        const margin = revenue > 0 ? ((revenue - cogs) / revenue) * 100 : 0;

        if (existing) {
          existing.qtySold  += item.qty;
          existing.revenue  += revenue;
          // Running avg margin weighted by qty
          existing.avgMargin = (existing.avgMargin * (existing.qtySold - item.qty) + margin * item.qty) / existing.qtySold;
        } else {
          map.set(item.id, {
            productId: item.id,
            name:      item.name,
            qtySold:   item.qty,
            revenue,
            avgMargin: margin,
          });
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => b.qtySold - a.qtySold);
  }, [recipes, ingredients]);

  // ── Top 5 daily ──────────────────────────────────────────────────────────────

  const top5Today = useMemo(() => {
    const todayOrders = completedOrders.filter(o => dateStr(o.createdAt) === today);
    return buildDrinkStats(todayOrders).slice(0, 5);
  }, [completedOrders, today, buildDrinkStats]);

  // ── Top 5 all-time ───────────────────────────────────────────────────────────

  const top5AllTime = useMemo(() =>
    buildDrinkStats(completedOrders).slice(0, 5),
    [completedOrders, buildDrinkStats]
  );

  // ── Profit margin per product (all-time, top 10 by margin) ───────────────────

  const marginRanking = useMemo(() =>
    buildDrinkStats(completedOrders)
      .filter(d => d.avgMargin > 0)
      .sort((a, b) => b.avgMargin - a.avgMargin)
      .slice(0, 10),
    [completedOrders, buildDrinkStats]
  );

  // ── Daily stats for a range ───────────────────────────────────────────────────

  const buildDailyStats = useMemo(() => (days: number): DailyStat[] => {
    return rangeArr(days).map(date => {
      const dayOrders = completedOrders.filter(o => dateStr(o.createdAt) === date);
      const revenue   = dayOrders.reduce((s, o) => s + o.total, 0);
      const cogs      = dayOrders.reduce((s, o) =>
        s + o.items.reduce((a, item) => a + itemCogs(item, recipes, ingredients), 0), 0);
      const dayExpenses = expenses
        .filter(e => e.date === date)
        .reduce((s, e) => s + e.amount, 0);
      const cupsCount = dayOrders.reduce((s, o) =>
        s + o.items.reduce((a, i) => a + i.qty, 0), 0);

      return {
        date,
        revenue,
        cogs,
        expenses: dayExpenses,
        netProfit: revenue - cogs - dayExpenses,
        orderCount: dayOrders.length,
        cupsCount,
      };
    });
  }, [completedOrders, recipes, ingredients, expenses]);

  const last7Days  = useMemo(() => buildDailyStats(7),  [buildDailyStats]);
  const last30Days = useMemo(() => buildDailyStats(30), [buildDailyStats]);

  // ── Payment method breakdown ──────────────────────────────────────────────────

  const paymentBreakdown = useMemo(() => (dateFrom: string, dateTo: string) => {
    const subset = completedOrders.filter(o => {
      const d = dateStr(o.createdAt);
      return d >= dateFrom && d <= dateTo;
    });
    return {
      cash:  subset.filter(o => o.paymentMethod === "cash").reduce((s, o) => s + o.total, 0),
      gcash: subset.filter(o => o.paymentMethod === "gcash").reduce((s, o) => s + o.total, 0),
      card:  subset.filter(o => o.paymentMethod === "card").reduce((s, o) => s + o.total, 0),
    };
  }, [completedOrders]);

  return {
    // Cups
    cupsToday,
    cupsThisWeek,
    cupsAllTime,
    cupsForDate,

    // Top drinks
    top5Today,
    top5AllTime,
    marginRanking,

    // Trend data
    last7Days,
    last30Days,
    buildDailyStats,
    buildDrinkStats,

    // Payment
    paymentBreakdown,
  };
}
