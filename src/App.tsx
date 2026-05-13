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

  /* ================= DEVICE ================= */
  const initDevice = (id) => {
    localStorage.setItem("deviceId", id);
    setDeviceId(id);
  };

  /* ================= CART KEY (IMPORTANT FIX) ================= */
  const makeKey = (item) => {
    const addons = item.addons ? [...item.addons].sort().join("|") : "";
    return `${item.id}-${item.sizeType}-${item.sizeExtra}-${addons}`;
  };

  /* ================= ADD TO CART ================= */
  const addToCart = (item, sizeType, sizeExtra = 0, addons = []) => {
    setCart(prev => {
      const newItem = {
        ...item,
        qty: 1,
        sizeType,
        sizeExtra,
        addons: [...addons]
      };

      const key = makeKey(newItem);

      const idx = prev.findIndex(p => makeKey(p) === key);

      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          qty: copy[idx].qty + 1
        };
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

  /* ================= EXTRA SHOT (FIXED IMMUTABLE) ================= */
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

  const total = cartTotal + Number(deliveryFee || 0) - Number(discount || 0);
  const change = cash ? Number(cash) - total : 0;

  /* ================= ORDER NUMBER ================= */
  const orderNumber = () =>
    `${deviceId}-${Date.now()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

  /* ================= CHECKOUT ================= */
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

    setCash("");
    setDiscount("");
    setDeliveryFee("");
  };

  /* ================= MARK DONE (FIXED SYNC BOTH) ================= */
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

  /* ================= UI ================= */
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
              <div key={idx}>
                <b>{i.name}</b>
                <div>{i.sizeType}</div>

                <div>
                  Qty: {i.qty}
                  <button onClick={() => updateQty(idx, -1)}>-</button>
                  <button onClick={() => updateQty(idx, 1)}>+</button>
                </div>

                <div>₱{computeItem(i)}</div>

                <button onClick={() => toggleExtraShot(idx)}>
                  Extra Shot +10
                </button>

                {i.addons?.length > 0 && (
                  <div style={{ color: "green" }}>
                    {i.addons.join(", ")}
                  </div>
                )}
              </div>
            ))}

            <hr />

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
                  <div key={idx}>
                    {i.name} x{i.qty} ({i.sizeType})
                    {i.addons?.length ? ` | ${i.addons.join(", ")}` : ""}
                  </div>
                ))}

                <h3>₱{o.total}</h3>

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
      <div key={o.orderNumber} style={{ border: "1px solid #ddd", margin: 10, padding: 10 }}>
        
        <b>Order:</b> {o.orderNumber}
        <br />
        <b>Device:</b> {o.deviceId}
        <br />
        <b>Type:</b> {o.orderType}

        <hr />

        {/* ITEMS BREAKDOWN */}
        {o.items.map((i, idx) => (
          <div key={idx} style={{ marginBottom: 6 }}>
            <b>{i.name}</b> x{i.qty}
            <div style={{ fontSize: 12, color: "#555" }}>
              Size: {i.sizeType || i.size}
              {i.sizeExtra ? ` (+₱${i.sizeExtra})` : ""}
            </div>

            {i.addons?.length > 0 && (
              <div style={{ fontSize: 12, color: "green" }}>
                Add-ons: {i.addons.join(", ")}
              </div>
            )}
          </div>
        ))}

        <hr />

        <div>Delivery Fee: ₱{o.deliveryFee || 0}</div>
        <div>Discount: ₱{o.discount || 0}</div>

        <h3>Total: ₱{o.total}</h3>

      </div>
    ))}
  </div>
)}
    </div>
  );
}
