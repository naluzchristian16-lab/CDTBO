import { useMemo, useState } from "react";

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

export default function App() {
  const [view, setView] = useState("cashier");
  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [category, setCategory] = useState("All Products");
  const [search, setSearch] = useState("");

  const [orderType, setOrderType] = useState("dine-in");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [discount, setDiscount] = useState("");
  const [cash, setCash] = useState("");

  const baseFiltered = useMemo(() => {
    return products.filter(
      p =>
        (category === "All Products" || p.category === category) &&
        p.name.toLowerCase().includes(search.toLowerCase().trim())
    );
  }, [category, search]);

  const groupedResults = useMemo(() => {
    return categories
      .filter(c => c !== "All Products")
      .map(c => ({
        category: c,
        items: baseFiltered.filter(p => p.category === c)
      }))
      .filter(g => g.items.length > 0);
  }, [baseFiltered]);

  const generateOrderNumber = () => {
    const d = new Date();
    return (
      String(d.getMonth() + 1).padStart(2, "0") +
      String(d.getDate()).padStart(2, "0") +
      String(d.getFullYear()).slice(-2) +
      String(orders.length + 1).padStart(4, "0")
    );
  };

  const addToCart = (item: any) => {
    setCart(prev => {
      const i = prev.findIndex(
        p =>
          p.id === item.id &&
          p.size === item.size &&
          JSON.stringify(p.addons || []) === JSON.stringify(item.addons || [])
      );

      if (i !== -1) {
        const copy = [...prev];
        copy[i].qty++;
        return copy;
      }

      return [...prev, { ...item, qty: 1, addons: item.addons || [] }];
    });
  };

  const addHot = (p: any) => addToCart({ ...p, size: "12oz" });
  const addIced = (p: any, size: string) =>
  addToCart({
    ...p,
    size,
    price: size === "20oz" ? p.price + 10 : p.price
  });

  const toggleExtraShot = (idx: number) => {
    setCart(prev => {
      const copy = [...prev];
      const current = copy[idx];

      const updatedAddons = current.addons?.includes("Extra Shot")
        ? current.addons.filter((a: string) => a !== "Extra Shot")
        : [...(current.addons || []), "Extra Shot"];

      const existing = copy.findIndex(
        (p, i) =>
          i !== idx &&
          p.id === current.id &&
          p.size === current.size &&
          JSON.stringify(p.addons || []) === JSON.stringify(updatedAddons)
      );

      if (existing !== -1) {
        copy[existing].qty += current.qty;
        copy.splice(idx, 1);
        return copy;
      }

      copy[idx] = {
        ...current,
        addons: updatedAddons
      };

      return copy;
    });
  };

  const computeItemPrice = (item: any) => {
    const base = item.price * item.qty;
    const addon = item.addons?.includes("Extra Shot") ? 10 * item.qty : 0;
    return base + addon;
  };

  const cartTotal = cart.reduce((s, i) => s + computeItemPrice(i), 0);

  const fee = orderType === "delivery" ? Number(deliveryFee || 0) : 0;
  const discountValue = Number(discount || 0);
  const totalWithFee = cartTotal + fee - discountValue;
  const cashPaid = Number(cash || 0);
  const change = cash ? cashPaid - totalWithFee : 0;

  const checkout = async () => {
    if (!cart.length) return;

    const now = new Date();

    const order = {
      orderNumber: generateOrderNumber(),
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      items: cart,
      total: totalWithFee,
      status: "ongoing",
      orderType,
      deliveryFee: fee,
      discount: discountValue,
      cash: cashPaid,
      change
    };

    setOrders(prev => [order, ...prev]);
    setCart([]);

    setOrderType("dine-in");
    setDeliveryFee("");
    setDiscount("");
    setCash("");

    try {
      await fetch("/api/saveOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const markDone = (id: string) => {
    setOrders(prev =>
      prev.map(o =>
        o.orderNumber === id ? { ...o, status: "done" } : o
      )
    );
  };

  const ongoing = orders.filter(o => o.status === "ongoing");
  const done = orders.filter(o => o.status === "done");

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
          <div key={c}>
            <button onClick={() => setCategory(c)}>{c}</button>
          </div>
        ))}
      </div>

      {/* CASHIER */}
      {view === "cashier" && (
        <div style={{ display: "flex", flex: 1 }}>
          {/* MENU */}
          <div style={{ flex: 1, padding: 10 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
            />

            {(search
              ? groupedResults
              : [{ category, items: baseFiltered }]
            ).map((g: any, i: number) => (
              <div key={i}>
                <h4>{g.category}</h4>

                {g.items.map((p: any) => (
                  <div key={p.id}>
                    {p.name} ₱{p.price}

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
            ))}
          </div>

          {/* CART */}
          <div style={{ width: 320, padding: 10 }}>
            <h3>Cart</h3>

            {cart.map((i, idx) => (
              <div key={idx} style={{ marginBottom: 12 }}>
                <b>{i.name}</b> ({i.size})

                {i.addons?.length > 0 && (
                  <div style={{ fontSize: 12, color: "green" }}>
                    + {i.addons.join(", ")}
                  </div>
                )}

                <div>
                  ₱{i.price} x {i.qty} = ₱{computeItemPrice(i)}
                </div>

                <button
                  onClick={() =>
                    setCart(prev => {
                      const c = [...prev];
                      if (c[idx].qty > 1) c[idx].qty--;
                      else c.splice(idx, 1);
                      return c;
                    })
                  }
                >
                  -
                </button>

                <span style={{ margin: "0 8px" }}>{i.qty}</span>

                <button
                  onClick={() =>
                    setCart(prev => {
                      const c = [...prev];
                      c[idx].qty++;
                      return c;
                    })
                  }
                >
                  +
                </button>

                {i.coffee && (
                  <button
                    onClick={() => toggleExtraShot(idx)}
                    style={{ marginLeft: 8 }}
                  >
                    Extra Shot
                  </button>
                )}
              </div>
            ))}

            <div style={{ marginBottom: 8 }}>
              <label>Order Type: </label>
              <select
                value={orderType}
                onChange={e => setOrderType(e.target.value)}
              >
                <option value="dine-in">Dine-in</option>
                <option value="take-out">Take-out</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>

            {orderType === "delivery" && (
              <div style={{ marginBottom: 8 }}>
                <input
                  placeholder="Delivery Fee"
                  value={deliveryFee}
                  onChange={e => setDeliveryFee(e.target.value)}
                />
              </div>
            )}

            <div style={{ marginBottom: 8 }}>
              <input
                placeholder="Discount"
                value={discount}
                onChange={e => setDiscount(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <input
                placeholder="Cash Received"
                value={cash}
                onChange={e => setCash(e.target.value)}
              />
            </div>

            <h4>Total: ₱{totalWithFee}</h4>

            {cash && (
              <h4 style={{ color: change >= 0 ? "green" : "red" }}>
                Change: ₱{change}
              </h4>
            )}

            <button onClick={checkout}>Checkout</button>
          </div>
        </div>
      )}

      {/* KITCHEN */}
      {view === "kitchen" && (
        <div style={{ flex: 1, padding: 20, textAlign: "center" }}>
          <h2>Kitchen</h2>

          {ongoing.map(o => (
            <div
              key={o.orderNumber}
              style={{ border: "1px solid #ddd", margin: 10, padding: 10 }}
            >
              <b>Order #{o.orderNumber}</b>

              {o.items.map((i: any, idx: number) => (
                <div key={idx}>
                  {i.name} ({i.size}) x{i.qty}
                  {i.addons?.length > 0 && (
                    <div style={{ fontSize: 12, color: "green" }}>
                      + {i.addons.join(", ")}
                    </div>
                  )}
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
        <div
          style={{
            flex: 1,
            padding: 20,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <h2>Completed Orders</h2>

          {done.map(o => (
            <div
              key={o.orderNumber}
              style={{
                width: "80%",
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 15,
                marginBottom: 15
              }}
            >
              <b style={{ fontSize: 18 }}>Order #{o.orderNumber}</b>

              <div style={{ fontSize: 12, marginTop: 4 }}>
                {o.date} • {o.time}
              </div>

              <div style={{ marginTop: 10 }}>
                {o.items.map((i: any, idx: number) => (
                  <div key={idx} style={{ marginBottom: 8 }}>
                    🍹 <b>{i.name}</b> ({i.size}) x{i.qty}

                    {i.addons?.length > 0 && (
                      <div style={{ fontSize: 12, color: "green" }}>
                        + {i.addons.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <h3>Total: ₱{o.total}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
