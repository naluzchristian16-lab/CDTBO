import { useEffect, useMemo, useState } from "react";
import { db } from "./firebase";

import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";

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
  { id: 1, name: "Hot Americano", category: "Hot Drinks", size: "12oz", price: 69 },
  { id: 2, name: "Hot Spanish Latte", category: "Hot Drinks", size: "12oz", price: 79 },
  { id: 3, name: "Hot Mocha", category: "Hot Drinks", size: "12oz", price: 79 },
  { id: 11, name: "Iced Americano", category: "Iced Coffee", size: "16oz", price: 79 },
  { id: 12, name: "Iced Spanish Latte", category: "Iced Coffee", size: "16oz", price: 89 },
  { id: 18, name: "Strawberry Milk Drink", category: "Non-Coffee", size: "16oz", price: 79 },
  { id: 25, name: "Iced Matcha Latte", category: "Matcha Collection", size: "16oz", price: 89 }
];

/* ================= DEVICE ================= */
const DEVICE_IDS = ["POS1", "POS2", "POS3"];

export default function App() {
  const [view, setView] = useState("cashier");
  const [deviceId, setDeviceId] = useState(localStorage.getItem("deviceId") || "");

  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);

  const [category, setCategory] = useState("All Products");
  const [search, setSearch] = useState("");

  const [orderType, setOrderType] = useState("dine-in");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [discount, setDiscount] = useState("");
  const [cash, setCash] = useState("");

  /* ================= FIREBASE LIVE LISTENER ================= */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      setOrders(data);
    });

    return () => unsub();
  }, []);

  /* ================= DEVICE ================= */
  const initDevice = (id: string) => {
    localStorage.setItem("deviceId", id);
    setDeviceId(id);
  };

  /* ================= CART KEY ================= */
  const makeKey = (item: any) => {
    const addons = item.addons ? [...item.addons].sort().join("|") : "";
    return `${item.id}-${item.sizeType}-${item.sizeExtra}-${addons}`;
  };

  /* ================= ADD TO CART ================= */
  const addToCart = (item: any, sizeType: string, sizeExtra = 0) => {
    setCart((prev: any[]) => {
      const newItem = {
        ...item,
        qty: 1,
        sizeType,
        sizeExtra,
        addons: []
      };

      const idx = prev.findIndex(p => makeKey(p) === makeKey(newItem));

      if (idx !== -1) {
        const copy = [...prev];
        copy[idx].qty += 1;
        return copy;
      }

      return [...prev, newItem];
    });
  };

  /* ================= CART ACTIONS ================= */
  const updateQty = (idx: number, delta: number) => {
    setCart((prev: any[]) => {
      const copy = [...prev];
      copy[idx].qty += delta;
      if (copy[idx].qty <= 0) copy.splice(idx, 1);
      return copy;
    });
  };

  const toggleExtraShot = (idx: number) => {
    setCart((prev: any[]) => {
      const copy = [...prev];
      const item = { ...copy[idx] };

      const addons = item.addons || [];

      if (addons.includes("Extra Shot")) {
        item.addons = addons.filter((a: string) => a !== "Extra Shot");
      } else {
        item.addons = [...addons, "Extra Shot"];
      }

      copy[idx] = item;
      return copy;
    });
  };

  /* ================= COMPUTE ================= */
  const computeItem = (item: any) => {
    const base = item.price * item.qty;
    const size = (item.sizeExtra || 0) * item.qty;
    const addon = (item.addons?.includes("Extra Shot") ? 10 : 0) * item.qty;
    return base + size + addon;
  };

  const cartTotal = cart.reduce((a, b) => a + computeItem(b), 0);

  const total =
    cartTotal +
    Number(deliveryFee || 0) -
    Number(discount || 0);

  const change = cash ? Number(cash) - total : 0;

  /* ================= CHECKOUT ================= */
  const checkout = async () => {
    if (!cart.length) return;

    const order = {
      orderNumber: `${deviceId}-${Date.now()}`,
      deviceId,
      items: cart,
      orderType,
      deliveryFee: Number(deliveryFee || 0),
      discount: Number(discount || 0),
      cash: Number(cash || 0),
      total,
      status: "pending",
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, "orders"), order);

    setCart([]);
    setCash("");
    setDiscount("");
    setDeliveryFee("");
  };

  /* ================= STATUS UPDATE ================= */
  const markDone = async (id: string) => {
    await updateDoc(doc(db, "orders", id), {
      status: "done"
    });
  };

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    return products.filter(p =>
      (category === "All Products" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [category, search]);

  const kitchenOrders = orders.filter(o => o.status !== "done");
  const doneOrders = orders.filter(o => o.status === "done");

  /* ================= DEVICE SELECT ================= */
  if (!deviceId) {
    return (
      <div>
        <h2>Select POS</h2>
        {DEVICE_IDS.map(id => (
          <button key={id} onClick={() => initDevice(id)}>
            {id}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* SIDEBAR */}
      <div style={{ width: 220, padding: 10 }}>
        <h3>Coffee D' Titos</h3>

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
            <input
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            {filtered.map(p => (
              <div key={p.id}>
                {p.name} ₱{p.price}

                <button onClick={() => addToCart(p, "Malaki", 0)}>Malaki</button>
                <button onClick={() => addToCart(p, "Mas Malaki", 10)}>Mas Malaki +10</button>
              </div>
            ))}
          </div>

          {/* CART */}
          <div style={{ width: 320, padding: 10 }}>
            <h3>Cart</h3>

            {cart.map((i, idx) => (
              <div key={idx} style={{ border: "1px solid #eee", marginBottom: 10, padding: 8 }}>
                <b>{i.name}</b>

                <div>Qty: {i.qty}</div>

                <div>₱{computeItem(i)}</div>

                {i.addons?.length > 0 && (
                  <div style={{ color: "green" }}>{i.addons.join(", ")}</div>
                )}

                <button onClick={() => updateQty(idx, -1)}>-</button>
                <button onClick={() => updateQty(idx, 1)}>+</button>
                <button onClick={() => toggleExtraShot(idx)}>Extra Shot</button>
              </div>
            ))}

            <hr />

            <select value={orderType} onChange={e => setOrderType(e.target.value)}>
              <option value="dine-in">Dine-in</option>
              <option value="take-out">Take-out</option>
              <option value="delivery">Delivery</option>
            </select>

            {orderType === "delivery" && (
              <input placeholder="Delivery Fee" value={deliveryFee} onChange={e => setDeliveryFee(e.target.value)} />
            )}

            <input placeholder="Discount" value={discount} onChange={e => setDiscount(e.target.value)} />
            <input placeholder="Cash" value={cash} onChange={e => setCash(e.target.value)} />

            <h3>Total: ₱{total}</h3>
            {cash && <div>Change: ₱{change}</div>}

            <button onClick={checkout}>Checkout</button>
          </div>
        </div>
      )}

      {/* KITCHEN */}
      {view === "kitchen" && (
        <div style={{ flex: 1, padding: 20 }}>
          <h2>Kitchen</h2>

          {kitchenOrders.map(o => (
            <div key={o.id} style={{ border: "1px solid #ddd", marginBottom: 10, padding: 10 }}>
              <b>{o.orderNumber}</b>

              {o.items.map((i: any, idx: number) => (
                <div key={idx}>
                  {i.name} x{i.qty} ({i.sizeType})
                  {i.addons?.length > 0 && ` | ${i.addons.join(", ")}`}
                </div>
              ))}

              <button onClick={() => markDone(o.id)}>Done</button>
            </div>
          ))}
        </div>
      )}

      {/* ADMIN */}
      {view === "admin" && (
        <div style={{ flex: 1, padding: 20 }}>
          <h2>Completed Orders</h2>

          {doneOrders.map(o => (
            <div key={o.id} style={{ border: "1px solid #ddd", marginBottom: 10, padding: 10 }}>
              <b>{o.orderNumber}</b>
              <div>Total: ₱{o.total}</div>
              <div>Cash: ₱{o.cash}</div>
              <div>Change: ₱{o.cash - o.total}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
