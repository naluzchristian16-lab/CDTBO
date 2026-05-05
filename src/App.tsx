import { useMemo, useState } from "react";

/* ================= CATEGORIES ================= */
const categories = ["Hot Drinks", "Iced Coffee", "Non-Coffee", "Oatside Series"];

/* ================= PRODUCTS ================= */
const products = [
  // HOT
  { id: 1, name: "Hot Americano", category: "Hot Drinks", size: "12oz", price: 69, type: "hot", coffee: true },
  { id: 2, name: "Hot Spanish Latte", category: "Hot Drinks", size: "12oz", price: 79, type: "hot", coffee: true },

  // ICED 16
  { id: 11, name: "Iced Americano", category: "Iced Coffee", size: "16oz", price: 89, type: "iced", coffee: true },
  { id: 12, name: "Iced Mocha", category: "Iced Coffee", size: "16oz", price: 89, type: "iced", coffee: true },

  // NON COFFEE
  { id: 47, name: "Strawberry Milk Drink", category: "Non-Coffee", size: "16oz", price: 79, type: "iced", coffee: false }
];

/* ================= ADD ONS ================= */
const addons: any = {
  "Extra Shot": 10
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
  const checkout = async () => {
    if (!cart.length) return;

    const order = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
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
              <b>Order #{o.id}</b>

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
              <b>Receipt #{o.id}</b>
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
    </div>
  );
}
