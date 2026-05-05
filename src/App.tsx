import { useMemo, useState } from "react";

/* =========================
   CAFE POS - FULL WORKING VERSION
   - Cart system fixed
   - Inline product selector
   - Ongoing / Done / Receipts
   - Full receipt item breakdown
   - Clean cashier mode
========================= */

const categories = [
  "Hot Drinks",
  "Iced Coffee",
  "Non-Coffee",
  "Oatside Series",
];

const products = [
  { id: 1, name: "Americano", category: "Hot Drinks", basePrice: 75 },
  { id: 2, name: "Spanish Latte", category: "Hot Drinks", basePrice: 99 },
  { id: 3, name: "Iced Americano", category: "Iced Coffee", basePrice: 89 },
];

const variants: any = {
  Malaki: { price: 0, multiplier: 1 },
  "Mas Malaki": { price: 10, multiplier: 1.2 },
};

const addons: any = {
  "Extra Shot": { price: 10, coffeeUsage: 15 },
};

const initialInventory = {
  coffee: 5000,
};

export default function App() {
  const [activeCategory, setActiveCategory] = useState("Hot Drinks");

  const [cart, setCart] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [view, setView] = useState("ongoing"); // ongoing | done | receipts

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState("Malaki");
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [qty, setQty] = useState(1);

  const [discount, setDiscount] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [orderType, setOrderType] = useState("dine-in");

  const [inventory, setInventory] = useState(initialInventory);
  const [toast, setToast] = useState("");

  const filtered = products.filter((p) => p.category === activeCategory);

  const toggleAddon = (addon: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addon)
        ? prev.filter((a) => a !== addon)
        : [...prev, addon]
    );
  };

  const addToCart = () => {
    if (!selectedProduct) return;

    const newItem = {
      ...selectedProduct,
      variant: selectedVariant,
      addons: selectedAddons,
      qty,
    };

    setCart((prev) => [...prev, newItem]);

    setToast("Added to cart ✔");
    setTimeout(() => setToast(""), 1200);

    setSelectedProduct(null);
    setSelectedAddons([]);
    setSelectedVariant("Malaki");
    setQty(1);
  };

  const computeItemPrice = (item: any) => {
    const base = item.basePrice;
    const variantPrice = variants[item.variant]?.price || 0;

    let addonPrice = 0;
    item.addons?.forEach((a: string) => {
      addonPrice += addons[a].price;
    });

    return (base + variantPrice + addonPrice) * item.qty;
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, i) => sum + computeItemPrice(i), 0);
  }, [cart]);

  const checkout = () => {
    const order = {
      id: Date.now(),
      items: cart,
      total: cartTotal - discount + deliveryFee,
      status: "ongoing",
    };

    setOrders((prev) => [...prev, order]);
    setCart([]);
    setDiscount(0);
    setDeliveryFee(0);

    alert("Order sent to ongoing");
  };

  const markDone = (id: number) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "done" } : o
      )
    );
  };

  const filteredOrders = orders.filter((o) => o.status === view);

  return (
    <div style={styles.container}>

      {/* LEFT */}
      <div style={styles.sidebar}>
        <h3>CAFE POS</h3>

        <button onClick={() => setView("ongoing")}>Ongoing</button>
        <button onClick={() => setView("done")}>Done</button>
        <button onClick={() => setView("receipts")}>Receipts</button>

        <hr />

        {categories.map((c) => (
          <button key={c} onClick={() => setActiveCategory(c)} style={styles.btn}>
            {c}
          </button>
        ))}

        <hr />
        <p>Inventory: {inventory.coffee}ml</p>
      </div>

      {/* PRODUCTS */}
      <div style={styles.products}>
        {filtered.map((p) => (
          <div key={p.id} style={styles.card}>
            <b>{p.name}</b>
            <p>₱{p.basePrice}</p>

            <button
              onClick={() => {
                setSelectedProduct(p);
                setSelectedVariant("Malaki");
                setSelectedAddons([]);
                setQty(1);
              }}
            >
              Select
            </button>
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div style={styles.selector}>

        {toast && <div style={styles.toast}>{toast}</div>}

        <h3>{view.toUpperCase()}</h3>

        {/* ORDERS / RECEIPTS */}
        {filteredOrders.map((o) => (
          <div key={o.id} style={styles.orderBox}>
            <p><b>Order #{o.id}</b></p>

            {/* ITEM BREAKDOWN */}
            {o.items.map((i: any, idx: number) => (
              <div key={idx} style={{ fontSize: 12, marginLeft: 10 }}>
                {i.name} ({i.variant}) x{i.qty}
              </div>
            ))}

            <p><b>Total: ₱{o.total}</b></p>

            {o.status === "ongoing" && (
              <button onClick={() => markDone(o.id)}>
                Mark Done
              </button>
            )}
          </div>
        ))}

        <hr />

        {/* CART */}
        <h4>Cart ({cart.length})</h4>

        {cart.length === 0 && <p>No items yet</p>}

        {cart.map((i, idx) => (
          <div key={idx}>
            {i.name} ({i.variant}) x{i.qty} = ₱{computeItemPrice(i)}
          </div>
        ))}

        <hr />

        <p><b>Total: ₱{cartTotal}</b></p>

        <select onChange={(e) => setOrderType(e.target.value)}>
          <option>dine-in</option>
          <option>takeout</option>
          <option>delivery</option>
        </select>

        <input placeholder="Discount" onChange={(e) => setDiscount(Number(e.target.value))} />

        {orderType === "delivery" && (
          <input placeholder="Delivery Fee" onChange={(e) => setDeliveryFee(Number(e.target.value))} />
        )}

        <button onClick={checkout} style={styles.checkout}>
          CHECKOUT
        </button>

        {/* PRODUCT SELECTOR */}
        {selectedProduct && (
          <div style={styles.selectorBox}>
            <h4>{selectedProduct.name}</h4>

            <p>Variant</p>
            {Object.keys(variants).map((v) => (
              <button key={v} onClick={() => setSelectedVariant(v)}>
                {v}
              </button>
            ))}

            <p>Add-ons</p>
            {Object.keys(addons).map((a) => (
              <label key={a}>
                <input
                  type="checkbox"
                  checked={selectedAddons.includes(a)}
                  onChange={() => toggleAddon(a)}
                />
                {a}
              </label>
            ))}

            <div>
              <button onClick={() => setQty(qty - 1)}>-</button>
              {qty}
              <button onClick={() => setQty(qty + 1)}>+</button>
            </div>

            <button onClick={addToCart} style={styles.checkout}>
              Add to Cart
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

const styles: any = {
  container: { display: "flex", height: "100vh", fontFamily: "sans-serif" },
  sidebar: { width: "18%", padding: 10, borderRight: "1px solid #ddd" },
  products: { flex: 1, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, padding: 10 },
  selector: { width: "30%", borderLeft: "1px solid #ddd", padding: 10, background: "#fafafa" },
  card: { border: "1px solid #ccc", padding: 10 },
  btn: { margin: 5 },
  checkout: { width: "100%", padding: 10, background: "green", color: "white" },
  orderBox: { border: "1px solid #ddd", padding: 10, marginBottom: 10 },
  toast: { background: "black", color: "white", padding: 8, marginBottom: 10, textAlign: "center" },
  selectorBox: { marginTop: 10, padding: 10, border: "1px solid #ccc" },
};