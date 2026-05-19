import { useLiveQuery }    from "dexie-react-hooks";
import { localDb }         from "../db/localDb";
import { syncWrite }       from "../db/syncEngine";
import { useOnlineStatus } from "./useOnlineStatus";
import { Order, CartItem, OrderType, PaymentMethod } from "../types";
import { v4 as uuidv4 }    from "uuid";

export function useOrders() {
  const isOnline = useOnlineStatus();

  // ── Live query from IndexedDB — works offline ─────────────────────────────
  const orders: Order[] = useLiveQuery(
    () => localDb.orders.orderBy("createdAt").reverse().toArray(), [], []
  ) ?? [];

  const loading = orders.length === 0;

  // ── Write ops ─────────────────────────────────────────────────────────────

  const placeOrder = async (payload: {
    orderNumber:   string;
    deviceId:      string;
    items:         CartItem[];
    orderType:     OrderType;
    paymentMethod: PaymentMethod;
    deliveryFee:   number;
    discount:      number;
    cash:          number;
    total:         number;
  }) => {
    const id    = uuidv4();
    const order: Order = {
      id,
      ...payload,
      status:    "pending",
      createdAt: Date.now(),
    };
    await syncWrite({ col: "orders", docId: id, op: "set", payload: order, isOnline });
    return id;
  };

  const markComplete = async (orderId: string) =>
    syncWrite({
      col: "orders", docId: orderId, op: "update",
      payload: { status: "completed" },
      isOnline,
    });

  const voidOrder = async (orderId: string) =>
    syncWrite({
      col: "orders", docId: orderId, op: "update",
      payload: { status: "voided" },
      isOnline,
    });

  // ── Derived ───────────────────────────────────────────────────────────────

  const activeOrders = orders
    .filter(o => o.status === "pending")
    .sort((a, b) => a.createdAt - b.createdAt);

  const completedOrders = orders.filter(o => o.status === "completed");

  const todayStr = new Date().toDateString();

  const todayCompleted = completedOrders.filter(
    o => new Date(o.createdAt).toDateString() === todayStr
  );

  const todayRevenue = todayCompleted.reduce((s, o) => s + o.total, 0);

  return {
    orders,
    loading,
    activeOrders,
    completedOrders,
    todayCompleted,
    todayRevenue,
    placeOrder,
    markComplete,
    voidOrder,
  };
}
