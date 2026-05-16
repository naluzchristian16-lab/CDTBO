import { useEffect, useState } from "react";
import {
  collection, addDoc, updateDoc, doc, onSnapshot, query, orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { Order, CartItem, OrderType } from "../types";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener — newest orders first in the array
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
      setLoading(false);
    });
    return unsub;
  }, []);

  const placeOrder = async (payload: {
    orderNumber: string;
    deviceId: string;
    items: CartItem[];
    orderType: OrderType;
    deliveryFee: number;
    discount: number;
    cash: number;
    total: number;
  }) => {
    await addDoc(collection(db, "orders"), {
      ...payload,
      status: "pending",
      createdAt: Date.now(),
    });
  };

  const markComplete = async (orderId: string) => {
    await updateDoc(doc(db, "orders", orderId), { status: "completed" });
  };

  // ── Derived helpers ──────────────────────────────────────────────────────────

  const activeOrders = orders
    .filter(o => o.status !== "completed")
    .sort((a, b) => a.createdAt - b.createdAt); // oldest first in kitchen

  const completedOrders = orders.filter(o => o.status === "completed");

  const todayStr = new Date().toDateString();

  const todayCompleted = completedOrders.filter(
    o => new Date(o.createdAt).toDateString() === todayStr
  );

  const todayRevenue = todayCompleted.reduce((sum, o) => sum + o.total, 0);

  return {
    orders,
    loading,
    activeOrders,
    completedOrders,
    todayCompleted,
    todayRevenue,
    placeOrder,
    markComplete,
  };
}
