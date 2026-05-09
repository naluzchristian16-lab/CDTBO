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

/* ================= PRODUCTS (UNCHANGED) ================= */
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

  { id: 25, name: "Matcha Latte", category: "Matcha Collection", size: "16oz", price: 104, type: "iced", coffee: false },
  { id: 26, name: "Dirty Matcha", category: "Matcha Collection", size: "16oz", price: 114, type: "iced", coffee: true },
  { id: 27, name: "Strawberry Matcha", category: "Matcha Collection", size: "16oz", price: 114, type: "iced", coffee: false },
  { id: 28, name: "Blueberry Matcha", category: "Matcha Collection", size: "16oz", price: 114, type: "iced", coffee: false },
  { id: 29, name: "Mixed Berries Matcha", category: "Matcha Collection", size: "16oz", price: 114, type: "iced", coffee: false },
  { id: 30, name: "Strawberry Dirty Matcha", category: "Matcha Collection", size: "16oz", price: 124, type: "iced", coffee: true },

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

/* ================= ADDONS ================= */
const addons: any = { "Extra Shot": 10 };

export default function App() {
  const [view, setView] = useState<"cashier" | "kitchen" | "admin">("cashier");
  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [category, setCategory] = useState("All Products");
  const [search, setSearch] = useState("");

  const normalizedSearch = search.toLowerCase().trim();

  const baseFiltered = useMemo(() => {
    return products.filter(p =>
      (category === "All Products" || p.category === category) &&
      p.name.toLowerCase().includes(normalizedSearch)
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

  /* ================= CART SAFE FIX ================= */
  const addToCart = (item: any) => {
    setCart(prev => {
      const index = prev.findIndex(p => p.id === item.id && p.size === item.size);

      if (index !== -1) {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          qty: updated[index].qty + 1
        };
        return updated;
      }

      return [...prev, { ...item, qty: 1, addons: [] }];
    });
  };

  const addHot = (p: any) => addToCart({ ...p, size: "12oz" });
  const addIced = (p: any, size: "16oz" | "20oz") => addToCart({ ...p, size });

  const computeItemPrice = (item: any) => {
    const base = item.price * item.qty;
    const addon = item.addons?.includes("Extra Shot") ? 10 * item.qty : 0;
    return base + addon;
  };

  const cartTotal = useMemo(
    () => cart.reduce((sum, i) => sum + computeItemPrice(i), 0),
    [cart]
  );

  const toggleExtraShot = (idx: number) => {
    setCart(prev => {
      const updated = [...prev];
      const item = updated[idx];

      if (!item.addons) item.addons = [];

      if (item.addons.includes("Extra Shot")) {
        item.addons = item.addons.filter((a: string) => a !== "Extra Shot");
      } else {
        item.addons.push("Extra Shot");
      }

      return updated;
    });
  };

  const checkout = () => {
    if (!cart.length) return;

    setOrders(prev => [
      {
        id: Date.now(),
        items: cart,
        total: cartTotal,
        status: "ongoing"
      },
      ...prev
    ]);

    setCart([]);
  };

  const markDone = (id: number) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === id ? { ...o, status: "done" } : o
      )
    );
  };

  const ongoing = orders.filter(o => o.status === "ongoing");
  const done = orders.filter(o => o.status === "done");

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>

      {/* SIDEBAR */}
      <div style={{ width: 220, padding: 10 }}>
        <h3>Coffee D' Titos</h3>

        <button onClick={() => setView("cashier")}>Cashier</button>
        <button onClick={() => setView("kitchen")}>Kitchen</button>
        <button onClick={() => setView("admin")}>Admin</button>

        <hr />

        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {/* CASHIER */}
      {view === "cashier" && (
        <div style={{ display: "flex", flex: 1 }}>

          <div style={{ flex: 1, padding: 10 }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
            />

            {(search ? groupedResults : [{ category, items: baseFiltered }]).map((g, i) => (
              <div key={i}>
                <h4>{g.category}</h4>

                {g.items.map(p => (
                  <div key={p.id}>
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
            ))}
          </div>

          {/* CART */}
          <div style={{ width: 300, padding: 10 }}>

            <h3>Cart</h3>

            {cart.map((i, idx) => (
              <div key={idx} style={{ marginBottom: 10 }}>
                <b>
                  {i.name} {i.size ? `(${i.size})` : ""}
                </b>

                <div>
                  ₱{i.price} × {i.qty} = ₱{computeItemPrice(i)}
                </div>

                <div style={{ display: "flex", gap: 5 }}>
                  <button onClick={() => {
                    setCart(prev => {
                      const u = [...prev];
                      if (u[idx].qty > 1) u[idx].qty--;
                      else u.splice(idx, 1);
                      return u;
                    });
                  }}>-</button>

                  <span>{i.qty}</span>

                  <button onClick={() => {
                    setCart(prev => {
                      const u = [...prev];
                      u[idx].qty++;
                      return u;
                    });
                  }}>+</button>
                </div>

                {i.coffee && (
                  <button onClick={() => toggleExtraShot(idx)}>
                    Extra Shot (+₱10)
                  </button>
                )}
              </div>
            ))}

            <h4>Total: ₱{cartTotal}</h4>
            <button onClick={checkout}>Checkout</button>
          </div>

        </div>
      )}

      {/* KITCHEN */}
      {view === "kitchen" && (
        <div style={{ flex: 1, padding: 20 }}>
          <h2>Kitchen</h2>

          {ongoing.map(o => (
            <div key={o.id}>
              <b>Order #{o.id}</b>

              {o.items.map((i: any, idx: number) => (
                <div key={idx}>
                  {i.name} {i.size} x{i.qty}
                </div>
              ))}

              <h4>₱{o.total}</h4>

              <button onClick={() => markDone(o.id)}>Done</button>
            </div>
          ))}
        </div>
      )}

      {/* ADMIN */}
      {view === "admin" && (
        <div style={{ flex: 1, padding: 20 }}>
          <h2>Completed Orders</h2>

          {done.map(o => (
            <div key={o.id}>
              <b>Order #{o.id}</b>
              <h4>₱{o.total}</h4>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
