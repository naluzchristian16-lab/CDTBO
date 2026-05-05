import { useMemo, useState } from "react";

const categories = ["Hot Drinks", "Iced Coffee", "Non-Coffee", "Oatside Series"];

const products = [
  { id: 1, name: "Hot Americano", category: "Hot Drinks", size: "12oz", price: 69, type: "hot" },
  { id: 2, name: "Hot Spanish Latte", category: "Hot Drinks", size: "12oz", price: 79, type: "hot" },
  { id: 3, name: "Hot Mocha", category: "Hot Drinks", size: "12oz", price: 79, type: "hot" },
  { id: 4, name: "Hot Caramel Macchiato", category: "Hot Drinks", size: "12oz", price: 89, type: "hot" },
  { id: 5, name: "Hot Dirty Matcha", category: "Hot Drinks", size: "12oz", price: 89, type: "hot" },

  { id: 11, name: "Iced Americano", category: "Iced Coffee", size: "16oz", price: 89, type: "iced" },
  { id: 12, name: "Iced Spanish Latte", category: "Iced Coffee", size: "16oz", price: 89, type: "iced" },
  { id: 13, name: "Iced Mocha", category: "Iced Coffee", size: "16oz", price: 89, type: "iced" },
  { id: 14, name: "Iced Caramel Macchiato", category: "Iced Coffee", size: "16oz", price: 99, type: "iced" },

  { id: 22, name: "Iced Americano", category: "Iced Coffee", size: "20oz", price: 99, type: "iced" },
  { id: 23, name: "Iced Spanish Latte", category: "Iced Coffee", size: "20oz", price: 99, type: "iced" },
  { id: 24, name: "Iced Mocha", category: "Iced Coffee", size: "20oz", price: 99, type: "iced" },
  { id: 25, name: "Iced Caramel Macchiato", category: "Iced Coffee", size: "20oz", price: 109, type: "iced" }
];

const variants: any = {
  Malaki: { price: 0 },
  "Mas Malaki": { price: 10 },
};

const addons: any = {
  "Extra Shot": { price: 10 },
};

export default function App() {
  const [view, setView] = useState<"cashier" | "kitchen" | "admin">("cashier");

  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [category, setCategory] = useState("Hot Drinks");

  const filtered = products.filter((p) => p.category === category);

  // 🧠 FIXED PRICE ENGINE
  const computeItemPrice = (item: any) => {
    const base = Number(item.price);

    const v = variants[item.variant]?.price || 0;

    let addon = 0;
    item.addons?.forEach((a: string) => {
      addon += addons[a]?.price || 0;
    });

    return (base + v + addon) * item.qty;
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, i) => sum + computeItemPrice(i), 0);
  }, [cart]);

  // ☕ HOT = INSTANT ADD
  const addHot = (p: any) => {
    setCart((prev) => [
      ...prev,
      {
        ...p,
        qty: 1,
        variant: null,
        addons: [],
      },
    ]);
  };

  // 🧊 ICED = SELECT SIZE THEN ADD
  const addIced = (p: any, size: "16oz" | "20oz") => {
    const price = p.price;

    setCart((prev) => [
      ...prev,
      {
        ...p,
        size,
        price,
        variant: size === "20oz" ? "Mas Malaki" : "Malaki",
        qty: 1,
        addons: [],
      },
    ]);
  };

  const checkout = async () => {
    if (cart.length === 0) return;

    const order = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      items: cart,
      total: cartTotal,
      status: "ongoing",
    };

    await fetch("/api/saveOrder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });

    setOrders((prev) => [order, ...prev]);
    setCart([]);
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>

      {/* SIDEBAR */}
      <div style={{ width: 220, padding: 10, borderRight: "1px solid #ddd" }}>
        <h3>POS</h3>

        <button onClick={() => setView("cashier")}>Cashier</button>
        <button onClick={() => setView("kitchen")}>Kitchen</button>
        <button onClick={() => setView("admin")}>Admin</button>

        <hr />

        {categories.map((c) => (
          <button key={c} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {/* CASHIER */}
      {view === "cashier" && (
        <>
          <div style={{ flex: 1, padding: 10 }}>
            <h3>Products</h3>

            {filtered.map((p) => (
              <div key={p.id} style={{ marginBottom: 10 }}>
                <b>{p.name}</b> ₱{p.price}

                {/* ☕ HOT = ONE TAP */}
                {p.type === "hot" && (
                  <button onClick={() => addHot(p)}>
                    Add
                  </button>
                )}

                {/* 🧊 ICED = SIZE BUTTONS */}
                {p.type === "iced" && (
                  <div>
                    <button onClick={() => addIced(p, "16oz")}>
                      Malaki
                    </button>
                    <button onClick={() => addIced(p, "20oz")}>
                      Mas Malaki
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CART */}
          <div style={{ width: 320, padding: 10, borderLeft: "1px solid #ddd" }}>
            <h3>Cart</h3>

            {cart.length === 0 && <p>No items</p>}

            {cart.map((i, idx) => (
              <div key={idx}>
                {i.name}
                {i.size ? ` (${i.size})` : ""} x{i.qty}
                = ₱{computeItemPrice(i)}
              </div>
            ))}

            <hr />

            <b>Total: ₱{cartTotal}</b>

            <button onClick={checkout}>Checkout</button>
          </div>
        </>
      )}

      {/* KITCHEN */}
      {view === "kitchen" && (
        <div style={{ flex: 1, padding: 10 }}>
          <h3>Kitchen</h3>

          {orders.map((o) => (
            <div key={o.id} style={{ border: "1px solid #ddd", marginBottom: 10 }}>
              <p><b>Order #{o.id}</b></p>

              {o.items.map((i: any, idx: number) => (
                <div key={idx}>
                  {i.name} {i.size ? `(${i.size})` : ""} x{i.qty}
                </div>
              ))}

              <p>Total: ₱{o.total}</p>
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
              <p><b>Receipt #{o.id}</b></p>

              {o.items.map((i: any, idx: number) => (
                <div key={idx}>
                  {i.name} {i.size ? `(${i.size})` : ""} x{i.qty}
                </div>
              ))}

              <p>Total: ₱{o.total}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
