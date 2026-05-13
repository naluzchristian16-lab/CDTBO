import { useEffect, useMemo, useState } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  setDoc
} from "firebase/firestore";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

/* ================= PRODUCTS (HINDI BINAWASAN) ================= */
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

export default function App() {
  const [user, setUser] = useState(null);

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

  /* ================= LOGIN ================= */
  useEffect(() => {
    signInAnonymously(auth);

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => unsub();
  }, []);

  /* ================= REALTIME FIREBASE ================= */
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

  /* ================= DEVICE ================= */
  const initDevice = (id) => {
    localStorage.setItem("deviceId", id);
    setDeviceId(id);
  };

  /* ================= CART ================= */
  const makeKey = (item) =>
    `${item.id}-${item.sizeType}-${item.sizeExtra}-${(item.addons || []).join("|")}`;

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
  const computeItem = (item) => {
    const base = item.price * item.qty;
    const size = (item.sizeExtra || 0) * item.qty;
    const addon = (item.addons?.includes("Extra Shot") ? 10 : 0) * item.qty;
    return base + size + addon;
  };

  const cartTotal = cart.reduce((a, b) => a + computeItem(b), 0);

  const total = cartTotal + Number(deliveryFee || 0) - Number(discount || 0);
  const change = cash ? Number(cash) - total : 0;

  /* ================= CHECKOUT (REALTIME FIREBASE WRITE) ================= */
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

    await addDoc(collection(db, "orders"), order);
    await addDoc(collection(db, "kitchenOrders"), order);

    setCart([]);
    setCash("");
    setDiscount("");
    setDeliveryFee("");
  };

  /* ================= DONE STATUS ================= */
  const markDone = async (id) => {
    const ref1 = doc(db, "orders", id);
    const ref2 = doc(db, "kitchenOrders", id);

    await updateDoc(ref1, { status: "done" });
    await updateDoc(ref2, { status: "done" });
  };

  const filtered = useMemo(() => {
    return products.filter(p =>
      (category === "All Products" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [category, search]);

  /* ================= LOGIN SCREEN ================= */
  if (!user) return <h2>Loading POS...</h2>;

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
        <div style={{ display: "flex", flex: 1 }}>
          
          <div style={{ flex: 1 }}>
            {filtered.map(p => (
              <div key={p.id}>
                {p.name} ₱{p.price}
                <button onClick={() => addToCart(p, "Regular", 0)}>Add</button>
              </div>
            ))}
          </div>

          {/* CART */}
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
          {kitchenOrders
            .filter(o => o.status !== "done")
            .map(o => (
              <div key={o.id}>
                <b>{o.id}</b>
                <button onClick={() => markDone(o.id)}>Done</button>
              </div>
            ))}
        </div>
      )}

      {/* ADMIN */}
      {view === "admin" && (
        <div>
          {orders
            .filter(o => o.status === "done")
            .map(o => (
              <div key={o.id}>
                <b>{o.id}</b>
                <div>Total: ₱{o.total}</div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
