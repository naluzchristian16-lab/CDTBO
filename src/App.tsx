import { useMemo, useEffect, useState } from "react";

import { db } from "./firebase";

import {
  collection,
 addDoc,
  onSnapshot,
  updateDoc,
  doc
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
  const [kitchenOrders, setKitchenOrders] = useState([]);
  const [cart, setCart] = useState([]);

  const [category, setCategory] = useState("All Products");
  const [search, setSearch] = useState("");

  const [orderType, setOrderType] = useState("dine-in");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [discount, setDiscount] = useState("");
  const [cash, setCash] = useState("");

  /* ================= STORAGE ================= */
  useEffect(() => {
    const k = localStorage.getItem("kitchenOrders");
    const o = localStorage.getItem("orders");

    if (k) setKitchenOrders(JSON.parse(k));
    if (o) setOrders(JSON.parse(o));
  }, []);

  useEffect(() => {
    localStorage.setItem("kitchenOrders", JSON.stringify(kitchenOrders));
  }, [kitchenOrders]);

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const initDevice = (id) => {
    localStorage.setItem("deviceId", id);
    setDeviceId(id);
  };

  /* ================= CART KEY ================= */
  const makeKey = (item) => {
    const addons = item.addons ? [...item.addons].sort().join("|") : "";
    return `${item.id}-${item.sizeType}-${item.sizeExtra}-${addons}`;
  };

  /* ================= ADD TO CART ================= */
  const addToCart = (item, sizeType, sizeExtra = 0) => {
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

  /* ================= QTY ================= */
  const updateQty = (idx, delta) => {
    setCart(prev => {
      const copy = [...prev];
      copy[idx].qty += delta;
      if (copy[idx].qty <= 0) copy.splice(idx, 1);
      return copy;
    });
  };

  /* ================= EXTRA SHOT ================= */
  const toggleExtraShot = (idx) => {
    setCart(prev => {
      const copy = [...prev];
      const item = { ...copy[idx] };

      const addons = item.addons ? [...item.addons] : [];

      if (addons.includes("Extra Shot")) {
        item.addons = addons.filter(a => a !== "Extra Shot");
      } else {
        item.addons = [...addons, "Extra Shot"];
      }

      copy[idx] = item;
      return copy;
    });
  };

  /* ================= COMPUTE ================= */
  const computeItem = (item) => {
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

  const orderNumber = () =>
    `${deviceId}-${Date.now()}`;

  /* ================= CHECKOUT (FIXED) ================= */
  const checkout = () => {
    if (!cart.length) return;

    const order = {
      orderNumber: orderNumber(),
      deviceId,
      items: cart,
      orderType,
      deliveryFee: Number(deliveryFee || 0),
      discount: Number(discount || 0),
      cash: Number(cash || 0),
      total,
      status: "ongoing"
    };

    setOrders(prev => [order, ...prev]);
    setKitchenOrders(prev => [order, ...prev]);
    setCart([]);

    // AUTO CLEAR FIELDS
    setCash("");
    setDiscount("");
    setDeliveryFee("");
  };

  /* ================= DONE ================= */
  const markDone = (id) => {
    setKitchenOrders(prev =>
      prev.map(o =>
        o.orderNumber === id ? { ...o, status: "done" } : o
      )
    );

    setOrders(prev =>
      prev.map(o =>
        o.orderNumber === id ? { ...o, status: "done" } : o
      )
    );
  };

  const doneOrders = orders.filter(o => o.status === "done");

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {
    return products.filter(p =>
      (category === "All Products" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [category, search]);

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
          <button
            key={c}
            onClick={() => setCategory(c)}
            style={{
              display: "block",
              width: "100%",
              background: category === c ? "#ddd" : "#fff"
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* CASHIER */}
      {view === "cashier" && (
        <div style={{ flex: 1, display: "flex" }}>

          {/* PRODUCTS */}
          <div style={{ flex: 1, padding: 10 }}>
            <input
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            {filtered.map(p => (
              <div key={p.id}>
                {p.name} ₱{p.price}

                <button onClick={() => addToCart(p, "Malaki", 0)}>
                  Malaki
                </button>

                <button onClick={() => addToCart(p, "Mas Malaki", 10)}>
                  Mas Malaki +10
                </button>
              </div>
            ))}
          </div>

          {/* CART */}
          <div style={{ width: 320, padding: 10 }}>
            <h3>Cart</h3>

            {cart.map((i, idx) => (
  <div key={idx} style={{ marginBottom: 10, border: "1px solid #eee", padding: 8 }}>
    
    <b>{i.name}</b>

    <div style={{ fontSize: 12, color: "#555" }}>
      Size: {i.sizeType}
      {i.sizeExtra > 0 && ` (+₱${i.sizeExtra})`}
    </div>

    <div>
      Qty: {i.qty}
      <button onClick={() => updateQty(idx, -1)}>-</button>
      <button onClick={() => updateQty(idx, 1)}>+</button>
    </div>

    {i.addons?.length > 0 && (
      <div style={{ color: "green", fontSize: 12 }}>
        Add-ons: {i.addons.join(", ")}
      </div>
    )}

    <div>₱{computeItem(i)}</div>

    <button onClick={() => toggleExtraShot(idx)}>
      Extra Shot
    </button>
  </div>
))}

            <hr />

            <select value={orderType} onChange={e => setOrderType(e.target.value)}>
              <option value="dine-in">Dine-in</option>
              <option value="take-out">Take-out</option>
              <option value="delivery">Delivery</option>
            </select>

            {orderType === "delivery" && (
              <input
                placeholder="Delivery Fee"
                value={deliveryFee}
                onChange={e => setDeliveryFee(e.target.value)}
              />
            )}

            <input
              placeholder="Discount"
              value={discount}
              onChange={e => setDiscount(e.target.value)}
            />

            <input
              placeholder="Cash"
              value={cash}
              onChange={e => setCash(e.target.value)}
            />

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

          {kitchenOrders
            .filter(o => o.status !== "done")
            .map(o => (
              <div key={o.orderNumber}>
                <b>{o.orderNumber}</b>

                {o.items.map((i, idx) => (
  <div key={idx} style={{ marginBottom: 8 }}>
    
    <b>{i.name}</b> x{i.qty}

    <div style={{ fontSize: 12, color: "#555" }}>
      Size: {i.sizeType}
      {i.sizeExtra > 0 && ` (+₱${i.sizeExtra})`}
    </div>

    {i.addons?.length > 0 && (
      <div style={{ fontSize: 12, color: "green" }}>
        Add-ons: {i.addons.join(", ")}
      </div>
    )}
  </div>
))}

                <button onClick={() => markDone(o.orderNumber)}>
                  Done
                </button>
              </div>
            ))}
        </div>
      )}

      {/* ADMIN */}
      {view === "admin" && (
        <div style={{ flex: 1, padding: 20 }}>
          <h2>Completed Orders</h2>

          {doneOrders.map(o => (
            <div key={o.orderNumber} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 10 }}>
              <b>{o.orderNumber}</b>
              <div>Type: {o.orderType}</div>

              <div style={{ background: "#f5f5f5", padding: 8 }}>
                {o.items.map((i, idx) => (
  <div key={idx} style={{ marginBottom: 6 }}>
    <b>{i.name}</b> x{i.qty}

    <div style={{ fontSize: 12, color: "#555" }}>
      Size: {i.sizeType}
      {i.sizeExtra > 0 && ` (+₱${i.sizeExtra})`}
    </div>

    {i.addons?.length > 0 && (
      <div style={{ fontSize: 12, color: "green" }}>
        Add-ons: {i.addons.join(", ")}
      </div>
    )}
  </div>
))}
              </div>

              {o.orderType === "delivery" && (
                <div>Delivery Fee: ₱{o.deliveryFee}</div>
              )}

              <div>Discount: ₱{o.discount}</div>
              <div>Cash: ₱{o.cash}</div>

              <h3>Total: ₱{o.total}</h3>
              <div>Change: ₱{o.cash - o.total}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
