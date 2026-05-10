import { useMemo, useEffect, useState } from "react";

/* ================= CATEGORIES ================= */
const categories = [
  "All Products",
  "Hot Drinks",
  "Iced Coffee",
  "Non-Coffee",
  "Matcha Collection",
  "Oatside Series"
];

/* ================= PRODUCTS ================= */
const products = [
  { id: 1, name: "Hot Americano", category: "Hot Drinks", size: "12oz", price: 84, type: "hot", coffee: true },
  { id: 2, name: "Hot Spanish Latte", category: "Hot Drinks", size: "12oz", price: 94, type: "hot", coffee: true },
  { id: 3, name: "Hot Mocha", category: "Hot Drinks", size: "12oz", price: 94, type: "hot", coffee: true },
  { id: 4, name: "Hot Caramel Macchiato", category: "Hot Drinks", size: "12oz", price: 104, type: "hot", coffee: true },
  { id: 5, name: "Hot Strawberry Latte", category: "Hot Drinks", size: "12oz", price: 104, type: "hot", coffee: true },
  { id: 6, name: "Hot Strawberry Mocha", category: "Hot Drinks", size: "12oz", price: 104, type: "hot", coffee: true },
  { id: 7, name: "Hot Matcha Latte", category: "Hot Drinks", size: "12oz", price: 94, type: "hot", coffee: false },
  { id: 8, name: "Hot Strawberry Matcha", category: "Hot Drinks", size: "12oz", price: 104, type: "hot", coffee: false },
  { id: 9, name: "Hot Strawberry Dirty Matcha", category: "Hot Drinks", size: "12oz", price: 114, type: "hot", coffee: true },
  { id: 10, name: "Hot Blueberry Matcha", category: "Hot Drinks", size: "12oz", price: 104, type: "hot", coffee: false },

  { id: 11, name: "Iced Americano", category: "Iced Coffee", size: "16oz", price: 94, type: "iced", coffee: true },
  { id: 12, name: "Iced Spanish Latte", category: "Iced Coffee", size: "16oz", price: 104, type: "iced", coffee: true },
  { id: 13, name: "Iced Mocha", category: "Iced Coffee", size: "16oz", price: 104, type: "iced", coffee: true },
  { id: 14, name: "Iced Caramel Macchiato", category: "Iced Coffee", size: "16oz", price: 114, type: "iced", coffee: true },
  { id: 15, name: "Iced Ube Macchiato", category: "Iced Coffee", size: "16oz", price: 114, type: "iced", coffee: true },
  { id: 16, name: "Iced Strawberry Latte", category: "Iced Coffee", size: "16oz", price: 114, type: "iced", coffee: true },
  { id: 17, name: "Iced Strawberry Mocha", category: "Iced Coffee", size: "16oz", price: 114, type: "iced", coffee: true },

  { id: 18, name: "Strawberry Milk Drink", category: "Non-Coffee", size: "16oz", price: 94, type: "iced", coffee: false },
  { id: 19, name: "Blueberry Milk Drink", category: "Non-Coffee", size: "16oz", price: 94, type: "iced", coffee: false },
  { id: 20, name: "Mixed Berries Milk Drink", category: "Non-Coffee", size: "16oz", price: 94, type: "iced", coffee: false },
  { id: 21, name: "Strawberry Choco", category: "Non-Coffee", size: "16oz", price: 94, type: "iced", coffee: false },
  { id: 22, name: "Green Apple Soda", category: "Non-Coffee", size: "16oz", price: 84, type: "iced", coffee: false },
  { id: 23, name: "Blueberry Soda", category: "Non-Coffee", size: "16oz", price: 84, type: "iced", coffee: false },
  { id: 24, name: "Lychee Soda", category: "Non-Coffee", size: "16oz", price: 84, type: "iced", coffee: false },

  { id: 25, name: "Iced Matcha Latte", category: "Matcha Collection", size: "16oz", price: 104, type: "iced", coffee: false },
  { id: 26, name: "Iced Dirty Matcha", category: "Matcha Collection", size: "16oz", price: 114, type: "iced", coffee: true },
  { id: 27, name: "Iced Strawberry Matcha", category: "Matcha Collection", size: "16oz", price: 114, type: "iced", coffee: false },
  { id: 28, name: "Iced Blueberry Matcha", category: "Matcha Collection", size: "16oz", price: 114, type: "iced", coffee: false },
  { id: 29, name: "Iced Mixed Berries Matcha", category: "Matcha Collection", size: "16oz", price: 114, type: "iced", coffee: false },
  { id: 30, name: "Iced Strawberry Dirty Matcha", category: "Matcha Collection", size: "16oz", price: 124, type: "iced", coffee: true },

  { id: 31, name: "Oatside Spanish Latte", category: "Oatside Series", size: "16oz", price: 104, type: "iced", coffee: true },
  { id: 32, name: "Oatside Mocha", category: "Oatside Series", size: "16oz", price: 104, type: "iced", coffee: true },
  { id: 33, name: "Oatside Caramel Macchiato", category: "Oatside Series", size: "16oz", price: 114, type: "iced", coffee: true },
  { id: 34, name: "Oatside Matcha Latte", category: "Oatside Series", size: "16oz", price: 104, type: "iced", coffee: false },
  { id: 35, name: "Oatside Dirty Matcha", category: "Oatside Series", size: "16oz", price: 114, type: "iced", coffee: false },
  { id: 36, name: "Oatside Strawberry Mocha", category: "Oatside Series", size: "16oz", price: 114, type: "iced", coffee: true },
  { id: 37, name: "Oatside Strawberry Latte", category: "Oatside Series", size: "16oz", price: 114, type: "iced", coffee: true },
  { id: 38, name: "Oatside Strawberry Matcha", category: "Oatside Series", size: "16oz", price: 114, type: "iced", coffee: false },
  { id: 39, name: "Oatside Strawberry Dirty Matcha", category: "Oatside Series", size: "16oz", price: 124, type: "iced", coffee: true }
];

/* ================= DEVICE SETUP ================= */
const DEVICE_IDS = ["POS1", "POS2", "POS3"];

export default function App() {
  const [view, setView] = useState("cashier");
  const [deviceId, setDeviceId] = useState(localStorage.getItem("deviceId") || "");

  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  const [category, setCategory] = useState("All Products");
  const [search, setSearch] = useState("");

  const [orderType, setOrderType] = useState("dine-in");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [discount, setDiscount] = useState("");
  const [cash, setCash] = useState("");

  const [kitchenOrders, setKitchenOrders] = useState<any[]>([]);

  /* ================= OFFLINE QUEUE ================= */
  const getQueue = () => JSON.parse(localStorage.getItem("queue") || "[]");

  const saveQueue = (q: any[]) => localStorage.setItem("queue", JSON.stringify(q));

  const addToQueue = (order: any) => {
    const q = getQueue();
    q.push(order);
    saveQueue(q);
  };

  const syncQueue = async () => {
    if (!navigator.onLine) return;

    const q = getQueue();
    if (!q.length) return;

    const remaining = [];

    for (const o of q) {
      try {
        await fetch("/api/saveOrder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(o)
        });
      } catch {
        remaining.push(o);
      }
    }

    saveQueue(remaining);
  };

  useEffect(() => {
    window.addEventListener("online", syncQueue);
    syncQueue();

    return () => window.removeEventListener("online", syncQueue);
  }, []);

  /* ================= DEVICE INIT ================= */
  const initDevice = (id: string) => {
    localStorage.setItem("deviceId", id);
    setDeviceId(id);
  };

  /* ================= FILTER ================= */
  const baseFiltered = useMemo(() => {
    return products.filter(
      p =>
        (category === "All Products" || p.category === category) &&
        p.name.toLowerCase().includes(search.toLowerCase().trim())
    );
  }, [category, search]);

  /* ================= CART ================= */
  const addToCart = (item: any) => {
    setCart(prev => {
      const i = prev.findIndex(p => p.id === item.id && p.size === item.size);
      if (i !== -1) {
        const copy = [...prev];
        copy[i].qty++;
        return copy;
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  /* ================= CHECKOUT ================= */
  const generateOrderNumber = () => {
    return `${deviceId}-${Date.now()}`;
  };

  const checkout = async () => {
    if (!cart.length || !deviceId) return;

    const order = {
      orderNumber: generateOrderNumber(),
      deviceId,
      items: cart,
      orderType,
      deliveryFee: Number(deliveryFee || 0),
      discount: Number(discount || 0),
      cash: Number(cash || 0),
      synced: false,
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [order, ...prev]);
    setCart([]);

    if (navigator.onLine) {
      try {
        await fetch("/api/saveOrder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order)
        });
      } catch {
        addToQueue(order);
      }
    } else {
      addToQueue(order);
    }

    setCash("");
    setDiscount("");
    setDeliveryFee("");
  };

  /* ================= KITCHEN SYNC (POLLING) ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/getOrders");
        const data = await res.json();
        setKitchenOrders(data);
      } catch {}
    };

    load();
    const interval = setInterval(load, 5000);

    return () => clearInterval(interval);
  }, []);

  /* ================= UI ================= */
  if (!deviceId) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Select Device</h2>
        {DEVICE_IDS.map(id => (
          <button key={id} onClick={() => initDevice(id)}>
            {id}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", flexDirection: "row" }}>
      {/* SIDEBAR */}
      <div style={{ width: 200, padding: 10 }}>
        <h3>Coffee D' Titos</h3>
        <p>Device: {deviceId}</p>

        <button onClick={() => setView("cashier")}>Cashier</button>
        <button onClick={() => setView("kitchen")}>Kitchen</button>
        <button onClick={() => setView("admin")}>Admin</button>

        <hr />

        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {/* CASHIER */}
      {view === "cashier" && (
        <div style={{ flex: 1, display: "flex" }}>
          <div style={{ flex: 1, padding: 10 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" />

            {baseFiltered.map(p => (
              <div key={p.id}>
                {p.name} ₱{p.price}
                <button onClick={() => addToCart(p)}>Add</button>
              </div>
            ))}
          </div>

          <div style={{ width: 300, padding: 10 }}>
            <h3>Cart</h3>

            {cart.map((i, idx) => (
              <div key={idx}>{i.name} x{i.qty}</div>
            ))}

            <h4>Total Items: {cart.length}</h4>

            <button onClick={checkout}>Checkout</button>
          </div>
        </div>
      )}

      {/* KITCHEN */}
      {view === "kitchen" && (
        <div style={{ flex: 1, padding: 20 }}>
          <h2>Kitchen (Live)</h2>

          {kitchenOrders.map((o, i) => (
            <div key={i} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
              <b>{o.orderNumber}</b>
              <p>Device: {o.deviceId}</p>

              {o.items?.map((it: any, idx: number) => (
                <div key={idx}>{it.name} x{it.qty}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ADMIN */}
      {view === "admin" && (
        <div style={{ flex: 1, padding: 20 }}>
          <h2>Admin</h2>
          <p>Total Orders: {orders.length}</p>
        </div>
      )}
    </div>
  );
}
