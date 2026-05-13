import { useMemo, useEffect, useState } from "react";

import { db, auth } from "./firebase";

import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc
} from "firebase/firestore";

import {
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

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
  { id: 1, name: "Hot Americano", category: "Hot Drinks", size: "12oz", price: 69, type: "hot", coffee: true },
  { id: 2, name: "Hot Spanish Latte", category: "Hot Drinks", size: "12oz", price: 79, type: "hot", coffee: true },
  { id: 3, name: "Hot Mocha", category: "Hot Drinks", size: "12oz", price: 79, type: "hot", coffee: true },
  { id: 4, name: "Hot Caramel Macchiato", category: "Hot Drinks", size: "12oz", price: 89, type: "hot", coffee: true },
  { id: 5, name: "Hot Strawberry Latte", category: "Hot Drinks", size: "12oz", price: 89, type: "hot", coffee: true },
  { id: 6, name: "Hot Strawberry Mocha", category: "Hot Drinks", size: "12oz", price: 89, type: "hot", coffee: true },
  { id: 7, name: "Hot Matcha Latte", category: "Hot Drinks", size: "12oz", price: 79, type: "hot", coffee: false },
  { id: 8, name: "Hot Strawberry Matcha", category: "Hot Drinks", size: "12oz", price: 89, type: "hot", coffee: false },
  { id: 9, name: "Hot Strawberry Dirty Matcha", category: "Hot Drinks", size: "12oz", price: 99, type: "hot", coffee: true },
  { id: 10, name: "Hot Blueberry Matcha", category: "Hot Drinks", size: "12oz", price: 89, type: "hot", coffee: false },

  { id: 11, name: "Iced Americano", category: "Iced Coffee", size: "16oz", price: 79, type: "iced", coffee: true },
  { id: 12, name: "Iced Spanish Latte", category: "Iced Coffee", size: "16oz", price: 89, type: "iced", coffee: true },
  { id: 13, name: "Iced Mocha", category: "Iced Coffee", size: "16oz", price: 89, type: "iced", coffee: true },
  { id: 14, name: "Iced Caramel Macchiato", category: "Iced Coffee", size: "16oz", price: 99, type: "iced", coffee: true },
  { id: 15, name: "Iced Ube Macchiato", category: "Iced Coffee", size: "16oz", price: 99, type: "iced", coffee: true },
  { id: 16, name: "Iced Strawberry Latte", category: "Iced Coffee", size: "16oz", price: 99, type: "iced", coffee: true },
  { id: 17, name: "Iced Strawberry Mocha", category: "Iced Coffee", size: "16oz", price: 99, type: "iced", coffee: true },

  { id: 18, name: "Strawberry Milk Drink", category: "Non-Coffee", size: "16oz", price: 79, type: "iced", coffee: false },
  { id: 19, name: "Blueberry Milk Drink", category: "Non-Coffee", size: "16oz", price: 79, type: "iced", coffee: false },
  { id: 20, name: "Mixed Berries Milk Drink", category: "Non-Coffee", size: "16oz", price: 79, type: "iced", coffee: false },
  { id: 21, name: "Strawberry Choco", category: "Non-Coffee", size: "16oz", price: 79, type: "iced", coffee: false },
  { id: 22, name: "Green Apple Soda", category: "Non-Coffee", size: "16oz", price: 69, type: "iced", coffee: false },
  { id: 23, name: "Blueberry Soda", category: "Non-Coffee", size: "16oz", price: 69, type: "iced", coffee: false },
  { id: 24, name: "Lychee Soda", category: "Non-Coffee", size: "16oz", price: 69, type: "iced", coffee: false },

  { id: 25, name: "Iced Matcha Latte", category: "Matcha Collection", size: "16oz", price: 89, type: "iced", coffee: false },
  { id: 26, name: "Iced Dirty Matcha", category: "Matcha Collection", size: "16oz", price: 99, type: "iced", coffee: true },
  { id: 27, name: "Iced Strawberry Matcha", category: "Matcha Collection", size: "16oz", price: 99, type: "iced", coffee: false },
  { id: 28, name: "Iced Blueberry Matcha", category: "Matcha Collection", size: "16oz", price: 99, type: "iced", coffee: false },
  { id: 29, name: "Iced Mixed Berries Matcha", category: "Matcha Collection", size: "16oz", price: 99, type: "iced", coffee: false },
  { id: 30, name: "Iced Strawberry Dirty Matcha", category: "Matcha Collection", size: "16oz", price: 109, type: "iced", coffee: true },

  { id: 31, name: "Oatside Spanish Latte", category: "Oatside Series", size: "16oz", price: 89, type: "iced", coffee: true },
  { id: 32, name: "Oatside Mocha", category: "Oatside Series", size: "16oz", price: 89, type: "iced", coffee: true },
  { id: 33, name: "Oatside Caramel Macchiato", category: "Oatside Series", size: "16oz", price: 99, type: "iced", coffee: true },
  { id: 34, name: "Oatside Matcha Latte", category: "Oatside Series", size: "16oz", price: 89, type: "iced", coffee: false },
  { id: 35, name: "Oatside Dirty Matcha", category: "Oatside Series", size: "16oz", price: 99, type: "iced", coffee: false },
  { id: 36, name: "Oatside Strawberry Mocha", category: "Oatside Series", size: "16oz", price: 99, type: "iced", coffee: true },
  { id: 37, name: "Oatside Strawberry Latte", category: "Oatside Series", size: "16oz", price: 99, type: "iced", coffee: true },
  { id: 38, name: "Oatside Strawberry Matcha", category: "Oatside Series", size: "16oz", price: 99, type: "iced", coffee: false },
  { id: 39, name: "Oatside Strawberry Dirty Matcha", category: "Oatside Series", size: "16oz", price: 109, type: "iced", coffee: true }
];

/* ================= DEVICES ================= */
const DEVICE_IDS = ["POS1", "POS2", "POS3"];

export default function App() {

  /* ================= LOGIN ================= */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);

  /* ================= POS ================= */
  const [view, setView] = useState("cashier");

  const [deviceId, setDeviceId] = useState(
    localStorage.getItem("deviceId") || ""
  );

  const [orders, setOrders] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  const [category, setCategory] = useState("All Products");
  const [search, setSearch] = useState("");

  const [orderType, setOrderType] = useState("dine-in");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [discount, setDiscount] = useState("");
  const [cash, setCash] = useState("");

  /* ================= FIREBASE LIVE ================= */
  useEffect(() => {

    const unsub = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {

        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));

        setOrders(data);

      }
    );

    return () => unsub();

  }, []);

  /* ================= LOGIN ================= */
  const login = async () => {

    try {

      const res = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      setUser(res.user);

    } catch (err) {
      alert("Invalid login");
    }

  };

  /* ================= LOGOUT ================= */
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  /* ================= DEVICE ================= */
  const initDevice = (id: string) => {
    localStorage.setItem("deviceId", id);
    setDeviceId(id);
  };

  /* ================= CART KEY ================= */
  const makeKey = (item: any) => {

    const addons = item.addons
      ? [...item.addons].sort().join("|")
      : "";

    return `${item.id}-${item.sizeType}-${item.sizeExtra}-${addons}`;

  };

  /* ================= ADD TO CART ================= */
  const addToCart = (
    item: any,
    sizeType: string,
    sizeExtra = 0
  ) => {

    setCart(prev => {

      const newItem = {
        ...item,
        qty: 1,
        sizeType,
        sizeExtra,
        addons: []
      };

      const idx = prev.findIndex(
        p => makeKey(p) === makeKey(newItem)
      );

      if (idx !== -1) {

        const copy = [...prev];
        copy[idx].qty += 1;

        return copy;
      }

      return [...prev, newItem];

    });

  };

  /* ================= QTY ================= */
  const updateQty = (idx: number, delta: number) => {

    setCart(prev => {

      const copy = [...prev];

      copy[idx].qty += delta;

      if (copy[idx].qty <= 0) {
        copy.splice(idx, 1);
      }

      return copy;

    });

  };

  /* ================= ADDONS ================= */
  const toggleExtraShot = (idx: number) => {

    setCart(prev => {

      const copy = [...prev];

      const item = { ...copy[idx] };

      const addons = item.addons
        ? [...item.addons]
        : [];

      if (addons.includes("Extra Shot")) {

        item.addons = addons.filter(
          (a: string) => a !== "Extra Shot"
        );

      } else {

        item.addons = [
          ...addons,
          "Extra Shot"
        ];

      }

      copy[idx] = item;

      return copy;

    });

  };

  /* ================= COMPUTE ================= */
  const computeItem = (item: any) => {

    const base =
      item.price * item.qty;

    const size =
      (item.sizeExtra || 0) * item.qty;

    const addon =
      (item.addons?.includes("Extra Shot") ? 10 : 0)
      * item.qty;

    return base + size + addon;

  };

  const cartTotal = cart.reduce(
    (a, b) => a + computeItem(b),
    0
  );

  const total =
    cartTotal +
    Number(deliveryFee || 0) -
    Number(discount || 0);

  const change =
    cash
      ? Number(cash) - total
      : 0;

  /* ================= CHECKOUT ================= */
  const checkout = async () => {

    if (!cart.length) return;

    const order = {

      orderNumber:
        `${deviceId}-${Date.now()}`,

      deviceId,

      items: cart,

      orderType,

      deliveryFee:
        Number(deliveryFee || 0),

      discount:
        Number(discount || 0),

      cash:
        Number(cash || 0),

      total,

      status: "pending",

      createdAt: Date.now()

    };

    await addDoc(
      collection(db, "orders"),
      order
    );

    setCart([]);

    setCash("");
    setDiscount("");
    setDeliveryFee("");

  };

  /* ================= STATUS ================= */
  const updateStatus = async (
    id: string,
    status: string
  ) => {

    await updateDoc(
      doc(db, "orders", id),
      { status }
    );

  };

  /* ================= FILTER ================= */
  const filtered = useMemo(() => {

    return products.filter(p =>

      (category === "All Products" ||
        p.category === category)

      &&

      p.name.toLowerCase()
        .includes(search.toLowerCase())

    );

  }, [category, search]);

  const activeOrders =
    orders.filter(
      o => o.status !== "completed"
    );

  const completedOrders =
    orders.filter(
      o => o.status === "completed"
    );

  /* ================= LOGIN SCREEN ================= */
  if (!user) {

    return (

      <div style={{ padding: 40 }}>

        <h1>CDT POS Login</h1>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <br /><br />

        <button onClick={login}>
          Login
        </button>

      </div>

    );

  }

  /* ================= DEVICE ================= */
  if (!deviceId) {

    return (

      <div style={{ padding: 40 }}>

        <h2>Select POS</h2>

        {DEVICE_IDS.map(id => (

          <button
            key={id}
            onClick={() => initDevice(id)}
          >
            {id}
          </button>

        ))}

      </div>

    );

  }

  return (

    <div style={{
      display: "flex",
      height: "100vh"
    }}>

      {/* SIDEBAR */}
      <div style={{
        width: 220,
        padding: 10,
        borderRight: "1px solid #ddd"
      }}>

        <h2>Coffee D' Titos</h2>

        <button onClick={() => setView("cashier")}>
          Cashier
        </button>

        <button onClick={() => setView("kitchen")}>
          Kitchen
        </button>

        <button onClick={() => setView("admin")}>
          Admin
        </button>

        <button onClick={logout}>
          Logout
        </button>

        <hr />

        {categories.map(c => (

          <button
            key={c}
            onClick={() => setCategory(c)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: 5,
              background:
                category === c
                  ? "#ddd"
                  : "#fff"
            }}
          >
            {c}
          </button>

        ))}

      </div>

      {/* CASHIER */}
      {view === "cashier" && (

        <div style={{
          flex: 1,
          display: "flex"
        }}>

          {/* PRODUCTS */}
          <div style={{
            flex: 1,
            padding: 10
          }}>

            <input
              placeholder="Search"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {filtered.map(p => (

              <div
                key={p.id}
                style={{
                  border: "1px solid #ddd",
                  padding: 10,
                  marginBottom: 10
                }}
              >

                <b>{p.name}</b>

                <div>
                  ₱{p.price}
                </div>

                <button
                  onClick={() =>
                    addToCart(p, "Malaki", 0)
                  }
                >
                  Malaki
                </button>

                <button
                  onClick={() =>
                    addToCart(p, "Mas Malaki", 10)
                  }
                >
                  Mas Malaki +10
                </button>

              </div>

            ))}

          </div>

          {/* CART */}
          <div style={{
            width: 320,
            padding: 10,
            borderLeft: "1px solid #ddd"
          }}>

            <h3>Cart</h3>

            {cart.map((i, idx) => (

              <div
                key={idx}
                style={{
                  border: "1px solid #ddd",
                  padding: 10,
                  marginBottom: 10
                }}
              >

                <b>{i.name}</b>

                <div>
                  Size:
                  {i.sizeType}
                </div>

                <div>
                  Qty:
                  {i.qty}

                  <button
                    onClick={() =>
                      updateQty(idx, -1)
                    }
                  >
                    -
                  </button>

                  <button
                    onClick={() =>
                      updateQty(idx, 1)
                    }
                  >
                    +
                  </button>
                </div>

                {i.addons?.length > 0 && (
                  <div>
                    Add-ons:
                    {i.addons.join(", ")}
                  </div>
                )}

                <div>
                  ₱{computeItem(i)}
                </div>

                {i.Coffee && (
  <button
    onClick={() =>
      toggleExtraShot(idx)
    }
  >
    Extra Shot
  </button>
)}

              </div>

            ))}

            <hr />

            <select
              value={orderType}
              onChange={(e) =>
                setOrderType(e.target.value)
              }
            >
              <option value="dine-in">
                Dine-in
              </option>

              <option value="take-out">
                Take-out
              </option>

              <option value="delivery">
                Delivery
              </option>
            </select>

            {orderType === "delivery" && (
              <input
                placeholder="Delivery Fee"
                value={deliveryFee}
                onChange={(e) =>
                  setDeliveryFee(e.target.value)
                }
              />
            )}

            <input
              placeholder="Discount"
              value={discount}
              onChange={(e) =>
                setDiscount(e.target.value)
              }
            />

            <input
              placeholder="Cash"
              value={cash}
              onChange={(e) =>
                setCash(e.target.value)
              }
            />

            <h3>
              Total: ₱{total}
            </h3>

            {cash && (
              <div>
                Change: ₱{change}
              </div>
            )}

            <button onClick={checkout}>
              Checkout
            </button>

          </div>

        </div>

      )}

      {/* KITCHEN */}
      {view === "kitchen" && (

        <div style={{
          flex: 1,
          padding: 20
        }}>

          <h2>Kitchen</h2>

          {activeOrders.map(o => (

            <div
              key={o.id}
              style={{
                border: "1px solid #ddd",
                padding: 12,
                marginBottom: 12
              }}
            >

              <h3>
                {o.orderNumber}
              </h3>

              <div>
                Status:
                {o.status}
              </div>

              {o.items.map((i: any, idx: number) => (

                <div key={idx}>

                  <b>
                    {i.name}
                  </b>

                  {" "}x{i.qty}

                  <div>
                    Size:
                    {i.sizeType}
                  </div>

                  {i.addons?.length > 0 && (
                    <div>
                      Add-ons:
                      {i.addons.join(", ")}
                    </div>
                  )}

                </div>

              ))}

              <br />

              {o.status === "pending" && (
                <button
                  onClick={() =>
                    updateStatus(o.id, "preparing")
                  }
                >
                  Start Preparing
                </button>
              )}

              {o.status === "preparing" && (
                <button
                  onClick={() =>
                    updateStatus(o.id, "completed")
                  }
                >
                  Complete Order
                </button>
              )}

            </div>

          ))}

        </div>

      )}

      {/* ADMIN */}
      {view === "admin" && (

        <div style={{
          flex: 1,
          padding: 20
        }}>

          <h2>Completed Orders</h2>

          {completedOrders.map(o => (

            <div
              key={o.id}
              style={{
                border: "1px solid #ddd",
                padding: 12,
                marginBottom: 12
              }}
            >

              <h3>
                {o.orderNumber}
              </h3>

              <div>
                Type:
                {o.orderType}
              </div>

              {o.items.map((i: any, idx: number) => (

                <div key={idx}>

                  <b>
                    {i.name}
                  </b>

                  {" "}x{i.qty}

                  <div>
                    Size:
                    {i.sizeType}
                  </div>

                  {i.addons?.length > 0 && (
                    <div>
                      Add-ons:
                      {i.addons.join(", ")}
                    </div>
                  )}

                </div>

              ))}

              <hr />

              <div>
                Total:
                ₱{o.total}
              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}
