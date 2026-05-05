<div style={{
  width: "100%",
  padding: 10,
  background: "#111",
  color: "#fff",
  display: "flex",
  justifyContent: "space-between"
}}>
  <span>Coffee D' Titos' POS</span>
  <span>{new Date().toLocaleString()}</span>
</div>
  
import { useMemo, useState } from "react";

/* ================= CATEGORIES ================= */
const categories = ["Hot Drinks", "Iced Coffee", "Non-Coffee", "Oatside Series"];

/* ================= PRODUCTS ================= */
const products = [
  // ================= HOT DRINKS (12oz only) =================
  { id: 1, name: "Hot Americano", category: "Hot Drinks", size: "12oz", price: 69, type: "hot", coffee: true },
  { id: 2, name: "Hot Spanish Latte", category: "Hot Drinks", size: "12oz", price: 79, type: "hot", coffee: true },
  { id: 3, name: "Hot Mocha", category: "Hot Drinks", size: "12oz", price: 79, type: "hot", coffee: true },
  { id: 4, name: "Hot Caramel Macchiato", category: "Hot Drinks", size: "12oz", price: 89, type: "hot", coffee: true },
  { id: 5, name: "Hot Dirty Matcha", category: "Hot Drinks", size: "12oz", price: 89, type: "hot", coffee: true },
  { id: 6, name: "Hot Strawberry Dirty Matcha", category: "Hot Drinks", size: "12oz", price: 99, type: "hot", coffee: true },
  { id: 7, name: "Hot Strawberry Mocha", category: "Hot Drinks", size: "12oz", price: 89, type: "hot", coffee: true },
  { id: 8, name: "Hot Strawberry Latte", category: "Hot Drinks", size: "12oz", price: 89, type: "hot", coffee: true },
  { id: 9, name: "Hot Matcha Latte", category: "Hot Drinks", size: "12oz", price: 79, type: "hot", coffee: false },
  { id: 10, name: "Hot Strawberry Matcha", category: "Hot Drinks", size: "12oz", price: 89, type: "hot", coffee: false },

  // ================= ICED COFFEE =================
  // 16oz (Malaki)
  { id: 11, name: "Iced Americano", category: "Iced Coffee", size: "16oz", price: 89, type: "iced", coffee: true },
  { id: 12, name: "Iced Spanish Latte", category: "Iced Coffee", size: "16oz", price: 89, type: "iced", coffee: true },
  { id: 13, name: "Iced Mocha", category: "Iced Coffee", size: "16oz", price: 89, type: "iced", coffee: true },
  { id: 14, name: "Iced Caramel Macchiato", category: "Iced Coffee", size: "16oz", price: 99, type: "iced", coffee: true },
  { id: 15, name: "Iced Dirty Matcha", category: "Iced Coffee", size: "16oz", price: 99, type: "iced", coffee: true },
  { id: 16, name: "Iced Strawberry Dirty Matcha", category: "Iced Coffee", size: "16oz", price: 109, type: "iced", coffee: true },
  { id: 17, name: "Iced Strawberry Mocha", category: "Iced Coffee", size: "16oz", price: 99, type: "iced", coffee: true },
  { id: 18, name: "Iced Strawberry Latte", category: "Iced Coffee", size: "16oz", price: 99, type: "iced", coffee: true },
  { id: 19, name: "Iced Matcha Latte", category: "Iced Coffee", size: "16oz", price: 89, type: "iced", coffee: false },
  { id: 20, name: "Iced Strawberry Matcha", category: "Iced Coffee", size: "16oz", price: 99, type: "iced", coffee: false },
  { id: 21, name: "Iced Blueberry Matcha", category: "Iced Coffee", size: "16oz", price: 99, type: "iced", coffee: false },

  // 20oz (Mas Malaki)
  { id: 22, name: "Iced Americano", category: "Iced Coffee", size: "20oz", price: 99, type: "iced", coffee: true },
  { id: 23, name: "Iced Spanish Latte", category: "Iced Coffee", size: "20oz", price: 99, type: "iced", coffee: true },
  { id: 24, name: "Iced Mocha", category: "Iced Coffee", size: "20oz", price: 99, type: "iced", coffee: true },
  { id: 25, name: "Iced Caramel Macchiato", category: "Iced Coffee", size: "20oz", price: 109, type: "iced", coffee: true },
  { id: 26, name: "Iced Dirty Matcha", category: "Iced Coffee", size: "20oz", price: 109, type: "iced", coffee: true },
  { id: 27, name: "Iced Strawberry Dirty Matcha", category: "Iced Coffee", size: "20oz", price: 119, type: "iced", coffee: true },
  { id: 28, name: "Iced Strawberry Mocha", category: "Iced Coffee", size: "20oz", price: 109, type: "iced", coffee: true },
  { id: 29, name: "Iced Strawberry Latte", category: "Iced Coffee", size: "20oz", price: 109, type: "iced", coffee: true },
  { id: 30, name: "Iced Matcha Latte", category: "Iced Coffee", size: "20oz", price: 99, type: "iced", coffee: false },
  { id: 31, name: "Iced Strawberry Matcha", category: "Iced Coffee", size: "20oz", price: 109, type: "iced", coffee: false },
  { id: 32, name: "Iced Blueberry Matcha", category: "Iced Coffee", size: "20oz", price: 109, type: "iced", coffee: false },

  // ================= OATSIDE SERIES =================
  // 16oz
  { id: 33, name: "Oatside Spanish Latte", category: "Oatside Series", size: "16oz", price: 99, type: "iced", coffee: true },
  { id: 34, name: "Oatside Matcha Latte", category: "Oatside Series", size: "16oz", price: 99, type: "iced", coffee: false },
  { id: 35, name: "Oatside Strawberry Matcha", category: "Oatside Series", size: "16oz", price: 109, type: "iced", coffee: false },
  { id: 36, name: "Oatside Strawberry Dirty Matcha", category: "Oatside Series", size: "16oz", price: 119, type: "iced", coffee: true },
  { id: 37, name: "Oatside Strawberry Latte", category: "Oatside Series", size: "16oz", price: 109, type: "iced", coffee: false },
  { id: 38, name: "Oatside Caramel Macchiato", category: "Oatside Series", size: "16oz", price: 109, type: "iced", coffee: true },
  { id: 39, name: "Oatside Dirty Matcha", category: "Oatside Series", size: "16oz", price: 109, type: "iced", coffee: true },

  // 20oz
  { id: 40, name: "Oatside Spanish Latte", category: "Oatside Series", size: "20oz", price: 109, type: "iced", coffee: true },
  { id: 41, name: "Oatside Matcha Latte", category: "Oatside Series", size: "20oz", price: 109, type: "iced", coffee: false },
  { id: 42, name: "Oatside Strawberry Matcha", category: "Oatside Series", size: "20oz", price: 119, type: "iced", coffee: false },
  { id: 43, name: "Oatside Strawberry Dirty Matcha", category: "Oatside Series", size: "20oz", price: 129, type: "iced", coffee: true },
  { id: 44, name: "Oatside Strawberry Latte", category: "Oatside Series", size: "20oz", price: 119, type: "iced", coffee: false },
  { id: 45, name: "Oatside Caramel Macchiato", category: "Oatside Series", size: "20oz", price: 119, type: "iced", coffee: true },
  { id: 46, name: "Oatside Dirty Matcha", category: "Oatside Series", size: "20oz", price: 119, type: "iced", coffee: true },

  // ================= NON-COFFEE =================
  // 16oz
  { id: 47, name: "Strawberry Milk Drink", category: "Non-Coffee", size: "16oz", price: 79, type: "iced", coffee: false },
  { id: 48, name: "Blueberry Milk Drink", category: "Non-Coffee", size: "16oz", price: 79, type: "iced", coffee: false },
  { id: 49, name: "Strawberry Choco", category: "Non-Coffee", size: "16oz", price: 78, type: "iced", coffee: false },
  { id: 50, name: "Green Apple Soda", category: "Non-Coffee", size: "16oz", price: 69, type: "iced", coffee: false },
  { id: 51, name: "Blueberry Soda", category: "Non-Coffee", size: "16oz", price: 69, type: "iced", coffee: false },
  { id: 52, name: "Iced Blueberry Matcha", category: "Non-Coffee", size: "16oz", price: 99, type: "iced", coffee: false },

  // 20oz
  { id: 53, name: "Strawberry Milk Drink", category: "Non-Coffee", size: "20oz", price: 89, type: "iced", coffee: false },
  { id: 54, name: "Blueberry Milk Drink", category: "Non-Coffee", size: "20oz", price: 89, type: "iced", coffee: false },
  { id: 55, name: "Strawberry Choco", category: "Non-Coffee", size: "20oz", price: 89, type: "iced", coffee: false },
  { id: 56, name: "Green Apple Soda", category: "Non-Coffee", size: "20oz", price: 79, type: "iced", coffee: false },
  { id: 57, name: "Blueberry Soda", category: "Non-Coffee", size: "20oz", price: 79, type: "iced", coffee: false },
  { id: 58, name: "Iced Blueberry Matcha", category: "Non-Coffee", size: "20oz", price: 109, type: "iced", coffee: false }
];

/* ================= ADD ONS ================= */
const addons: any = {
  "Extra Shot": 10
};

const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

const getOrderNumber = () => {
  const now = new Date();

  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);

  const todayKey = getTodayKey();

  // filter today's orders only
  const todayOrders = orders.filter(
    (o) => o.dateKey === todayKey
  );

  const sequence = todayOrders.length + 1;

  return `Order#${mm}${dd}${yy}${String(sequence).padStart(4, "0")}`;
};

export default function App() {
  const [view, setView] = useState<"cashier" | "kitchen" | "admin">("cashier");

  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [category, setCategory] = useState("Hot Drinks");

  const [search, setSearch] = useState("");

  const [orderType, setOrderType] = useState("dine-in");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [discount, setDiscount] = useState(0);

  /* ================= FILTER ================= */
  const filtered = products.filter((p) => {
    return (
      p.category === category &&
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  /* ================= PRICE ================= */
  const computeItemPrice = (item: any) => {
    const base = Number(item.price);
    const sizeAdd = item.size === "20oz" ? 10 : 0;

    const addonTotal = (item.addons || []).reduce((sum: number, a: string) => {
      return sum + (addons[a] || 0);
    }, 0);

    return (base + sizeAdd + addonTotal) * item.qty;
  };

  /* ================= CART TOTAL ================= */
  const cartTotal = useMemo(() => {
    const subtotal = cart.reduce((sum, i) => sum + computeItemPrice(i), 0);
    return subtotal + Number(deliveryFee) - Number(discount);
  }, [cart, deliveryFee, discount]);

  /* ================= ADD TO CART ================= */
  const addToCart = (item: any) => {
    setCart((prev) => {
      const index = prev.findIndex(
        (p) => p.id === item.id && p.size === item.size
      );

      if (index !== -1) {
        const updated = [...prev];
        updated[index].qty += 1;
        return updated;
      }

      return [...prev, { ...item, qty: 1, addons: [] }];
    });
  };

  const addHot = (p: any) => addToCart({ ...p, size: "12oz" });
  const addIced = (p: any, size: "16oz" | "20oz") => addToCart({ ...p, size });

  /* ================= ADD ON ================= */
  const toggleAddon = (index: number) => {
    setCart((prev) => {
      const updated = [...prev];
      const item = updated[index];

      if (!item.addons) item.addons = [];

      if (item.addons.includes("Extra Shot")) {
        item.addons = item.addons.filter((a: string) => a !== "Extra Shot");
      } else {
        item.addons.push("Extra Shot");
      }

      return updated;
    });
  };

  /* ================= REMOVE ================= */
  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= CHECKOUT ================= */
  const getOrderNumber = () => {
  const now = new Date();

  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);

  const count = orders.length + 1;

  return `Order#${mm}${dd}${yy}${String(count).padStart(4, "0")}`;
};
  const checkout = async () => {
    if (!cart.length) return;

    const now = new Date();
const todayKey = getTodayKey();

const order = {
  id: Date.now(),
  orderNumber: getOrderNumber(),
  dateKey: todayKey, // 👈 IMPORTANT FOR RESET LOGIC
  time: now.toLocaleTimeString(),
  date: now.toLocaleDateString(),
  items: cart,
  orderType,
  deliveryFee,
  discount,
  total: cartTotal,
  status: "ongoing"
};

    await fetch("/api/saveOrder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });

    setOrders((prev) => [order, ...prev]);
    setCart([]);
    setDiscount(0);
    setDeliveryFee(0);
  };

  /* ================= DONE ================= */
  const markDone = (id: number) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "done" } : o
      )
    );
  };

  const ongoing = orders.filter((o) => o.status !== "done");

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>

      {/* SIDEBAR */}
      <div style={{ width: 220, padding: 10, borderRight: "1px solid #ddd" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
  <img
    src="/CFDTLOGO.png"
    alt="Coffee D Titos"
    style={{ width: 40, height: 40, borderRadius: "50%" }}
  />
  <b>Coffee D Titos</b>
</div>

        <button onClick={() => setView("cashier")}>Cashier</button>
        <button onClick={() => setView("kitchen")}>Kitchen</button>
        <button onClick={() => setView("admin")}>Admin</button>

        <hr />

        {categories.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCategory(c);
              setSearch("");
            }}
            style={{
              display: "block",
              width: "100%",
              marginBottom: 6,
              padding: 10,
              background: category === c ? "#222" : "#eee",
              color: category === c ? "#fff" : "#000",
              border: "none"
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* CASHIER */}
      {view === "cashier" && (
        <>
          <div style={{ flex: 1, padding: 10 }}>
            <h3>Products</h3>

            <input
              placeholder="Search drink..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: 8, marginBottom: 10, width: "100%" }}
            />

            {filtered.map((p) => (
              <div key={p.id} style={{ marginBottom: 10 }}>
                <b>{p.name}</b> ₱{p.price}

                {p.type === "hot" && (
                  <button onClick={() => addHot(p)}>Add</button>
                )}

                {p.type === "iced" && (
                  <>
                    <button onClick={() => addIced(p, "16oz")}>Malaki</button>
                    <button onClick={() => addIced(p, "20oz")}>Mas Malaki</button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* CART */}
          <div style={{ width: 340, padding: 10, borderLeft: "1px solid #ddd" }}>
            <h3>Cart</h3>

            {cart.map((i, idx) => (
              <div key={idx} style={{ marginBottom: 10 }}>
                {i.name} {i.size ? `(${i.size})` : ""} x{i.qty}
                = ₱{computeItemPrice(i)}

                {i.coffee && (
                  <button onClick={() => toggleAddon(idx)}>
                    Extra Shot
                  </button>
                )}

                <button onClick={() => removeFromCart(idx)}>Remove</button>
              </div>
            ))}

            <hr />

            <b>Total: ₱{cartTotal}</b>

            <select onChange={(e) => setOrderType(e.target.value)}>
              <option value="dine-in">Dine In</option>
              <option value="takeout">Take Out</option>
              <option value="delivery">Delivery</option>
            </select>

            {orderType === "delivery" && (
              <input
                type="number"
                placeholder="Delivery Fee"
                onChange={(e) => setDeliveryFee(Number(e.target.value))}
              />
            )}

            <input
              type="number"
              placeholder="Discount"
              onChange={(e) => setDiscount(Number(e.target.value))}
            />

            <button onClick={checkout}>Checkout</button>
          </div>
        </>
      )}

      {/* KITCHEN */}
      {view === "kitchen" && (
        <div style={{ flex: 1, padding: 10 }}>
          <h3>Kitchen</h3>

          {ongoing.map((o) => (
            <div key={o.id} style={{ border: "1px solid #ddd", marginBottom: 10 }}>
              <b>{o.orderNumber}</b>

              {o.items.map((i: any, idx: number) => (
                <div key={idx}>
                  {i.name} {i.size} x{i.qty}
                  {i.addons?.length ? ` + ${i.addons.join(", ")}` : ""}
                </div>
              ))}

              <p>Total: ₱{o.total}</p>

              <button onClick={() => markDone(o.id)}>
                Mark Done
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ADMIN */}
      {view === "admin" && (
        <div style={{ flex: 1, padding: 10 }}>
          <h3>Receipts</h3>

          {orders.map((o) => (
            <div key={o.id} style={{ border: "1px solid #ddd", marginBottom: 10 }}>
              <b>{o.orderNumber}</b>
              <p>{o.orderType}</p>

              {o.items.map((i: any, idx: number) => (
                <div key={idx}>
                  {i.name} {i.size} x{i.qty}
                  {i.addons?.length ? ` + ${i.addons.join(", ")}` : ""}
                </div>
              ))}

              <p>Delivery: ₱{o.deliveryFee}</p>
              <p>Discount: ₱{o.discount}</p>
              <b>Total: ₱{o.total}</b>
            </div>
          ))}
        </div>
      )}
      <div style={{
  width: "100%",
  padding: 8,
  textAlign: "center",
  background: "#111",
  color: "#fff",
  position: "fixed",
  bottom: 0,
  left: 0
}}>
  Coffee D Titos • Fast Fresh Coffee Experience
</div>
    </div>
  );
}
