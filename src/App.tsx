import { useMemo, useEffect, useState } from "react";
import { db, auth } from "./firebase";

import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc
} from "firebase/firestore";

import {
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

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
  { id: 1, name: "Hot Americano", category: "Hot Drinks", size: "12oz", price: 69, coffee: true },
  { id: 2, name: "Hot Spanish Latte", category: "Hot Drinks", size: "12oz", price: 79, coffee: true },
  { id: 3, name: "Hot Mocha", category: "Hot Drinks", size: "12oz", price: 79, coffee: true },
  { id: 4, name: "Hot Caramel Macchiato", category: "Hot Drinks", size: "12oz", price: 89, coffee: true },

  { id: 11, name: "Iced Americano", category: "Iced Coffee", size: "16oz", price: 79, coffee: true },
  { id: 12, name: "Iced Spanish Latte", category: "Iced Coffee", size: "16oz", price: 89, coffee: true },

  { id: 18, name: "Strawberry Milk Drink", category: "Non-Coffee", size: "16oz", price: 79, coffee: false },
  { id: 25, name: "Iced Matcha Latte", category: "Matcha Collection", size: "16oz", price: 89, coffee: false }
];

/* ================= DEVICES ================= */
const DEVICE_IDS = ["POS1", "POS2", "POS3"];

export default function App() {

  /* ================= AUTH ================= */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);

  /* ================= POS ================= */
  const [view, setView] = useState("cashier");

  const [deviceId, setDeviceId] = useState(
    localStorage.getItem("deviceId") || ""
  );

  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  const [category, setCategory] = useState("All Products");
  const [search, setSearch] = useState("");

  const [orderType, setOrderType] = useState("dine-in");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [discount, setDiscount] = useState("");
  const [cash, setCash] = useState("");

  const [orderCounter, setOrderCounter] = useState(1);

  /* ================= LIVE ORDERS ================= */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snap) => {
      setOrders(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data()
        }))
      );
    });

    return () => unsub();
  }, []);

  /* ================= ORDER COUNTER ================= */
  useEffect(() => {
    if (!orders.length || !deviceId) return;

    const today = new Date();

    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yy = String(today.getFullYear()).slice(-2);

    const posCode = deviceId.replace("POS", "P");
    const prefix = `${mm}${dd}${yy}-${posCode}-`; // FIXED MMDDYY

    const todayOrders = orders.filter((o: any) =>
      o.orderNumber?.startsWith(prefix)
    );

    if (todayOrders.length > 0) {
      const numbers = todayOrders.map((o: any) =>
        Number(o.orderNumber.split("-")[2])
      );

      const max = Math.max(...numbers);
      setOrderCounter(max + 1);
    }
  }, [orders, deviceId]);

  /* ================= LOGIN ================= */
  const login = async () => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      setUser(res.user);
    } catch {
      alert("Invalid login");
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const initDevice = (id: string) => {
    localStorage.setItem("deviceId", id);
    setDeviceId(id);
  };

  /* ================= CART ================= */
  const makeKey = (item: any) => {
    const addons = item.addons ? [...item.addons].sort().join("|") : "";
    return `${item.id}-${item.sizeType}-${item.sizeExtra}-${addons}`;
  };

  const addToCart = (item: any, sizeType: string, sizeExtra = 0) => {
    setCart(prev => {
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

  const updateQty = (idx: number, delta: number) => {
    setCart(prev => {
      const copy = [...prev];
      copy[idx].qty += delta;
      if (copy[idx].qty <= 0) copy.splice(idx, 1);
      return copy;
    });
  };

  const toggleExtraShot = (idx: number) => {
    setCart(prev => {
      const copy = [...prev];
      const item = { ...copy[idx] };

      const addons = item.addons || [];

      item.addons = addons.includes("Extra Shot")
        ? addons.filter((a: string) => a !== "Extra Shot")
        : [...addons, "Extra Shot"];

      copy[idx] = item;
      return copy;
    });
  };

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

    const now = new Date();

    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);

    const posCode = deviceId.replace("POS", "P");
    const orderNo = String(orderCounter).padStart(4, "0");

    const finalOrderNumber = `${mm}${dd}${yy}-${posCode}-${orderNo}`;

    const order = {
      orderNumber: finalOrderNumber,
      deviceId,
      items: cart,
      orderType,
      deliveryFee: Number(deliveryFee || 0),
      discount: Number(discount || 0),
      cash: Number(cash || 0),
      total,
      status: "pending",
      createdAt: Date.now()
    };

    await addDoc(collection(db, "orders"), order);

    setOrderCounter(prev => prev + 1);

    setCart([]);
    setCash("");
    setDiscount("");
    setDeliveryFee("");
  };

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "orders", id), { status });
  };

  const filtered = useMemo(() => {
    return products.filter(p =>
      (category === "All Products" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [category, search]);

  const activeOrders = orders.filter(o => o.status !== "completed");
  const completedOrders = orders.filter(o => o.status === "completed");

  /* ================= KITCHEN FORMAT ================= */
  const formatTicket = (o: any) => {
    const items = o.items
      .map((i: any) => {
        const size = i.sizeType;
        const extra = i.addons?.includes("Extra Shot") ? ", Extra Shot" : "";
        return `${i.name} (${size}${extra}) x${i.qty}`;
      })
      .join("\n");

    return `${items}\nType: ${o.orderType}\nTotal Price: ₱${o.total}`;
  };

  if (!user) return (
    <div style={{ padding: 40 }}>
      <h1>CDT POS Login</h1>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <br /><br />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <br /><br />
      <button onClick={login}>Login</button>
    </div>
  );

  if (!deviceId) return (
    <div style={{ padding: 40 }}>
      <h2>Select POS</h2>
      {DEVICE_IDS.map(id => (
        <button key={id} onClick={() => initDevice(id)}>{id}</button>
      ))}
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* SIDEBAR */}
      <div style={{ width: 220, padding: 10, borderRight: "1px solid #ddd" }}>
        <h3>Coffee D' Titos</h3>

        <button onClick={() => setView("cashier")}>Cashier</button>
        <button onClick={() => setView("kitchen")}>Kitchen</button>
        <button onClick={() => setView("admin")}>Admin</button>
        <button onClick={logout}>Logout</button>

        <hr />

        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      {/* CASHIER */}
      {view === "cashier" && (
        <div style={{ flex: 1, display: "flex" }}>

          <div style={{ flex: 1, padding: 10 }}>
            <input placeholder="Search" value={search} onChange={e => setSearch(e.target.value)} />

            {filtered.map(p => (
              <div key={p.id} style={{ border: "1px solid #ddd", padding: 10 }}>
                <b>{p.name}</b>
                <div>₱{p.price}</div>

                <button onClick={() => addToCart(p, "Malaki", 0)}>Malaki</button>
                <button onClick={() => addToCart(p, "Mas Malaki", 10)}>Mas Malaki +10</button>
              </div>
            ))}
          </div>

          <div style={{ width: 320, padding: 10 }}>
            <h3>Cart</h3>

            {cart.map((i, idx) => (
              <div key={idx} style={{ border: "1px solid #ddd", padding: 10 }}>
                <b>{i.name}</b>
                <div>Qty: {i.qty}</div>

                <button onClick={() => updateQty(idx, -1)}>-</button>
                <button onClick={() => updateQty(idx, 1)}>+</button>

                {i.coffee && (
                  <button onClick={() => toggleExtraShot(idx)}>
                    {i.addons?.includes("Extra Shot") ? "✓ Extra Shot" : "Extra Shot"}
                  </button>
                )}

                {i.addons?.includes("Extra Shot") && (
                  <div style={{ color: "green" }}>✓ Extra Shot</div>
                )}

                <div>₱{computeItem(i)}</div>
              </div>
            ))}

            <h3>Total: ₱{total}</h3>
            <button onClick={checkout}>Checkout</button>
          </div>
        </div>
      )}

      {/* KITCHEN */}
      {view === "kitchen" && (
        <div style={{ flex: 1, padding: 20 }}>
          <h2>Kitchen</h2>

          {activeOrders.map(o => (
            <div key={o.id} style={{ border: "1px solid #ddd", marginBottom: 10, padding: 10 }}>
              
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {formatTicket(o)}
              </pre>

              <button onClick={() => updateStatus(o.id, "completed")}>
                Complete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ADMIN */}
      {view === "admin" && (
        <div style={{ flex: 1, padding: 20 }}>
          <h2>Completed Orders</h2>

          {completedOrders.map(o => (
            <div key={o.id} style={{ border: "1px solid #ddd", padding: 10 }}>
              <h3>{o.orderNumber}</h3>

              <div>Type: {o.orderType}</div>
              <div>Status: {o.status}</div>

              <hr />

              {o.items.map((i: any, idx: number) => (
                <div key={idx}>
                  {i.name} x{i.qty} ({i.sizeType})
                  {i.addons?.includes("Extra Shot") && " ✓ Extra Shot"}
                  <div>₱{computeItem(i)}</div>
                </div>
              ))}

              <hr />
              <div>Discount: ₱{o.discount}</div>
              <div>Delivery Fee: ₱{o.deliveryFee}</div>
              <h3>Total: ₱{o.total}</h3>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
