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

function rangeArr(from: string, to: string): string[] {
  const dates: string[] = [];
  const cur = new Date(from + "T00:00");
  const end = new Date(to   + "T00:00");
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function lastNDays(days: number): { from: string; to: string } {
  const to  = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return {
    from: from.toISOString().slice(0, 10),
    to:   to.toISOString().slice(0, 10),
  };
}

/**
 * Compute COGS for one cart item.
 *
 * Recipe lookup priority:
 *   1. `{productId}__{sizeType}`  — size-specific recipe (e.g. iced_spanish_latte__Malaki)
 *   2. `{productId}`              — fallback base recipe (covers singleSize products)
 */
function itemCogs(
  item: { id: string; qty: number; sizeType?: string },
  recipes: Recipe[],
  ingredients: Ingredient[]
): number {
  const sizeKey  = item.sizeType ? `${item.id}__${item.sizeType}` : null;
  const recipe   =
    (sizeKey && recipes.find(r => r.productId === sizeKey)) ??
    recipes.find(r => r.productId === item.id) ??
    null;

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

  const buildDrinkStats = useMemo(() => (subset: Order[]): DrinkStat[] => {
    const map = new Map<string, DrinkStat>();

    for (const order of subset) {
      for (const item of order.items) {
        // Key by id + size so Malaki/Mas Malaki are separate rows
        const key = item.sizeType ? `${item.id}__${item.sizeType}` : item.id;
        const existing = map.get(key);
        const cogs    = itemCogs(item, recipes, ingredients);
        const revenue = item.price * item.qty;
        const margin  = revenue > 0 ? ((revenue - cogs) / revenue) * 100 : 0;
        const label   = item.sizeType ? `${item.name} (${item.sizeType})` : item.name;

        if (existing) {
          const prevQty = existing.qtySold;
          existing.qtySold  += item.qty;
          existing.revenue  += revenue;
          existing.avgMargin =
            (existing.avgMargin * prevQty + margin * item.qty) / existing.qtySold;
        } else {
          map.set(key, {
            productId: key,
            name:      label,
            qtySold:   item.qty,
            revenue,
            avgMargin: margin,
          });
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => b.qtySold - a.qtySold);
  }, [recipes, ingredients]);

  // ── Top 5 ─────────────────────────────────────────────────────────────────────

  const top5Today = useMemo(() => {
    const todayOrders = completedOrders.filter(o => dateStr(o.createdAt) === today);
    return buildDrinkStats(todayOrders).slice(0, 5);
  }, [completedOrders, today, buildDrinkStats]);

  const top5AllTime = useMemo(() =>
    buildDrinkStats(completedOrders).slice(0, 5),
    [completedOrders, buildDrinkStats]
  );

  const marginRanking = useMemo(() =>
    buildDrinkStats(completedOrders)
      .filter(d => d.avgMargin > 0)
      .sort((a, b) => b.avgMargin - a.avgMargin)
      .slice(0, 10),
    [completedOrders, buildDrinkStats]
  );

  // ── Daily stats for an explicit date range ───────────────────────────────────

  const buildStatsForRange = useMemo(() => (from: string, to: string): DailyStat[] => {
    return rangeArr(from, to).map(date => {
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

  // Keep last7Days / last30Days as convenience wrappers
  const last7Days  = useMemo(() => {
    const { from, to } = lastNDays(7);
    return buildStatsForRange(from, to);
  }, [buildStatsForRange]);

  const last30Days = useMemo(() => {
    const { from, to } = lastNDays(30);
    return buildStatsForRange(from, to);
  }, [buildStatsForRange]);

  // ── Payment breakdown ────────────────────────────────────────────────────────

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
    cupsToday,
    cupsThisWeek,
    cupsAllTime,
    cupsForDate,
    top5Today,
    top5AllTime,
    marginRanking,
    last7Days,
    last30Days,
    buildStatsForRange,
    buildDrinkStats,
    paymentBreakdown,
  };
}
