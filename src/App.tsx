import { useMemo, useState } from "react";

const categories = ["Hot Drinks", "Iced Coffee", "Non-Coffee", "Oatside"];

const products = [
  { id: 1, name: "Americano", category: "Hot Drinks", basePrice: 75 },
  { id: 2, name: "Spanish Latte", category: "Hot Drinks", basePrice: 99 },
  { id: 3, name: "Iced Americano", category: "Iced Coffee", basePrice: 89 },
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
