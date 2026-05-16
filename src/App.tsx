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
  /* ================= HOT COFFEE ================= */
  {
    id: "hot_americano_12oz",
    name: "Hot Americano",
    category: "Hot Drinks",
    coffee: true,
    singleSize: true,
    size: { label: "12oz", price: 69 }
  },
  {
    id: "hot_spanish_latte_12oz",
    name: "Hot Spanish Latte",
    category: "Hot Drinks",
    coffee: true,
    singleSize: true,
    size: { label: "12oz", price: 79 }
  },
  {
    id: "hot_mocha_12oz",
    name: "Hot Mocha",
    category: "Hot Drinks",
    coffee: true,
    singleSize: true,
    size: { label: "12oz", price: 79 }
  },
  {
    id: "hot_caramel_macchiato_12oz",
    name: "Hot Caramel Macchiato",
    category: "Hot Drinks",
    coffee: true,
    singleSize: true,
    size: { label: "12oz", price: 89 }
  },
  {
    id: "hot_dirty_matcha_12oz",
    name: "Hot Dirty Matcha",
    category: "Hot Drinks",
    coffee: true,
    singleSize: true,
    size: { label: "12oz", price: 89 }
  },
  {
    id: "hot_matcha_latte_12oz",
    name: "Hot Matcha Latte",
    category: "Hot Drinks",
    coffee: false,
    singleSize: true,
    size: { label: "12oz", price: 79 }
  },
  {
    id: "hot_strawberry_dirty_matcha_12oz",
    name: "Hot Strawberry Dirty Matcha",
    category: "Hot Drinks",
    coffee: false,
    singleSize: true,
    size: { label: "12oz", price: 99 }
  },
  {
    id: "hot_strawberry_mocha_12oz",
    name: "Hot Strawberry Mocha",
    category: "Hot Drinks",
    coffee: true,
    singleSize: true,
    size: { label: "12oz", price: 89 }
  },
  {
    id: "hot_strawberry_latte_12oz",
    name: "Hot Strawberry Latte",
    category: "Hot Drinks",
    coffee: false,
    singleSize: true,
    size: { label: "12oz", price: 89 }
  },
  {
    id: "hot_strawberry_matcha_12oz",
    name: "Hot Strawberry Matcha",
    category: "Hot Drinks",
    coffee: false,
    singleSize: true,
    size: { label: "12oz", price: 89 }
  },

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
    id: "iced_americano_plus",
    name: "Iced Americano (Large)",
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
  },
  {
    id: "oatside_matcha_latte",
    name: "Oatside Matcha Latte",
    category: "Oatside Series",
    coffee: false,
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
  {
    id: "iced_dirty_matcha",
    name: "Iced Dirty Matcha",
    category: "Matcha Collection",
    coffee: true,
    sizes: [
      { label: "Malaki", price: 99 },
      { label: "Mas Malaki", price: 109 }
    ]
  }
];
/* ================= DEVICES ================= */
const DEVICE_IDS = ["POS1", "POS2", "POS3"];

export default function App() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  const [view, setView] = useState("cashier");

  const [deviceId, setDeviceId] = useState(
    localStorage.getItem("deviceId") || ""
  );

  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);

  const [category, setCategory] = useState("All Products");
  const [search, setSearch] = useState("");

  const [orderType, setOrderType] = useState("dine-in");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [discount, setDiscount] = useState("");
  const [cash, setCash] = useState("");

  const [orderCounter, setOrderCounter] = useState(1);

  /* ================= FIRESTORE ================= */
  useEffect(() => {
    return onSnapshot(collection(db, "orders"), (snap) => {
      setOrders(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
      );
    });
  }, []);

  /* ================= AUTH ================= */
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

  const initDevice = (id) => {
    localStorage.setItem("deviceId", id);
    setDeviceId(id);
  };

  /* ================= CART ================= */
  const makeKey = (item: any) => {
  const addons = item.addons ? [...item.addons].sort().join("|") : "";
  return `${item.id}-${item.sizeType}-${addons}`;
};

  const addToCart = (item: any, sizeLabel: string, price: number) => {
  setCart(prev => {
    const newItem = {
      ...item,
      qty: 1,
      sizeType: sizeLabel,
      price: price,
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

      const addons = item.addons || [];

      item.addons = addons.includes("Extra Shot")
        ? addons.filter(a => a !== "Extra Shot")
        : [...addons, "Extra Shot"];

      copy[idx] = item;
      return copy;
    });
  };

  /* ================= PRICE ================= */
  const computeItem = (item: any) => {
  const base = item.price * item.qty;

  const addon =
    item.addons?.includes("Extra Shot") ? 10 * item.qty : 0;

  return base + addon;
};

  const total =
    cart.reduce((a, b) => a + computeItem(b), 0) +
    Number(deliveryFee || 0) -
    Number(discount || 0);

  const change = cash ? Number(cash) - total : 0;

  /* ================= CHECKOUT ================= */
  const checkout = async () => {
    if (!cart.length) return;

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

  const updateStatus = async (id, status) => {
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

  /* ================= LOGIN ================= */
  if (!user) return (
    <div style={{ padding: 40 }}>
      <h1>POS Login</h1>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
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
      <div style={{ width: 220, borderRight: "1px solid #ddd" }}>
        <h3>Coffee D' Titos</h3>

        <button onClick={() => setView("cashier")}>Cashier</button>
        <button onClick={() => setView("kitchen")}>Kitchen</button>
        <button onClick={() => setView("admin")}>Admin</button>
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
        <div style={{ flex: 1, display: "flex" }}>

          <div style={{ flex: 1 }}>
            <input
              placeholder="Search"
              onChange={e => setSearch(e.target.value)}
            />

            {filtered.map(p => (
              <div key={p.id} style={{ border: "1px solid #ddd", padding: 10 }}>

                <b>{p.name}</b>

                <div>
                  {p.singleSize ? (
                    <button onClick={() => addToCart(p, p.size.label, p.size.price)}>
                      {p.size.label} ₱{p.size.price}
                    </button>
                  ) : (
                    p.sizes.map(s => (
                      <button
                        key={s.label}
                        onClick={() => addToCart(p, s.label, s.price)}
                      >
                        {s.label} ₱{s.price}
                      </button>
                    ))
                  )}
                </div>

              </div>
            ))}
          </div>

          {/* CART */}
<div style={{ width: 300, padding: 10, borderLeft: "1px solid #ddd" }}>
  <h3>Cart</h3>

  {cart.length === 0 && (
    <div style={{ color: "#888" }}>Empty cart</div>
  )}

  {cart.map((i, idx) => (
    <div
      key={idx}
      style={{
        border: "1px solid #ddd",
        padding: 10,
        marginBottom: 10,
        borderRadius: 6
      }}
    >
      {/* PRODUCT NAME */}
      <b style={{ fontSize: 16 }}>{i.name}</b>

      {/* SIZE */}
      <div style={{ fontSize: 13, color: "#555" }}>
        Size: {i.sizeType}
      </div>

      {/* ADDONS DISPLAY */}
      {i.addons?.length > 0 && (
        <div style={{ fontSize: 13, color: "#4caf50", marginTop: 4 }}>
          {i.addons.map((a: string, id: number) => (
            <div key={id}>+ {a}</div>
          ))}
        </div>
      )}

      {/* QTY CONTROLS */}
      <div style={{ marginTop: 8 }}>
        <button onClick={() => updateQty(idx, -1)}>-</button>
        <span style={{ margin: "0 10px" }}>{i.qty}</span>
        <button onClick={() => updateQty(idx, 1)}>+</button>
      </div>

      {/* EXTRA SHOT */}
      {i.coffee && (
        <button
          onClick={() => toggleExtraShot(idx)}
          style={{
            marginTop: 8,
            padding: "4px 8px",
            border: "1px solid #ddd",
            background: i.addons?.includes("Extra Shot")
              ? "#4caf50"
              : "#fff",
            color: i.addons?.includes("Extra Shot")
              ? "#fff"
              : "#000",
            cursor: "pointer"
          }}
        >
          {i.addons?.includes("Extra Shot")
            ? "✓ Extra Shot"
            : "Add Extra Shot (+₱10)"}
        </button>
      )}

      {/* ITEM TOTAL */}
      <div style={{ marginTop: 10, fontWeight: "bold" }}>
        ₱{computeItem(i)}
      </div>
    </div>
  ))}

  <hr />

  {/* TOTAL */}
  <h3>Total: ₱{total}</h3>

  {/* CHECKOUT */}
  <button
    onClick={checkout}
    style={{
      width: "100%",
      padding: 10,
      background: "black",
      color: "white",
      border: "none",
      marginTop: 10
    }}
  >
    Checkout
  </button>
</div>

      {/* KITCHEN */}
      {view === "kitchen" && (
        <div style={{ flex: 1, padding: 20 }}>
          <h2>Kitchen</h2>

          {activeOrders.map(o => (
            <div key={o.id} style={{ border: "1px solid #ddd", marginBottom: 10 }}>
              <h3>{o.orderNumber}</h3>

              {o.items.map((i, idx) => (
                <div key={idx}>
                  <b>{i.name}</b> ({i.sizeType}) x{i.qty}
                </div>
              ))}

              <button onClick={() => updateStatus(o.id, "completed")}>
                Complete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ADMIN */}
      {view === "admin" && (
        <div style={{ flex: 1 }}>
          <h2>Completed Orders</h2>

          {completedOrders.map(o => (
            <div key={o.id} style={{ border: "1px solid #ddd" }}>
              <h3>{o.orderNumber}</h3>
              <div>Total: ₱{o.total}</div>
            </div>
          ))}
        </div>
      )}

    </div>
  )}
}
