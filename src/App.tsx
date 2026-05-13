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
  { id: 4, name: "Hot Caramel Macchiato", category: "Hot Drinks", size: "12oz", price: 89 },
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

  /* ================= CART ================= */
  const addToCart = (item, sizeType, sizeExtra = 0) => {
    setCart(prev => {
      const i = prev.findIndex(
        p => p.id === item.id && p.sizeType === sizeType
      );

      if (i !== -1) {
        const copy = [...prev];
        copy[i].qty += 1;
        return copy;
      }

      return [
        ...prev,
        {
          ...item,
          qty: 1,
          sizeType,
          sizeExtra,
          addons: []
        }
      ];
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

  /* ================= EXTRA SHOT (FIXED) ================= */
  const toggleExtraShot = (idx) => {
    setCart(prev => {
      const copy = [...prev];
      const item = copy[idx];

      if (!item.addons) item.addons = [];

      if (item.addons.includes("Extra Shot")) {
        item.addons = item.addons.filter(a => a !== "Extra Shot");
      } else {
        item.addons.push("Extra Shot");
      }

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

  const total = cart.reduce((a, b) => a + computeItem(b), 0);

  const grandTotal =
    total +
    Number(deliveryFee || 0) -
    Number(discount || 0);

  const change = cash ? Number(cash) - grandTotal : 0;

  const orderNumber = () =>
    `${deviceId}-${Date.now()}`;

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
      total: grandTotal,
      status: "ongoing"
    };

    setOrders(prev => [order, ...prev]);
    setKitchenOrders(prev => [order, ...prev]);
    setCart([]);
  };

  const markDone = (id) => {
    setKitchenOrders(prev =>
      prev.map(o =>
        o.orderNumber === id ? { ...o, status: "done" } : o
      )
    );
  };

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
    <div style={{ display: "flex" }}>

      {/* PRODUCTS */}
      <div style={{ flex: 1 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} />

        {filtered.map(p => (
          <div key={p.id}>
            {p.name} ₱{p.price} ({p.size})

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
      <div style={{ width: 300 }}>
        <h3>Cart</h3>

        {cart.map((i, idx) => (
          <div key={idx}>
            <b>{i.name}</b>
            <div>Size: {i.sizeType}</div>

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

        <h3>Total: ₱{grandTotal}</h3>
        {cash && <div>Change: ₱{change}</div>}

        <button onClick={checkout}>Checkout</button>
      </div>

      {/* KITCHEN */}
      <div style={{ width: 300 }}>
        <h3>Kitchen</h3>

        {kitchenOrders
          .filter(o => o.status !== "done")
          .map(o => (
            <div key={o.orderNumber}>
              <b>{o.orderNumber}</b>

              {o.items.map((i, idx) => (
                <div key={idx}>
                  {i.name} x{i.qty}
                  <br />
                  Size: {i.sizeType}
                  {i.sizeExtra ? ` (+${i.sizeExtra})` : ""}
                  <br />
                  {i.addons?.join(", ")}
                </div>
              ))}

              <button onClick={() => markDone(o.orderNumber)}>
                Done
              </button>
            </div>
          ))}
      </div>

    </div>
  );
}
