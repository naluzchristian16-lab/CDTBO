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

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [variant, setVariant] = useState("Malaki");
  const [addonsSelected, setAddonsSelected] = useState<string[]>([]);
  const [qty, setQty] = useState(1);

  const [discount, setDiscount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [orderType, setOrderType] = useState("dine-in");

  const filtered = products.filter((p) => p.category === category);

  const computeItemPrice = (item: any) => {
    const base = item.basePrice;
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

  const addToCart = () => {
    if (!selectedProduct) return;

    setCart((prev) => [
      ...prev,
      {
        ...selectedProduct,
        variant,
        addons: addonsSelected,
        qty,
      },
    ]);

    setSelectedProduct(null);
    setAddonsSelected([]);
    setQty(1);
  };

  const checkout = async () => {
    if (cart.length === 0) return;

    const order = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      items: cart,
      total: cartTotal,
      discount,
      deliveryFee,
      orderType,
      status: "ongoing",
    };

    try {
      await fetch("/api/saveOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      setOrders((prev) => [order, ...prev]);
      setCart([]);
      setDiscount(0);
      setDeliveryFee(0);
    } catch (err) {
      console.error("checkout error:", err);
    }
  };

  const updateStatus = (id: number, status: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  };

  const ongoing = orders.filter((o) => o.status !== "done");

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>

      {/* SIDEBAR */}
      <div style={{ width: 200, padding: 10, borderRight: "1px solid #ddd" }}>
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
              <div key={p.id}>
                {p.name} ₱{p.basePrice}
                <button onClick={() => setSelectedProduct(p)}>
                  Select
                </button>
              </div>
            ))}
          </div>

          <div style={{ width: 300, padding: 10, borderLeft: "1px solid #ddd" }}>
            <h3>Cart</h3>

            {cart.length === 0 && <p>No items</p>}

            {cart.map((i, idx) => (
              <div key={idx}>
                {i.name} ({i.variant}) x{i.qty} = ₱{computeItemPrice(i)}
              </div>
            ))}

            <hr />

            <p><b>Total: ₱{cartTotal}</b></p>

            <select onChange={(e) => setOrderType(e.target.value)}>
              <option value="dine-in">dine-in</option>
              <option value="takeout">takeout</option>
              <option value="delivery">delivery</option>
            </select>

            <input
              placeholder="Discount"
              type="number"
              onChange={(e) => setDiscount(Number(e.target.value))}
            />

            {orderType === "delivery" && (
              <input
                placeholder="Delivery Fee"
                type="number"
                onChange={(e) => setDeliveryFee(Number(e.target.value))}
              />
            )}

            <button onClick={checkout}>Checkout</button>
          </div>
        </>
      )}

      {/* KITCHEN */}
      {view === "kitchen" && (
        <div style={{ flex: 1, padding: 10 }}>
          <h3>Kitchen</h3>

          {ongoing.map((o) => (
            <div key={o.id} style={{ border: "1px solid #ccc", marginBottom: 10 }}>
              <p><b>Order #{o.id}</b> - {o.status}</p>

              {o.items.map((i: any, idx: number) => (
                <div key={idx}>
                  {i.name} ({i.variant}) x{i.qty}
                </div>
              ))}

              <button onClick={() => updateStatus(o.id, "done")}>
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
              <p><b>Receipt #{o.id}</b></p>
              <p>Status: {o.status}</p>

              {o.items.map((i: any, idx: number) => (
                <div key={idx}>
                  {i.name} x{i.qty}
                </div>
              ))}

              <p>Total: ₱{o.total}</p>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedProduct && (
        <div style={{ position: "absolute", right: 20, top: 20, background: "#fff", padding: 10, border: "1px solid #ccc" }}>
          <h4>{selectedProduct.name}</h4>

          <p>Variant</p>
          {Object.keys(variants).map((v) => (
            <button key={v} onClick={() => setVariant(v)}>
              {v}
            </button>
          ))}

          <p>Add-ons</p>
          {Object.keys(addons).map((a) => (
            <label key={a}>
              <input
                type="checkbox"
                onChange={() =>
                  setAddonsSelected((prev) =>
                    prev.includes(a)
                      ? prev.filter((x) => x !== a)
                      : [...prev, a]
                  )
                }
              />
              {a}
            </label>
          ))}

          <div>
            <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
            {qty}
            <button onClick={() => setQty(qty + 1)}>+</button>
          </div>

          <button onClick={addToCart}>Add</button>
        </div>
      )}
    </div>
  );
}
