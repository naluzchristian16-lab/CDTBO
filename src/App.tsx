import { useEffect, useMemo, useState } from "react";
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
  signOut,
  onAuthStateChanged
} from "firebase/auth";

/* ================= PRODUCTS (NO CUT) ================= */
const categories = [
  "All Products",
  "Hot Drinks",
  "Iced Coffee",
  "Non-Coffee",
  "Matcha Collection",
  "Oatside Series"
];

const products = [
  { id: 1, name: "Hot Americano", category: "Hot Drinks", size: "12oz", price: 69 },
  { id: 2, name: "Hot Spanish Latte", category: "Hot Drinks", size: "12oz", price: 79 },
  { id: 3, name: "Hot Mocha", category: "Hot Drinks", size: "12oz", price: 79 },
  { id: 11, name: "Iced Americano", category: "Iced Coffee", size: "16oz", price: 79 },
  { id: 12, name: "Iced Spanish Latte", category: "Iced Coffee", size: "16oz", price: 89 },
  { id: 18, name: "Strawberry Milk Drink", category: "Non-Coffee", size: "16oz", price: 79 },
  { id: 25, name: "Iced Matcha Latte", category: "Matcha Collection", size: "16oz", price: 89 }
];

const DEVICE_IDS = ["POS1", "POS2", "POS3"];

/* ================= ROLES ================= */
const roles = {
  "admin@cafe.com": "admin",
  "cashier@cafe.com": "cashier"
};

export default function App() {
  /* AUTH */
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* POS */
  const [view, setView] = useState("cashier");
  const [deviceId, setDeviceId] = useState(localStorage.getItem("deviceId") || "");

  const [orders, setOrders] = useState([]);
  const [kitchenOrders, setKitchenOrders] = useState([]);
  const [cart, setCart] = useState([]);

  const [orderType, setOrderType] = useState("dine-in");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [discount, setDiscount] = useState("");
  const [cash, setCash] = useState("");

  const [category, setCategory] = useState("All Products");
  const [search, setSearch] = useState("");

  /* ================= LOGIN LISTENER ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);

      if (u?.email && roles[u.email]) {
        setRole(roles[u.email]);
      } else {
        setRole("cashier");
      }
    });

    return () => unsub();
  }, []);

  /* ================= FIREBASE REALTIME ================= */
  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubKitchen = onSnapshot(collection(db, "kitchenOrders"), (snap) => {
      setKitchenOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubOrders();
      unsubKitchen();
    };
  }, []);

  /* ================= LOGIN ================= */
  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      alert("Login failed");
    }
  };

  const logout = () => signOut(auth);

  /* ================= DEVICE ================= */
  const initDevice = (id) => {
    localStorage.setItem("deviceId", id);
    setDeviceId(id);
  };

  /* ================= CART ================= */
  const makeKey = (i) =>
    `${i.id}-${i.sizeType}-${i.sizeExtra}-${(i.addons || []).join("|")}`;

  const addToCart = (item, sizeType, sizeExtra = 0) => {
    setCart(prev => {
      const newItem = { ...item, qty: 1, sizeType, sizeExtra, addons: [] };

      const idx = prev.findIndex(p => makeKey(p) === makeKey(newItem));

      if (idx !== -1) {
        const copy = [...prev];
        copy[idx].qty += 1;
        return copy;
      }

      return [...prev, newItem];
    });
  };

  const updateQty = (i, d) => {
    setCart(prev => {
      const copy = [...prev];
      copy[i].qty += d;
      if (copy[i].qty <= 0) copy.splice(i, 1);
      return copy;
    });
  };

  const toggleExtraShot = (i) => {
    setCart(prev => {
      const copy = [...prev];
      const item = { ...copy[i] };

      const addons = item.addons || [];

      item.addons = addons.includes("Extra Shot")
        ? addons.filter(a => a !== "Extra Shot")
        : [...addons, "Extra Shot"];

      copy[i] = item;
      return copy;
    });
  };

  /* ================= TOTAL ================= */
  const computeItem = (i) => {
    const base = i.price * i.qty;
    const size = (i.sizeExtra || 0) * i.qty;
    const addon = (i.addons?.includes("Extra Shot") ? 10 : 0) * i.qty;
    return base + size + addon;
  };

  const cartTotal = cart.reduce((a, b) => a + computeItem(b), 0);

  const total = cartTotal + Number(deliveryFee || 0) - Number(discount || 0);
  const change = cash ? Number(cash) - total : 0;

  /* ================= CHECKOUT ================= */
  const checkout = async () => {
    if (!cart.length) return;

    const order = {
      deviceId,
      items: cart,
      orderType,
      deliveryFee: Number(deliveryFee || 0),
      discount: Number(discount || 0),
      cash: Number(cash || 0),
      total,
      status: "ongoing",
      createdAt: Date.now()
    };

    const ref = await addDoc(collection(db, "orders"), order);
    await addDoc(collection(db, "kitchenOrders"), { ...order, id: ref.id });

    setCart([]);
    setCash("");
    setDiscount("");
    setDeliveryFee("");
  };

  /* ================= DONE ================= */
  const markDone = async (id) => {
    await updateDoc(doc(db, "orders", id), { status: "done" });
    await updateDoc(doc(db, "kitchenOrders", id), { status: "done" });
  };

  const filtered = useMemo(() => {
    return products.filter(p =>
      (category === "All Products" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [category, search]);

  /* ================= LOGIN SCREEN ================= */
  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>POS LOGIN</h2>

        <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />

        <button onClick={login}>Login</button>
      </div>
    );
  }

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

  /* ================= UI ================= */
  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* SIDEBAR */}
      <div style={{ width: 220 }}>
        <h3>POS</h3>

        <button onClick={() => setView("cashier")}>Cashier</button>

        {role === "admin" && (
          <button onClick={() => setView("admin")}>Admin</button>
        )}

        <button onClick={() => setView("kitchen")}>Kitchen</button>
        <button onClick={logout}>Logout</button>

        <hr />

        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {/* CASHIER */}
      {view === "cashier" && (
        <div style={{ display: "flex", flex: 1 }}>
          <div style={{ flex: 1 }}>
            {filtered.map(p => (
              <div key={p.id}>
                {p.name} ₱{p.price}
                <button onClick={() => addToCart(p, "Regular", 0)}>Add</button>
              </div>
            ))}
          </div>

          <div style={{ width: 300 }}>
            {cart.map((i, idx) => (
              <div key={idx}>
                {i.name} x{i.qty}
                <button onClick={() => updateQty(idx, -1)}>-</button>
                <button onClick={() => updateQty(idx, 1)}>+</button>
              </div>
            ))}

            <h3>Total: ₱{total}</h3>
            <button onClick={checkout}>Checkout</button>
          </div>
        </div>
      )}

      {/* KITCHEN */}
      {view === "kitchen" && (
        <div>
          {kitchenOrders.filter(o => o.status !== "done").map(o => (
            <div key={o.id}>
              {o.id}
              <button onClick={() => markDone(o.id)}>Done</button>
            </div>
          ))}
        </div>
      )}

      {/* ADMIN */}
      {view === "admin" && role === "admin" && (
        <div>
          {orders.filter(o => o.status === "done").map(o => (
            <div key={o.id}>
              {o.id} - ₱{o.total}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
