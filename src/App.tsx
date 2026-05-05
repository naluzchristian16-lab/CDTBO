import { useMemo, useState } from "react";

const categories = ["Hot Drinks", "Iced Coffee", "Non-Coffee", "Oatside Series"];

const products = [
  // ☕ HOT COFFEE (12oz only)
  { id: 1, name: "Hot Americano", category: "Hot Drinks", size: "12oz", price: 69, type: "hot" },
  { id: 2, name: "Hot Spanish Latte", category: "Hot Drinks", size: "12oz", price: 79, type: "hot" },
  { id: 3, name: "Hot Mocha", category: "Hot Drinks", size: "12oz", price: 79, type: "hot" },
  { id: 4, name: "Hot Caramel Macchiato", category: "Hot Drinks", size: "12oz", price: 89, type: "hot" },
  { id: 5, name: "Hot Dirty Matcha", category: "Hot Drinks", size: "12oz", price: 89, type: "hot" },
  { id: 6, name: "Hot Strawberry Dirty Matcha", category: "Hot Drinks", size: "12oz", price: 99, type: "hot" },
  { id: 7, name: "Hot Strawberry Mocha", category: "Hot Drinks", size: "12oz", price: 89, type: "hot" },
  { id: 8, name: "Hot Strawberry Latte", category: "Hot Drinks", size: "12oz", price: 89, type: "hot" },
  { id: 9, name: "Hot Matcha Latte", category: "Hot Drinks", size: "12oz", price: 79, type: "hot" },
  { id: 10, name: "Hot Strawberry Matcha", category: "Hot Drinks", size: "12oz", price: 89, type: "hot" },

  // 🧊 ICED COFFEE - 16oz (Malaki)
  { id: 11, name: "Iced Americano", category: "Iced Coffee", size: "16oz", price: 89, type: "iced" },
  { id: 12, name: "Iced Spanish Latte", category: "Iced Coffee", size: "16oz", price: 89, type: "iced" },
  { id: 13, name: "Iced Mocha", category: "Iced Coffee", size: "16oz", price: 89, type: "iced" },
  { id: 14, name: "Iced Caramel Macchiato", category: "Iced Coffee", size: "16oz", price: 99, type: "iced" },
  { id: 15, name: "Iced Dirty Matcha", category: "Iced Coffee", size: "16oz", price: 99, type: "iced" },
  { id: 16, name: "Iced Strawberry Dirty Matcha", category: "Iced Coffee", size: "16oz", price: 109, type: "iced" },
  { id: 17, name: "Iced Strawberry Mocha", category: "Iced Coffee", size: "16oz", price: 99, type: "iced" },
  { id: 18, name: "Iced Strawberry Latte", category: "Iced Coffee", size: "16oz", price: 99, type: "iced" },
  { id: 19, name: "Iced Matcha Latte", category: "Iced Coffee", size: "16oz", price: 89, type: "iced" },
  { id: 20, name: "Iced Strawberry Matcha", category: "Iced Coffee", size: "16oz", price: 99, type: "iced" },
  { id: 21, name: "Iced Blueberry Matcha", category: "Iced Coffee", size: "16oz", price: 99, type: "iced" },

  // 🧊 ICED COFFEE - 20oz (Mas Malaki)
  { id: 22, name: "Iced Americano", category: "Iced Coffee", size: "20oz", price: 99, type: "iced" },
  { id: 23, name: "Iced Spanish Latte", category: "Iced Coffee", size: "20oz", price: 99, type: "iced" },
  { id: 24, name: "Iced Mocha", category: "Iced Coffee", size: "20oz", price: 99, type: "iced" },
  { id: 25, name: "Iced Caramel Macchiato", category: "Iced Coffee", size: "20oz", price: 109, type: "iced" },
  { id: 26, name: "Iced Dirty Matcha", category: "Iced Coffee", size: "20oz", price: 109, type: "iced" },
  { id: 27, name: "Iced Strawberry Dirty Matcha", category: "Iced Coffee", size: "20oz", price: 119, type: "iced" },
  { id: 28, name: "Iced Strawberry Mocha", category: "Iced Coffee", size: "20oz", price: 109, type: "iced" },
  { id: 29, name: "Iced Strawberry Latte", category: "Iced Coffee", size: "20oz", price: 109, type: "iced" },
  { id: 30, name: "Iced Matcha Latte", category: "Iced Coffee", size: "20oz", price: 99, type: "iced" },
  { id: 31, name: "Iced Strawberry Matcha", category: "Iced Coffee", size: "20oz", price: 109, type: "iced" },
  { id: 32, name: "Iced Blueberry Matcha", category: "Iced Coffee", size: "20oz", price: 109, type: "iced" },

  // 🥛 OATSIDE SERIES - 16oz
  { id: 33, name: "Oatside Spanish Latte", category: "Oatside Series", size: "16oz", price: 99, type: "iced" },
  { id: 34, name: "Oatside Matcha Latte", category: "Oatside Series", size: "16oz", price: 99, type: "iced" },
  { id: 35, name: "Oatside Strawberry Matcha", category: "Oatside Series", size: "16oz", price: 109, type: "iced" },
  { id: 36, name: "Oatside Strawberry Dirty Matcha", category: "Oatside Series", size: "16oz", price: 119, type: "iced" },
  { id: 37, name: "Oatside Strawberry Latte", category: "Oatside Series", size: "16oz", price: 109, type: "iced" },
  { id: 38, name: "Oatside Caramel Macchiato", category: "Oatside Series", size: "16oz", price: 109, type: "iced" },
  { id: 39, name: "Oatside Dirty Matcha", category: "Oatside Series", size: "16oz", price: 109, type: "iced" },

  // 🥛 OATSIDE SERIES - 20oz
  { id: 40, name: "Oatside Spanish Latte", category: "Oatside Series", size: "20oz", price: 109, type: "iced" },
  { id: 41, name: "Oatside Matcha Latte", category: "Oatside Series", size: "20oz", price: 109, type: "iced" },
  { id: 42, name: "Oatside Strawberry Matcha", category: "Oatside Series", size: "20oz", price: 119, type: "iced" },
  { id: 43, name: "Oatside Strawberry Dirty Matcha", category: "Oatside Series", size: "20oz", price: 129, type: "iced" },
  { id: 44, name: "Oatside Strawberry Latte", category: "Oatside Series", size: "20oz", price: 119, type: "iced" },
  { id: 45, name: "Oatside Caramel Macchiato", category: "Oatside Series", size: "20oz", price: 119, type: "iced" },
  { id: 46, name: "Oatside Dirty Matcha", category: "Oatside Series", size: "20oz", price: 119, type: "iced" },

  // 🍓 NON-COFFEE - 16oz
  { id: 47, name: "Strawberry Milk Drink", category: "Non-Coffee", size: "16oz", price: 79, type: "iced" },
  { id: 48, name: "Blueberry Milk Drink", category: "Non-Coffee", size: "16oz", price: 79, type: "iced" },
  { id: 49, name: "Strawberry Choco", category: "Non-Coffee", size: "16oz", price: 78, type: "iced" },
  { id: 50, name: "Green Apple Soda", category: "Non-Coffee", size: "16oz", price: 69, type: "iced" },
  { id: 51, name: "Blueberry Soda", category: "Non-Coffee", size: "16oz", price: 69, type: "iced" },
  { id: 52, name: "Iced Blueberry Matcha", category: "Non-Coffee", size: "16oz", price: 99, type: "iced" },

  // 🍓 NON-COFFEE - 20oz
  { id: 53, name: "Strawberry Milk Drink", category: "Non-Coffee", size: "20oz", price: 89, type: "iced" },
  { id: 54, name: "Blueberry Milk Drink", category: "Non-Coffee", size: "20oz", price: 89, type: "iced" },
  { id: 55, name: "Strawberry Choco", category: "Non-Coffee", size: "20oz", price: 89, type: "iced" },
  { id: 56, name: "Green Apple Soda", category: "Non-Coffee", size: "20oz", price: 79, type: "iced" },
  { id: 57, name: "Blueberry Soda", category: "Non-Coffee", size: "20oz", price: 79, type: "iced" },
  { id: 58, name: "Iced Blueberry Matcha", category: "Non-Coffee", size: "20oz", price: 109, type: "iced" }
];

export default function App() {
  const [view, setView] = useState<"cashier" | "kitchen" | "admin">("cashier");

  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [category, setCategory] = useState("Hot Drinks");

  const filtered = products.filter((p) => p.category === category);

  // 🧠 PRICE ENGINE
  const computeItemPrice = (item: any) => {
    return Number(item.price) * item.qty;
  };

  // ⚡ SMART ADD TO CART
  const addToCart = (item: any) => {
    setCart((prev) => {
      const index = prev.findIndex((p) =>
        p.id === item.id &&
        p.size === item.size
      );

      if (index !== -1) {
        const updated = [...prev];
        updated[index].qty += 1;
        return updated;
      }

      return [...prev, { ...item, qty: 1 }];
    });
  };

  const addHot = (p: any) => {
    addToCart({ ...p, size: "12oz" });
  };

  const addIced = (p: any, size: "16oz" | "20oz") => {
    addToCart({ ...p, size });
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, i) => sum + computeItemPrice(i), 0);
  }, [cart]);

  // 🗑️ REMOVE FROM CART
  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  // 🧾 CHECKOUT
  const checkout = async () => {
    if (!cart.length) return;

    const order = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      items: cart,
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
  };

  // 🍳 MARK AS DONE
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
        <h3>POS</h3>

        <button onClick={() => setView("cashier")}>Cashier</button>
        <button onClick={() => setView("kitchen")}>Kitchen</button>

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
              <div key={p.id}>
                {p.name} ₱{p.price}

                {p.type === "hot" && (
                  <button onClick={() => addHot(p)}>Add</button>
                )}

                {p.type === "iced" && (
                  <>
                    <button onClick={() => addIced(p, "16oz")}>16oz</button>
                    <button onClick={() => addIced(p, "20oz")}>20oz</button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* CART */}
          <div style={{ width: 320, padding: 10, borderLeft: "1px solid #ddd" }}>
            <h3>Cart</h3>

            {cart.length === 0 && <p>No items</p>}

            {cart.map((i, idx) => (
              <div key={idx} style={{ marginBottom: 8 }}>
                <div>
                  {i.name} {i.size ? `(${i.size})` : ""} x{i.qty}
                  = ₱{computeItemPrice(i)}
                </div>

                {/* 🗑️ REMOVE BUTTON */}
                <button onClick={() => removeFromCart(idx)}>
                  Remove
                </button>
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

          {ongoing.map((o) => (
            <div key={o.id} style={{ border: "1px solid #ddd", marginBottom: 10 }}>
              <p><b>Order #{o.id}</b></p>

              {o.items.map((i: any, idx: number) => (
                <div key={idx}>
                  {i.name} {i.size ? `(${i.size})` : ""} x{i.qty}
                </div>
              ))}

              <p>Total: ₱{o.total}</p>

              {/* 🍳 DONE BUTTON */}
              <button onClick={() => markDone(o.id)}>
                Mark as Done
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
