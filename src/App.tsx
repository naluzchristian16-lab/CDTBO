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
  { id: 11, name: "Iced Americano", category: "Iced Coffee", size: "16oz", price: 94, type: "iced", coffee: true },
  { id: 12, name: "Iced Spanish Latte", category: "Iced Coffee", size: "16oz", price: 104, type: "iced", coffee: true }
];

/* ================= ADDONS ================= */
const addons = { "Extra Shot": 10 };

/* ================= ORDER ID ================= */
const formatOrderId = (id) => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}${dd}${yy}${String(id).slice(-4).padStart(4, "0")}`;
};

export default function App() {
  const [view, setView] = useState("cashier");
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [category, setCategory] = useState("All Products");
  const [search, setSearch] = useState("");

  const baseFiltered = useMemo(() => {
    return products.filter(p =>
      (category === "All Products" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase())
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

  /* ================= CART FIXED ================= */
  const addToCart = (item) => {
    setCart(prev => {
      const index = prev.findIndex(
        p =>
          p.id === item.id &&
          p.size === item.size &&
          JSON.stringify(p.addons || []) === JSON.stringify(item.addons || [])
      );

      if (index !== -1) {
        const updated = [...prev];
        updated[index].qty += 1;
        return updated;
      }

      return [
        ...prev,
        {
          ...item,
          qty: 1,
          addons: item.addons ? [...item.addons] : []
        }
      ];
    });
  };

  const addHot = (p) => addToCart({ ...p, size: "12oz", addons: [] });
  const addIced = (p, size) => addToCart({ ...p, size, addons: [] });

  /* ================= EXTRA SHOT FIXED ================= */
  const toggleExtraShot = (idx) => {
    setCart(prev => {
      const updated = [...prev];
      const item = { ...updated[idx] };

      item.addons = item.addons ? [...item.addons] : [];

      if (item.addons.includes("Extra Shot")) {
        item.addons = item.addons.filter(a => a !== "Extra Shot");
      } else {
        item.addons.push("Extra Shot");
      }

      updated[idx] = item;
      return updated;
    });
  };

  const computeItemPrice = (item) => {
    const base = item.price * item.qty;
    const addon = item.addons?.includes("Extra Shot")
      ? addons["Extra Shot"] * item.qty
      : 0;
    return base + addon;
  };

  const cartTotal = useMemo(
    () => cart.reduce((s, i) => s + computeItemPrice(i), 0),
    [cart]
  );

  const checkout = () => {
    if (!cart.length) return;

    setOrders(prev => [
      {
        id: Date.now(),
        orderNo: formatOrderId(Date.now()),
        items: cart,
        total: cartTotal,
        status: "ongoing"
      },
      ...prev
    ]);

    setCart([]);
  };

  const markDone = (id) => {
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

          {/* PRODUCTS */}
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
              <div key={idx} style={{ marginBottom: 12 }}>
                <b>{i.name}</b> {i.size}

                {/* EXTRA SHOT ALWAYS VISIBLE */}
                {i.coffee && (
                  <div>
                    <button onClick={() => toggleExtraShot(idx)}>
                      {i.addons?.includes("Extra Shot")
                        ? "Remove Extra Shot"
                        : "Add Extra Shot (+₱10)"}
                    </button>
                  </div>
                )}

                {i.addons?.includes("Extra Shot") && (
                  <div style={{ color: "green" }}>
                    + Extra Shot
                  </div>
                )}

                <div>₱{computeItemPrice(i)}</div>

                {/* +/- CONTROLS */}
                <div style={{ display: "flex", gap: 5 }}>
                  <button onClick={() => setCart(prev => {
                    const u = [...prev];
                    if (u[idx].qty > 1) u[idx].qty--;
                    else u.splice(idx, 1);
                    return u;
                  })}>-</button>

                  <span>{i.qty}</span>

                  <button onClick={() => setCart(prev => {
                    const u = [...prev];
                    u[idx].qty++;
                    return u;
                  })}>+</button>
                </div>
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
              <b>Order #{o.orderNo}</b>

              {o.items.map((i, idx) => (
                <div key={idx}>
                  {i.name} {i.size}
                  {i.addons?.includes("Extra Shot") && " +Extra Shot"}
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
              <b>Order #{o.orderNo}</b>
              <h4>₱{o.total}</h4>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
