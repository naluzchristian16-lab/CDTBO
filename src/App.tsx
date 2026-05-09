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

    /* HOT DRINKS */
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
  
  /* ICED COFFEE */
  { id: 11, name: "Iced Americano", category: "Iced Coffee", size: "16oz", price: 94, type: "iced", coffee: true },
  { id: 12, name: "Iced Spanish Latte", category: "Iced Coffee", size: "16oz", price: 104, type: "iced", coffee: true },
  { id: 13, name: "Iced Mocha", category: "Iced Coffee", size: "16oz", price: 104, type: "iced", coffee: true },
  { id: 14, name: "Iced Caramel Macchiato", category: "Iced Coffee", size: "16oz", price: 114, type: "iced", coffee: true },
  { id: 15, name: "Iced Ube Macchiato", category: "Iced Coffee", size: "16oz", price: 114, type: "iced", coffee: true },
  { id: 16, name: "Iced Strawberry Latte", category: "Iced Coffee", size: "16oz", price: 114, type: "iced", coffee: true },
  { id: 17, name: "Iced Strawberry Mocha", category: "Iced Coffee", size: "16oz", price: 114, type: "iced", coffee: true },

  /* NON COFFEE */
  { id: 18, name: "Strawberry Milk Drink", category: "Non-Coffee", size: "16oz", price: 94, type: "iced", coffee: false },
  { id: 19, name: "Blueberry Milk Drink", category: "Non-Coffee", size: "16oz", price: 94, type: "iced", coffee: false },
  { id: 20, name: "Mixed Berries Milk Drink", category: "Non-Coffee", size: "16oz", price: 94, type: "iced", coffee: false },
  { id: 21, name: "Strawberry Choco", category: "Non-Coffee", size: "16oz", price: 94, type: "iced", coffee: false },
  { id: 22, name: "Green Apple Soda", category: "Non-Coffee", size: "16oz", price: 84, type: "iced", coffee: false },
  { id: 23, name: "Blueberry Soda", category: "Non-Coffee", size: "16oz", price: 84, type: "iced", coffee: false },
  { id: 24, name: "Lychee Soda", category: "Non-Coffee", size: "16oz", price: 84, type: "iced", coffee: false },

  /* MATCHA */
  { id: 25, name: "Matcha Latte", category: "Matcha Collection", size: "16oz", price: 104, type: "iced", coffee: false },
  { id: 26, name: "Dirty Matcha", category: "Matcha Collection", size: "16oz", price: 114, type: "iced", coffee: true },
  { id: 27, name: "Strawberry Matcha", category: "Matcha Collection", size: "16oz", price: 114, type: "iced", coffee: false },
  { id: 28, name: "Blueberry Matcha", category: "Matcha Collection", size: "16oz", price: 114, type: "iced", coffee: false },
  { id: 29, name: "Mixed Berries Matcha", category: "Matcha Collection", size: "16oz", price: 114, type: "iced", coffee: false },
  { id: 30, name: "Strawberry Dirty Matcha", category: "Matcha Collection", size: "16oz", price: 124, type: "iced", coffee: true },

  /* OATSIDE */
  { id: 31, name: "Oatside Spanish Latte", category: "Oatside Series", size: "16oz", price: 104, type: "iced", coffee: true },
  { id: 32, name: "Oatside Mocha", category: "Oatside Series", size: "16oz", price: 104, type: "iced", coffee: true },
  { id: 33, name: "Oatside Caramel Macchiato", category: "Oatside Series", size: "16oz", price: 114, type: "iced", coffee: true },
  { id: 34, name: "Oatside Matcha Latte", category: "Oatside Series", size: "16oz", price: 104, type: "iced", coffee: false },
  { id: 35, name: "Oatside Dirty Matcha", category: "Oatside Series", size: "16oz", price: 114, type: "iced", coffee: false },
  { id: 36, name: "Oatside Strawberry Mocha", category: "Oatside Series", size: "16oz", price: 114, type: "iced", coffee: true },
  { id: 37, name: "Oatside Strawberry Latte", category: "Oatside Series", size: "16oz", price: 114, type: "iced", coffee: true },
  { id: 38, name: "Oatside Strawberry Matcha", category: "Oatside Series", size: "16oz", price: 114, type: "iced", coffee: false },
  { id: 39, name: "Oatside Strawberry Dirty Matcha", category: "Oatside Series", size: "16oz", price: 124, type: "iced", coffee: true },
];

/* ================= ADD ONS ================= */
const addons: any = {
  "Extra Shot": 10
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

  /* ================= TODAY KEY ================= */
  const getTodayKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  };

  /* ================= ORDER NUMBER ================= */
  const getOrderNumber = () => {
    const now = new Date();

    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);

    const todayKey = getTodayKey();
    const todayOrders = orders.filter(o => o.dateKey === todayKey);

    const sequence = todayOrders.length + 1;

    return `Order#${mm}${dd}${yy}${String(sequence).padStart(4, "0")}`;
  };

  /* ================= FILTER ================= */
  const filtered = products.filter((p) => {
    const categoryMatch = category === "All Products" || p.category === category;
    return categoryMatch && p.name.toLowerCase().includes(search.toLowerCase());
  });

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

  /* ================= CART PRICE ================= */
  const computeItemPrice = (item: any) => {
    const base = Number(item.price);
    const addonTotal = (item.addons || []).reduce((sum: number, a: string) => {
      return sum + (addons[a] || 0);
    }, 0);

    return (base + addonTotal) * item.qty;
  };

  const cartTotal = useMemo(() => {
    const subtotal = cart.reduce((sum, i) => sum + computeItemPrice(i), 0);
    return subtotal + Number(deliveryFee) - Number(discount);
  }, [cart, deliveryFee, discount]);

  /* ================= CART ================= */
  const addToCart = (item: any) => {
    setCart(prev => {
      const index = prev.findIndex(p => p.id === item.id && p.size === item.size);

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

  /* ================= CHECKOUT ================= */
  const checkout = async () => {
    if (!cart.length) return;

    const now = new Date();
    const todayKey = getTodayKey();

    const order = {
      id: Date.now(),
      orderNumber: getOrderNumber(),
      dateKey: todayKey,
      time: now.toLocaleTimeString(),
      date: now.toLocaleDateString(),
      items: cart,
      orderType,
      deliveryFee,
      discount,
      total: cartTotal,
      status: "ongoing"
    };

    setOrders(prev => [order, ...prev]);
    setCart([]);
    setDiscount(0);
    setDeliveryFee(0);
  };

  const ongoing = orders.filter(o => o.status !== "done");

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>

      {/* HEADER */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        padding: 10,
        background: "#111",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        zIndex: 10
      }}>
        <span>Coffee D' Titos POS</span>
        <span>{new Date().toLocaleString()}</span>
      </div>

      {/* SIDEBAR */}
      <div style={{ width: 220, padding: 10, paddingTop: 60, borderRight: "1px solid #ddd" }}>
        <h3>Coffee D Titos</h3>

        <button onClick={() => setView("cashier")}>Cashier</button>
        <button onClick={() => setView("kitchen")}>Kitchen</button>
        <button onClick={() => setView("admin")}>Admin</button>

        <hr />

        {categories.map(c => (
          <button
            key={c}
            onClick={() => {
              setCategory(c);
              setSearch("");
            }}
            style={{
              width: "100%",
              marginBottom: 5,
              background: category === c ? "#222" : "#eee",
              color: category === c ? "#fff" : "#000"
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* CASHIER */}
      {view === "cashier" && (
        <>
          <div style={{ flex: 1, padding: 10, paddingTop: 60 }}>
            <input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: 8 }}
            />

            {(search.trim() ? groupedResults : [{ category: "", items: filtered }]).map((group, i) => (
              <div key={i}>
                <h4>{group.category}</h4>

                {group.items.map(p => (
                  <div key={p.id}>
                    <b>{p.name}</b> ₱{p.price}

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
            ))}
          </div>

          {/* CART */}
          <div style={{ width: 300, padding: 10, borderLeft: "1px solid #ddd" }}>
            <h3>Cart</h3>

            {cart.map((i, idx) => (
              <div key={idx}>
                {i.name} x{i.qty} = ₱{computeItemPrice(i)}
              </div>
            ))}

            <b>Total: ₱{cartTotal}</b>

            <button onClick={checkout}>Checkout</button>
          </div>
        </>
      )}

      {/* KITCHEN */}
      {view === "kitchen" && (
        <div style={{ flex: 1, padding: 10, paddingTop: 60 }}>
          <h3>Kitchen</h3>
          {ongoing.map(o => (
            <div key={o.id}>
              <b>{o.orderNumber}</b>
              <p>{o.total}</p>
            </div>
          ))}
        </div>
      )}

      {/* ADMIN */}
      {view === "admin" && (
        <div style={{ flex: 1, padding: 10, paddingTop: 60 }}>
          <h3>Orders</h3>
          {orders.map(o => (
            <div key={o.id}>
              <b>{o.orderNumber}</b>
              <p>₱{o.total}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
