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

/* ================= PRODUCTS (FULL LIST) ================= */
const products = [
  /* ================= HOT COFFEE ================= */
  { id: "hot_americano_12oz", name: "Hot Americano 12oz", category: "Hot Drinks", coffee: true, singleSize: true, size: { label: "12oz", price: 69 } },
  { id: "hot_spanish_latte_12oz", name: "Hot Spanish Latte 12oz", category: "Hot Drinks", coffee: true, singleSize: true, size: { label: "12oz", price: 79 } },
  { id: "hot_mocha_12oz", name: "Hot Mocha 12oz", category: "Hot Drinks", coffee: true, singleSize: true, size: { label: "12oz", price: 79 } },
  { id: "hot_caramel_macchiato_12oz", name: "Hot Caramel Macchiato 12oz", category: "Hot Drinks", coffee: true, singleSize: true, size: { label: "12oz", price: 89 } },
  { id: "hot_dirty_matcha_12oz", name: "Hot Dirty Matcha 12oz", category: "Hot Drinks", coffee: true, singleSize: true, size: { label: "12oz", price: 89 } },
  { id: "hot_matcha_latte_12oz", name: "Hot Matcha Latte 12oz", category: "Hot Drinks", coffee: false, singleSize: true, size: { label: "12oz", price: 79 } },
  { id: "hot_strawberry_dirty_matcha_12oz", name: "Hot Strawberry Dirty Matcha 12oz", category: "Hot Drinks", coffee: false, singleSize: true, size: { label: "12oz", price: 99 } },
  { id: "hot_strawberry_mocha_12oz", name: "Hot Strawberry Mocha 12oz", category: "Hot Drinks", coffee: true, singleSize: true, size: { label: "12oz", price: 89 } },
  { id: "hot_strawberry_latte_12oz", name: "Hot Strawberry Latte 12oz", category: "Hot Drinks", coffee: false, singleSize: true, size: { label: "12oz", price: 89 } },
  { id: "hot_strawberry_matcha_12oz", name: "Hot Strawberry Matcha 12oz", category: "Hot Drinks", coffee: false, singleSize: true, size: { label: "12oz", price: 89 } },

  /* ================= ICED COFFEE ================= */
  {
    id: "iced_americano",
    name: "Iced Americano",
    category: "Iced Coffee",
    coffee: true,
    sizes: [
      { label: "Malaki", price: 89 },
      { label: "Mas Malaki", price: 99 }
    ]
  },
  {
    id: "iced_americano_20",
    name: "Iced Americano 20oz",
    category: "Iced Coffee",
    coffee: true,
    sizes: [
      { label: "Malaki", price: 89 },
      { label: "Mas Malaki", price: 99 }
    ]
  },
  {
    id: "iced_spanish_latte",
    name: "Iced Spanish Latte",
    category: "Iced Coffee",
    coffee: true,
    sizes: [
      { label: "Malaki", price: 89 },
      { label: "Mas Malaki", price: 99 }
    ]
  },
  {
    id: "iced_mocha",
    name: "Iced Mocha",
    category: "Iced Coffee",
    coffee: true,
    sizes: [
      { label: "Malaki", price: 89 },
      { label: "Mas Malaki", price: 99 }
    ]
  },
  {
    id: "iced_caramel_macchiato",
    name: "Iced Caramel Macchiato",
    category: "Iced Coffee",
    coffee: true,
    sizes: [
      { label: "Malaki", price: 99 },
      { label: "Mas Malaki", price: 109 }
    ]
  },
  {
    id: "iced_strawberry_latte",
    name: "Iced Strawberry Latte",
    category: "Iced Coffee",
    coffee: false,
    sizes: [
      { label: "Malaki", price: 99 },
      { label: "Mas Malaki", price: 109 }
    ]
  },
  {
    id: "iced_strawberry_mocha",
    name: "Iced Strawberry Mocha",
    category: "Iced Coffee",
    coffee: true,
    sizes: [
      { label: "Malaki", price: 99 },
      { label: "Mas Malaki", price: 109 }
    ]
  },

  /* ================= MATCHA ================= */
  {
    id: "iced_matcha_latte",
    name: "Iced Matcha Latte",
    category: "Matcha Collection",
    coffee: false,
    sizes: [
      { label: "Malaki", price: 89 },
      { label: "Mas Malaki", price: 99 }
    ]
  },

  /* ================= OATSIDE ================= */
  {
    id: "oatside_spanish_latte",
    name: "Oatside Spanish Latte",
    category: "Oatside Series",
    coffee: true,
    sizes: [
      { label: "Malaki", price: 99 },
      { label: "Mas Malaki", price: 109 }
    ]
  }
];

/* ================= DEVICE IDS ================= */
const DEVICE_IDS = ["POS1", "POS2", "POS3"];

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

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

  /* ================= FIRESTORE ================= */
  useEffect(() => {
    return onSnapshot(collection(db, "orders"), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  /* ================= AUTH ================= */
  const login = async () => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    setUser(res.user);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const initDevice = (id) => {
    localStorage.setItem("deviceId", id);
    setDeviceId(id);
  };

  /* ================= CART ================= */
  const makeKey = (item) => {
    const addons = item.addons ? item.addons.join("|") : "";
    return `${item.id}-${item.sizeType}-${addons}`;
  };

  const addToCart = (item, sizeLabel, price) => {
    setCart(prev => {
      const newItem = { ...item, qty: 1, sizeType: sizeLabel, price, addons: [] };

      const idx = prev.findIndex(p => makeKey(p) === makeKey(newItem));

      if (idx !== -1) {
        const copy = [...prev];
        copy[idx].qty += 1;
        return copy;
      }

      return [...prev, newItem];
    });
  };

  const updateQty = (idx, delta) => {
    setCart(prev => {
      const copy = [...prev];
      copy[idx].qty += delta;
      if (copy[idx].qty <= 0) copy.splice(idx, 1);
      return copy;
    });
  };

  const toggleExtraShot = (idx) => {
    setCart(prev => {
      const copy = [...prev];
      const item = { ...copy[idx] };

      item.addons = item.addons?.includes("Extra Shot")
        ? item.addons.filter(a => a !== "Extra Shot")
        : [...(item.addons || []), "Extra Shot"];

      copy[idx] = item;
      return copy;
    });
  };

  const computeItem = (item) => {
    const base = item.price * item.qty;
    const addon = item.addons?.includes("Extra Shot") ? 10 * item.qty : 0;
    return base + addon;
  };

  const subtotal = cart.reduce((a, b) => a + computeItem(b), 0);

  const total =
    subtotal +
    Number(deliveryFee || 0) -
    Number(discount || 0);

  const change = cash ? Number(cash) - total : 0;

  /* ================= CHECKOUT ================= */
  const checkout = async () => {
    const order = {
      orderNumber: `${Date.now()}`,
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

    setCart([]);
    setCash("");
    setDiscount("");
    setDeliveryFee("");
  };

  const filtered = useMemo(() => {
    return products.filter(p =>
      (category === "All Products" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [category, search]);

  const activeOrders = orders.filter(o => o.status !== "completed");
  const completedOrders = orders.filter(o => o.status === "completed");

  /* ================= UI ================= */
  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <h1>POS Login</h1>
        <input onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" onChange={e => setPassword(e.target.value)} placeholder="Password" />
        <button onClick={login}>Login</button>
      </div>
    );
  }

  if (!deviceId) {
    return (
      <div style={{ padding: 40 }}>
        {DEVICE_IDS.map(id => (
          <div key={id}>
            <button onClick={() => initDevice(id)}>{id}</button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* SIDEBAR */}
      <div style={{ width: 220, borderRight: "1px solid #ddd" }}>
        <h3>Coffee D' Titos</h3>

        <button onClick={() => setView("cashier")}>Cashier</button>
        <button onClick={() => setView("kitchen")}>Kitchen</button>
        <button onClick={() => setView("admin")}>Admin</button>
        <button onClick={logout}>Logout</button>

        <hr />

        {categories.map(c => (
          <div key={c}>
            <button style={{ width: "100%" }} onClick={() => setCategory(c)}>
              {c}
            </button>
          </div>
        ))}
      </div>

      {/* CASHIER */}
      {view === "cashier" && (
        <div style={{ flex: 1, display: "flex" }}>

          <div style={{ flex: 1 }}>
            <input onChange={e => setSearch(e.target.value)} placeholder="Search" />

            {filtered.map(p => (
              <div key={p.id} style={{ border: "1px solid #ddd", padding: 10 }}>

                <div style={{ fontWeight: "bold" }}>{p.name}</div>

                <div>
                  {p.singleSize ? (
                    <button onClick={() => addToCart(p, p.size.label, p.size.price)}>
                      {p.size.label} ₱{p.size.price}
                    </button>
                  ) : (
                    <div>
                      {p.sizes.map(s => (
                        <div key={s.label}>
                          <button onClick={() => addToCart(p, s.label, s.price)}>
                            {s.label} ₱{s.price}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>

          {/* CART */}
          <div style={{ width: 320, borderLeft: "1px solid #ddd", padding: 10 }}>

            <h3>Cart</h3>

            <div>
              Order Type:
              <select value={orderType} onChange={e => setOrderType(e.target.value)}>
                <option value="dine-in">Dine-in</option>
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>

            <input placeholder="Discount" value={discount} onChange={e => setDiscount(e.target.value)} />
            <input placeholder="Cash" value={cash} onChange={e => setCash(e.target.value)} />

            <hr />

            {cart.map((i, idx) => (
              <div key={idx} style={{ border: "1px solid #ddd", padding: 10 }}>

                <b>{i.name}</b>
                <div>{i.sizeType}</div>

                {i.addons?.includes("Extra Shot") && (
                  <div style={{ color: "green" }}>+ Extra Shot</div>
                )}

                <button onClick={() => updateQty(idx, -1)}>-</button>
                <button onClick={() => updateQty(idx, 1)}>+</button>

                {i.coffee && (
                  <button onClick={() => toggleExtraShot(idx)}>
                    Extra Shot
                  </button>
                )}

                <div>₱{computeItem(i)}</div>

              </div>
            ))}

            <h3>Total: ₱{total}</h3>
            <div>Change: ₱{change}</div>

            <button onClick={checkout} style={{ width: "100%" }}>
              Checkout
            </button>

          </div>

        </div>
      )}

      {/* KITCHEN */}
      {view === "kitchen" && (
        <div style={{ flex: 1 }}>
          {activeOrders.map(o => (
            <div key={o.id}>
              <h3>{o.orderNumber}</h3>
              {o.items.map((i, idx) => (
                <div key={idx}>
                  {i.name} ({i.sizeType}) x{i.qty}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ADMIN */}
      {view === "admin" && (
        <div style={{ flex: 1 }}>
          {completedOrders.map(o => (
            <div key={o.id}>
              <h3>{o.orderNumber}</h3>
              <div>Total: ₱{o.total}</div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
