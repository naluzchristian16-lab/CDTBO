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
  // HOT DRINKS
  { id: 1, name: "Hot Americano", category: "Hot Drinks", price: 84, type: "hot", coffee: true },
  { id: 2, name: "Hot Spanish Latte", category: "Hot Drinks", price: 94, type: "hot", coffee: true },
  { id: 3, name: "Hot Mocha", category: "Hot Drinks", price: 94, type: "hot", coffee: true },
  { id: 4, name: "Hot Caramel Macchiato", category: "Hot Drinks", price: 104, type: "hot", coffee: true },
  { id: 5, name: "Hot Strawberry Latte", category: "Hot Drinks", price: 104, type: "hot", coffee: true },
  { id: 6, name: "Hot Strawberry Mocha", category: "Hot Drinks", price: 104, type: "hot", coffee: true },
  { id: 7, name: "Hot Matcha Latte", category: "Hot Drinks", price: 94, type: "hot", coffee: false },
  { id: 8, name: "Hot Strawberry Matcha", category: "Hot Drinks", price: 104, type: "hot", coffee: false },
  { id: 9, name: "Hot Strawberry Dirty Matcha", category: "Hot Drinks", price: 114, type: "hot", coffee: true },
  { id: 10, name: "Hot Blueberry Matcha", category: "Hot Drinks", price: 104, type: "hot", coffee: false },

  // ICED COFFEE
  { id: 11, name: "Iced Americano", category: "Iced Coffee", price: 94, type: "iced", coffee: true },
  { id: 12, name: "Iced Spanish Latte", category: "Iced Coffee", price: 104, type: "iced", coffee: true },
  { id: 13, name: "Iced Mocha", category: "Iced Coffee", price: 104, type: "iced", coffee: true },
  { id: 14, name: "Iced Caramel Macchiato", category: "Iced Coffee", price: 114, type: "iced", coffee: true },
  { id: 15, name: "Iced Ube Macchiato", category: "Iced Coffee", price: 114, type: "iced", coffee: true },
  { id: 16, name: "Iced Strawberry Latte", category: "Iced Coffee", price: 114, type: "iced", coffee: true },
  { id: 17, name: "Iced Strawberry Mocha", category: "Iced Coffee", price: 114, type: "iced", coffee: true },

  // OATSIDE
  { id: 25, name: "Oatside Spanish Latte", category: "Oatside Series", price: 104, type: "iced", coffee: true },
  { id: 26, name: "Oatside Mocha", category: "Oatside Series", price: 104, type: "iced", coffee: true },
  { id: 27, name: "Oatside Caramel Macchiato", category: "Oatside Series", price: 114, type: "iced", coffee: true },
  { id: 28, name: "Oatside Matcha Latte", category: "Oatside Series", price: 104, type: "iced", coffee: false },
  { id: 29, name: "Oatside Dirty Matcha", category: "Oatside Series", price: 114, type: "iced", coffee: false },
  { id: 30, name: "Oatside Strawberry Mocha", category: "Oatside Series", price: 114, type: "iced", coffee: true },
  { id: 31, name: "Oatside Strawberry Latte", category: "Oatside Series", price: 114, type: "iced", coffee: true },
  { id: 32, name: "Oatside Strawberry Matcha", category: "Oatside Series", price: 114, type: "iced", coffee: false },
  { id: 33, name: "Oatside Strawberry Dirty Matcha", category: "Oatside Series", price: 124, type: "iced", coffee: true },

  // NON COFFEE
  { id: 43, name: "Strawberry Milk Drink", category: "Non-Coffee", price: 94, type: "iced", coffee: false },
  { id: 44, name: "Blueberry Milk Drink", category: "Non-Coffee", price: 94, type: "iced", coffee: false },
  { id: 45, name: "Mixed Berries Milk Drink", category: "Non-Coffee", price: 94, type: "iced", coffee: false },
  { id: 46, name: "Strawberry Choco", category: "Non-Coffee", price: 94, type: "iced", coffee: false },
  { id: 47, name: "Green Apple Soda", category: "Non-Coffee", price: 84, type: "iced", coffee: false },
  { id: 48, name: "Blueberry Soda", category: "Non-Coffee", price: 84, type: "iced", coffee: false },
  { id: 49, name: "Lychee Soda", category: "Non-Coffee", price: 84, type: "iced", coffee: false },

  // MATCHA
  { id: 57, name: "Matcha Latte", category: "Matcha Collection", price: 104, type: "iced", coffee: false },
  { id: 58, name: "Dirty Matcha", category: "Matcha Collection", price: 114, type: "iced", coffee: true },
  { id: 59, name: "Strawberry Matcha", category: "Matcha Collection", price: 114, type: "iced", coffee: false },
  { id: 60, name: "Blueberry Matcha", category: "Matcha Collection", price: 114, type: "iced", coffee: false },
  { id: 61, name: "Mixed Berries Matcha", category: "Matcha Collection", price: 114, type: "iced", coffee: false },
  { id: 62, name: "Strawberry Dirty Matcha", category: "Matcha Collection", price: 124, type: "iced", coffee: true }
];

/* ================= ADD ONS ================= */
const addons: any = {
  "Extra Shot": 10
};

const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

export default function App() {
  const [view, setView] = useState<"cashier" | "kitchen" | "admin">("cashier");
  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [category, setCategory] = useState("All Products");
  const [search, setSearch] = useState("");
  const [orderType, setOrderType] = useState("dine-in");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [discount, setDiscount] = useState(0);

  /* ================= FILTER ================= */
  const filtered = products.filter(p => {
    const matchCategory =
      category === "All Products" || p.category === category;

    return (
      matchCategory &&
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  /* ================= GROUP SEARCH ================= */
  const groupedResults = categories
    .filter(c => c !== "All Products")
    .map(c => ({
      category: c,
      items: products.filter(
        p =>
          p.category === c &&
          p.name.toLowerCase().includes(search.toLowerCase())
      )
    }))
    .filter(g => g.items.length > 0);

  /* ================= CART ================= */
  const addToCart = (p: any, size = "16oz") => {
    setCart(prev => {
      const key = p.id + size;

      const existing = prev.find(i => i.key === key);
      if (existing) {
        return prev.map(i =>
          i.key === key ? { ...i, qty: i.qty + 1 } : i
        );
      }

      return [
        ...prev,
        {
          key,
          ...p,
          size,
          qty: 1,
          addons: []
        }
      ];
    });
  };

  const toggleAddon = (index: number) => {
    setCart(prev => {
      const copy = [...prev];
      const item = copy[index];

      if (!item.addons) item.addons = [];

      item.addons = item.addons.includes("Extra Shot")
        ? item.addons.filter((a: string) => a !== "Extra Shot")
        : [...item.addons, "Extra Shot"];

      return copy;
    });
  };

  const removeFromCart = (i: number) =>
    setCart(prev => prev.filter((_, idx) => idx !== i));

  const compute = (i: any) =>
    (i.price + (i.addons?.length ? addons["Extra Shot"] : 0)) * i.qty;

  const total = cart.reduce((a, b) => a + compute(b), 0);

  /* ================= CHECKOUT ================= */
  const checkout = () => {
    if (!cart.length) return;

    const order = {
      id: Date.now(),
      orderNumber: `ORD-${Date.now()}`,
      items: cart,
      total: total + deliveryFee - discount,
      status: "ongoing",
      dateKey: getTodayKey()
    };

    setOrders(prev => [order, ...prev]);
    setCart([]);
  };

  const ongoing = orders.filter(o => o.status !== "done");

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* HEADER */}
      <div style={{
        position: "fixed",
        top: 0,
        width: "100%",
        background: "#111",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        padding: 10,
        zIndex: 10
      }}>
        <div style={{ display: "flex", gap: 10 }}>
          <img src="/CFDTLOGO.png" width={30} />
          <b>Coffee D' Titos POS</b>
        </div>
        <span>{new Date().toLocaleString()}</span>
      </div>

      {/* SIDEBAR */}
      <div style={{ width: 220, padding: 10, paddingTop: 60 }}>
        {categories.map(c => (
          <button key={c} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: 10, paddingTop: 60 }}>

        <input
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        {(search ? groupedResults : filtered.map(p => ({ category: p.category, items: [p] })))
          .map(group => (
            <div key={group.category}>
              <h3>{group.category}</h3>

              {group.items.map(p => (
                <div key={p.id}>
                  <b>{p.name}</b> ₱{p.price}

                  {p.type === "iced" && (
                    <>
                      <button onClick={() => addToCart(p, "16oz")}>Malaki</button>
                      <button onClick={() => addToCart(p, "20oz")}>Mas Malaki</button>
                    </>
                  )}

                  {p.type === "hot" && (
                    <button onClick={() => addToCart(p, "12oz")}>Add</button>
                  )}
                </div>
              ))}
            </div>
          ))
        }
      </div>

      {/* CART */}
      <div style={{ width: 300, padding: 10 }}>
        <h3>Cart</h3>

        {cart.map((i, idx) => (
          <div key={idx}>
            {i.name} ({i.size}) x{i.qty} = ₱{compute(i)}

            {i.coffee && (
              <button onClick={() => toggleAddon(idx)}>
                Extra Shot
              </button>
            )}

            <button onClick={() => removeFromCart(idx)}>Remove</button>
          </div>
        ))}

        <hr />
        <b>Total: ₱{total}</b>

        <button onClick={checkout}>Checkout</button>
      </div>
    </div>
  );
}
