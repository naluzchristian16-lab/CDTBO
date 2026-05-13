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

/* ================= DEVICE ================= */
const DEVICE_IDS = ["POS1", "POS2", "POS3"];

export default function App() {
  const [view, setView] = useState("cashier");
  const [deviceId, setDeviceId] = useState(localStorage.getItem("deviceId") || "");

  const [orders, setOrders] = useState<any[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  const [category, setCategory] = useState("All Products");
  const [search, setSearch] = useState("");

  const [orderType, setOrderType] = useState("dine-in");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [discount, setDiscount] = useState("");
  const [cash, setCash] = useState("");
  useEffect(() => {
  const savedKitchen = localStorage.getItem("kitchenOrders");
  const savedOrders = localStorage.getItem("orders");

  if (savedKitchen) setKitchenOrders(JSON.parse(savedKitchen));
  if (savedOrders) setOrders(JSON.parse(savedOrders));
}, []);

  useEffect(() => {
  localStorage.setItem("kitchenOrders", JSON.stringify(kitchenOrders));
}, [kitchenOrders]);

useEffect(() => {
  localStorage.setItem("orders", JSON.stringify(orders));
}, [orders]);

  /* ================= DEVICE INIT ================= */
  const initDevice = (id: string) => {
    localStorage.setItem("deviceId", id);
    setDeviceId(id);
  };

  /* ================= CART ================= */
  const addToCart = (item: any) => {
    setCart(prev => {
      const i = prev.findIndex(p => p.id === item.id && p.size === item.size);
      if (i !== -1) {
        const copy = [...prev];
        copy[i].qty++;
        return copy;
      }
      return [...prev, { ...item, qty: 1, addons: [], size: item.size }];
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
      const item = copy[idx];

      if (!item.addons) item.addons = [];

      if (item.addons.includes("Extra Shot")) {
        item.addons = item.addons.filter((a: string) => a !== "Extra Shot");
      } else {
        item.addons.push("Extra Shot");
      }

      return copy;
    });
  };

  const computeItem = (item: any) => {
    const base = item.price * item.qty;
    const addon = item.addons?.includes("Extra Shot") ? 10 * item.qty : 0;
    return base + addon;
  };

  const cartTotal = cart.reduce((a, b) => a + computeItem(b), 0);

  const total = cartTotal + Number(deliveryFee || 0) - Number(discount || 0);
  const change = cash ? Number(cash) - total : 0;

  /* ================= ORDER NUMBER ================= */
  const orderNumber = () =>
    `${deviceId}-${Date.now()}-${Math.random().toString(36).slice(2,5).toUpperCase()}`;

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
      status: "ongoing",
      createdAt: new Date().toISOString()
    };

    setOrders(prev => [order, ...prev]);
    setKitchenOrders(prev => [order, ...prev]);
    setCart([]);

    setCash("");
    setDiscount("");
    setDeliveryFee("");
  };

  const markDone = (id: string) => {
  setKitchenOrders(prev =>
    prev.map(o =>
      o.orderNumber === id
        ? { ...o, status: "done" }
        : o
    )
  );
};

  const doneOrders = kitchenOrders.filter(o => o.status === "done");

  /* ================= FILTER ================= */
  const baseFiltered = useMemo(() => {
    return products.filter(
      p => (category === "All Products" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [category, search]);

  /* ================= UI ================= */

  if (!deviceId) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Select POS</h2>
        {DEVICE_IDS.map(id => (
          <button key={id} onClick={() => initDevice(id)}>{id}</button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* SIDEBAR */}
      <div style={{ width: 220, padding: 10 }}>
        <h3>Coffee D' Titos</h3>
        <p>{deviceId}</p>

        <button onClick={() => setView("cashier")}>Cashier</button>
        <button onClick={() => setView("kitchen")}>Kitchen</button>
        <button onClick={() => setView("admin")}>Admin</button>

        <hr />

        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)}>{c}</button>
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

          {/* CART */}
          <div style={{ width: 320, padding: 10 }}>
            <h3>Cart</h3>

            {cart.map((i, idx) => (
              <div key={idx} style={{ marginBottom: 10 }}>
                <b>{i.name}</b> ({i.size})

                <div>
                  Qty: {i.qty}
                  <button onClick={() => updateQty(idx, -1)}>-</button>
                  <button onClick={() => updateQty(idx, 1)}>+</button>
                </div>

                <div>
                  ₱{i.price} x {i.qty} = ₱{computeItem(i)}
                </div>

                <button onClick={() => toggleExtraShot(idx)}>Extra Shot</button>

                {i.addons?.length > 0 && (
                  <div style={{ color: "green" }}>
                    + {i.addons.join(", ")}
                  </div>
                )}
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
            {cash && <h4 style={{ color: change >= 0 ? "green" : "red" }}>Change: ₱{change}</h4>}

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
            <div key={o.orderNumber} style={{ border: "1px solid #ccc", padding: 10, margin: 10 }}>
              <b>{o.orderNumber}</b>
              <p>{o.orderType}</p>

              {o.items.map((i: any, idx: number) => (
                <div key={idx}>{i.name} x{i.qty}</div>
              ))}

              <h3>₱{o.total}</h3>

              <button onClick={() => markDone(o.orderNumber)}>Done</button>
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
              <b>{o.orderNumber}</b>

              {o.items.map((i: any, idx: number) => (
                <div key={idx}>{i.name} x{i.qty}</div>
              ))}

              <h3>Total: ₱{o.total}</h3>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
