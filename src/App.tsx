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

/* ================= STYLES ================= */
const fonts = document.createElement("link");
fonts.rel = "stylesheet";
fonts.href = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600&display=swap";
document.head.appendChild(fonts);

const S = {
  /* Layout */
  root: { display:"flex", height:"100vh", background:"#FAF6EF", fontFamily:"'Barlow', sans-serif", overflow:"hidden" },

  /* Sidebar */
  sidebar: { width:190, background:"#3B1F0E", display:"flex", flexDirection:"column", flexShrink:0 },
  sidebarLogo: { padding:"16px 14px 12px", borderBottom:"1px solid #5a3020" },
  brand: { fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:22, color:"#F5ECD7", lineHeight:1.1, letterSpacing:0.5 },
  tagline: { fontSize:9, color:"#C0622A", letterSpacing:"1.5px", textTransform:"uppercase", marginTop:3, fontWeight:600 },
  navSection: { padding:"10px 10px 6px", borderBottom:"1px solid #5a3020" },
  catSection: { flex:1, overflowY:"auto", padding:10 },
  catLabel: { fontSize:9, letterSpacing:"1.5px", color:"#8A6040", textTransform:"uppercase", fontWeight:600, padding:"4px 6px 8px", display:"block" },
  sidebarFooter: { padding:10, borderTop:"1px solid #5a3020" },
  deviceBadge: { display:"flex", alignItems:"center", gap:6, padding:"6px 10px", background:"#5a302050", borderRadius:6, fontSize:11, color:"#C8A98A", fontWeight:600 },

  /* Product area */
  productArea: { flex:1, display:"flex", flexDirection:"column", overflow:"hidden" },
  topbar: { padding:"10px 12px", background:"#FAF6EF", borderBottom:"1px solid #E8DDD0", display:"flex", alignItems:"center", gap:10 },
  searchWrap: { flex:1, display:"flex", alignItems:"center", background:"#fff", border:"1px solid #DDD0C0", borderRadius:8, padding:"0 10px", gap:8 },
  searchInput: { border:"none", background:"transparent", fontFamily:"'Barlow', sans-serif", fontSize:13, color:"#3B1F0E", padding:"8px 0", outline:"none", width:"100%" },
  otWrap: { display:"flex", gap:4 },

  /* Product grid */
  productGrid: { flex:1, overflowY:"auto", padding:10, display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(148px, 1fr))", gap:8, alignContent:"start" },
  prodCard: { background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, padding:10, transition:"border-color 0.15s" },
  prodName: { fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:13, color:"#3B1F0E", lineHeight:1.2, marginBottom:8 },
  prodSizes: { display:"flex", flexDirection:"column", gap:4 },

  /* Cart */
  cartPanel: { width:282, background:"#fff", borderLeft:"1px solid #E8DDD0", display:"flex", flexDirection:"column", flexShrink:0 },
  cartHeader: { padding:"12px 14px 10px", borderBottom:"1px solid #E8DDD0", display:"flex", alignItems:"center", justifyContent:"space-between" },
  cartTitle: { fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:20, color:"#3B1F0E", letterSpacing:0.5 },
  cartCount: { background:"#C0622A", color:"#fff", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:20 },
  cartItems: { flex:1, overflowY:"auto", padding:10 },
  cartItem: { border:"1px solid #E8DDD0", borderRadius:8, padding:"8px 10px", marginBottom:6, background:"#FAF6EF" },
  ciName: { fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:13, color:"#3B1F0E" },
  ciSize: { fontSize:11, color:"#8A6040", marginBottom:6 },
  ciRow: { display:"flex", alignItems:"center", justifyContent:"space-between" },
  qtyCtrl: { display:"flex", alignItems:"center", gap:6 },
  qtyNum: { fontSize:13, fontWeight:700, color:"#3B1F0E", minWidth:16, textAlign:"center" },
  ciPrice: { fontWeight:700, fontSize:13, color:"#C0622A" },
  extraShotTag: { display:"inline-block", marginTop:4, background:"#FFF0E8", border:"1px solid #C0622A40", color:"#C0622A", fontSize:10, fontWeight:600, padding:"2px 6px", borderRadius:4 },
  emptyCart: { flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#C8A98A", gap:8 },
  cartFooter: { padding:"12px 14px", borderTop:"1px solid #E8DDD0" },
  calcRow: { display:"flex", justifyContent:"space-between", fontSize:12, color:"#8A6040", marginBottom:4 },
  calcTotal: { display:"flex", justifyContent:"space-between", fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:22, color:"#3B1F0E", marginTop:8, marginBottom:8 },
  footerInputs: { display:"flex", gap:6, marginBottom:8 },
  changeRow: { display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:10, padding:"6px 8px", background:"#F0F7ED", borderRadius:6, color:"#3B6B28", fontWeight:600 },

  /* Kitchen */
  kitchenArea: { flex:1, overflowY:"auto", padding:16, background:"#FAF6EF" },
  kitchenGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:12 },
  kitchenCard: { background:"#fff", border:"1px solid #E8DDD0", borderRadius:12, padding:14 },
  kitchenOrderNum: { fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:18, color:"#3B1F0E", marginBottom:4 },
  kitchenMeta: { fontSize:11, color:"#8A6040", marginBottom:10 },
  kitchenItem: { fontSize:13, color:"#3B1F0E", padding:"4px 0", borderBottom:"1px solid #F0E8DC" },

  /* Admin */
  adminArea: { flex:1, overflowY:"auto", padding:16, background:"#FAF6EF" },
  adminTitle: { fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:24, color:"#3B1F0E", marginBottom:16 },
  summaryCards: { display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12, marginBottom:20 },
  summaryCard: { background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, padding:"14px 16px" },
  summaryLabel: { fontSize:11, color:"#8A6040", fontWeight:600, letterSpacing:"0.5px", textTransform:"uppercase", marginBottom:4 },
  summaryValue: { fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:28, color:"#3B1F0E" },
  orderTable: { background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, overflow:"hidden" },
  tableHeader: { display:"grid", gridTemplateColumns:"1fr 80px 80px 100px 80px", padding:"8px 14px", background:"#F5ECD7", fontSize:11, fontWeight:700, color:"#6B4226", textTransform:"uppercase", letterSpacing:"0.5px" },
  tableRow: { display:"grid", gridTemplateColumns:"1fr 80px 80px 100px 80px", padding:"10px 14px", borderTop:"1px solid #F0E8DC", fontSize:12, color:"#3B1F0E", alignItems:"center" },

  /* Login */
  loginWrap: { display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#3B1F0E" },
  loginBox: { background:"#FAF6EF", borderRadius:16, padding:36, width:320 },
  loginBrand: { fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:32, color:"#3B1F0E", lineHeight:1, marginBottom:4 },
  loginTagline: { fontSize:11, color:"#C0622A", letterSpacing:"1.5px", textTransform:"uppercase", fontWeight:600, marginBottom:24 },
  loginLabel: { fontSize:12, fontWeight:600, color:"#6B4226", marginBottom:4, display:"block" },
  loginInput: { width:"100%", padding:"10px 12px", border:"1px solid #DDD0C0", borderRadius:8, fontFamily:"'Barlow', sans-serif", fontSize:13, color:"#3B1F0E", background:"#fff", outline:"none", marginBottom:12, boxSizing:"border-box" },

  /* Device select */
  deviceWrap: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", background:"#3B1F0E", gap:12 },
  deviceTitle: { fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:28, color:"#F5ECD7", marginBottom:8 },
};

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
  { id:"hot_americano_12oz", name:"Hot Americano", category:"Hot Drinks", coffee:true, singleSize:true, size:{ label:"12oz", price:69 } },
  { id:"hot_spanish_latte_12oz", name:"Hot Spanish Latte", category:"Hot Drinks", coffee:true, singleSize:true, size:{ label:"12oz", price:79 } },
  { id:"hot_mocha_12oz", name:"Hot Mocha", category:"Hot Drinks", coffee:true, singleSize:true, size:{ label:"12oz", price:79 } },
  { id:"hot_caramel_macchiato_12oz", name:"Hot Caramel Macchiato", category:"Hot Drinks", coffee:true, singleSize:true, size:{ label:"12oz", price:89 } },
  { id:"hot_dirty_matcha_12oz", name:"Hot Dirty Matcha", category:"Hot Drinks", coffee:true, singleSize:true, size:{ label:"12oz", price:89 } },
  { id:"hot_matcha_latte_12oz", name:"Hot Matcha Latte", category:"Hot Drinks", coffee:false, singleSize:true, size:{ label:"12oz", price:79 } },
  { id:"hot_strawberry_dirty_matcha_12oz", name:"Hot Strawberry Dirty Matcha", category:"Hot Drinks", coffee:true, singleSize:true, size:{ label:"12oz", price:99 } },
  { id:"hot_strawberry_mocha_12oz", name:"Hot Strawberry Mocha", category:"Hot Drinks", coffee:true, singleSize:true, size:{ label:"12oz", price:89 } },
  { id:"hot_strawberry_latte_12oz", name:"Hot Strawberry Latte", category:"Hot Drinks", coffee:true, singleSize:true, size:{ label:"12oz", price:89 } },
  { id:"hot_strawberry_matcha_12oz", name:"Hot Strawberry Matcha", category:"Hot Drinks", coffee:false, singleSize:true, size:{ label:"12oz", price:89 } },

  // ICED COFFEE
  { id:"iced_americano", name:"Iced Americano", category:"Iced Coffee", coffee:true, sizes:[{ label:"Malaki", price:89 },{ label:"Mas Malaki", price:99 }] },
  { id:"iced_spanish_latte", name:"Iced Spanish Latte", category:"Iced Coffee", coffee:true, sizes:[{ label:"Malaki", price:89 },{ label:"Mas Malaki", price:99 }] },
  { id:"iced_mocha", name:"Iced Mocha", category:"Iced Coffee", coffee:true, sizes:[{ label:"Malaki", price:89 },{ label:"Mas Malaki", price:99 }] },
  { id:"iced_caramel_macchiato", name:"Iced Caramel Macchiato", category:"Iced Coffee", coffee:true, sizes:[{ label:"Malaki", price:99 },{ label:"Mas Malaki", price:109 }] },
  { id:"iced_strawberry_latte", name:"Iced Strawberry Latte", category:"Iced Coffee", coffee:true, sizes:[{ label:"Malaki", price:99 },{ label:"Mas Malaki", price:109 }] },
  { id:"iced_strawberry_mocha", name:"Iced Strawberry Mocha", category:"Iced Coffee", coffee:true, sizes:[{ label:"Malaki", price:99 },{ label:"Mas Malaki", price:109 }] },

  // MATCHA COLLECTION
  { id:"iced_matcha_latte", name:"Iced Matcha Latte", category:"Matcha Collection", coffee:false, sizes:[{ label:"Malaki", price:89 },{ label:"Mas Malaki", price:99 }] },
  { id:"iced_dirty_matcha", name:"Iced Dirty Matcha", category:"Matcha Collection", coffee:true, sizes:[{ label:"Malaki", price:99 },{ label:"Mas Malaki", price:109 }] },
  { id:"iced_strawberry_dirty_matcha", name:"Iced Strawberry Dirty Matcha", category:"Matcha Collection", coffee:true, sizes:[{ label:"Malaki", price:109 },{ label:"Mas Malaki", price:119 }] },
  { id:"iced_strawberry_matcha", name:"Iced Strawberry Matcha", category:"Matcha Collection", coffee:false, sizes:[{ label:"Malaki", price:99 },{ label:"Mas Malaki", price:109 }] },
  { id:"iced_blueberry_matcha", name:"Iced Blueberry Matcha", category:"Matcha Collection", coffee:false, sizes:[{ label:"Malaki", price:99 },{ label:"Mas Malaki", price:109 }] },

  // OATSIDE SERIES
  { id:"oatside_spanish_latte", name:"Oatside Spanish Latte", category:"Oatside Series", coffee:true, sizes:[{ label:"Malaki", price:99 },{ label:"Mas Malaki", price:109 }] },
  { id:"oatside_matcha_latte", name:"Oatside Matcha Latte", category:"Oatside Series", coffee:false, sizes:[{ label:"Malaki", price:99 },{ label:"Mas Malaki", price:109 }] },
  { id:"oatside_strawberry_matcha", name:"Oatside Strawberry Matcha", category:"Oatside Series", coffee:false, sizes:[{ label:"Malaki", price:109 },{ label:"Mas Malaki", price:119 }] },
  { id:"oatside_strawberry_dirty_matcha", name:"Oatside Strawberry Dirty Matcha", category:"Oatside Series", coffee:true, sizes:[{ label:"Malaki", price:119 },{ label:"Mas Malaki", price:129 }] },
  { id:"oatside_strawberry_latte", name:"Oatside Strawberry Latte", category:"Oatside Series", coffee:true, sizes:[{ label:"Malaki", price:109 },{ label:"Mas Malaki", price:119 }] },
  { id:"oatside_caramel_macchiato", name:"Oatside Caramel Macchiato", category:"Oatside Series", coffee:true, sizes:[{ label:"Malaki", price:109 },{ label:"Mas Malaki", price:119 }] },
  { id:"oatside_dirty_matcha", name:"Oatside Dirty Matcha", category:"Oatside Series", coffee:true, sizes:[{ label:"Malaki", price:109 },{ label:"Mas Malaki", price:119 }] },

  // NON-COFFEE
  { id:"strawberry_milk_drink", name:"Strawberry Milk Drink", category:"Non-Coffee", coffee:false, sizes:[{ label:"Malaki", price:79 },{ label:"Mas Malaki", price:89 }] },
  { id:"blueberry_milk_drink", name:"Blueberry Milk Drink", category:"Non-Coffee", coffee:false, sizes:[{ label:"Malaki", price:79 },{ label:"Mas Malaki", price:89 }] },
  { id:"strawberry_choco", name:"Strawberry Choco", category:"Non-Coffee", coffee:false, sizes:[{ label:"Malaki", price:78 },{ label:"Mas Malaki", price:89 }] },
  { id:"green_apple_soda", name:"Green Apple Soda", category:"Non-Coffee", coffee:false, sizes:[{ label:"Malaki", price:69 },{ label:"Mas Malaki", price:79 }] },
  { id:"blueberry_soda", name:"Blueberry Soda", category:"Non-Coffee", coffee:false, sizes:[{ label:"Malaki", price:69 },{ label:"Mas Malaki", price:79 }] },
];

const DEVICE_IDS = ["POS1", "POS2", "POS3"];

/* ================= BUTTON COMPONENTS ================= */
function NavBtn({ active, onClick, icon, children }) {
  return (
    <button onClick={onClick} style={{
      display:"flex", alignItems:"center", gap:8,
      width:"100%", padding:"8px 10px",
      background: active ? "#C0622A" : "transparent",
      border:"none", color: active ? "#FAF6EF" : "#C8A98A",
      fontFamily:"'Barlow', sans-serif", fontSize:13, fontWeight:500,
      borderRadius:6, cursor:"pointer", textAlign:"left", marginBottom:2
    }}>
      <span style={{ fontSize:16 }}>{icon}</span>
      {children}
    </button>
  );
}

function CatBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      display:"block", width:"100%", padding:"7px 10px",
      background: active ? "#F5ECD730" : "transparent",
      border:"none",
      borderLeft: active ? "3px solid #C0622A" : "3px solid transparent",
      color: active ? "#F5ECD7" : "#C8A98A",
      fontFamily:"'Barlow', sans-serif", fontSize:12, fontWeight:500,
      borderRadius:4, cursor:"pointer", textAlign:"left", marginBottom:2
    }}>
      {children}
    </button>
  );
}

function OtBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding:"6px 11px", borderRadius:6,
      border: active ? "1px solid #C0622A" : "1px solid #DDD0C0",
      background: active ? "#C0622A" : "#fff",
      fontSize:11, fontWeight:600,
      color: active ? "#fff" : "#8A6040",
      cursor:"pointer", fontFamily:"'Barlow', sans-serif"
    }}>
      {children}
    </button>
  );
}

function SizeBtn({ onClick, label, price }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"5px 8px", borderRadius:6,
        border: hover ? "1px solid #C0622A" : "1px solid #E8DDD0",
        background: hover ? "#C0622A" : "#FAF6EF",
        cursor:"pointer", fontFamily:"'Barlow', sans-serif",
        fontSize:11, fontWeight:600,
        color: hover ? "#fff" : "#6B4226",
        transition:"all 0.1s"
      }}
    >
      <span>{label}</span>
      <span>₱{price}</span>
    </button>
  );
}

function QtyBtn({ onClick, children }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width:22, height:22, borderRadius:"50%",
        border: hover ? "1px solid #C0622A" : "1px solid #DDD0C0",
        background: hover ? "#C0622A" : "#fff",
        fontSize:14, cursor:"pointer",
        color: hover ? "#fff" : "#6B4226",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontWeight:700, lineHeight:1, transition:"all 0.1s"
      }}
    >
      {children}
    </button>
  );
}

function PrimaryBtn({ onClick, disabled, children, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%", padding:"12px",
      background: disabled ? "#DDD0C0" : "#C0622A",
      border:"none", borderRadius:8,
      color: disabled ? "#B0956A" : "#fff",
      fontFamily:"'Barlow Condensed', sans-serif",
      fontWeight:800, fontSize:16, letterSpacing:"1px",
      cursor: disabled ? "default" : "pointer",
      ...style
    }}>
      {children}
    </button>
  );
}

/* ================= MAIN APP ================= */
export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [loginError, setLoginError] = useState("");

  const [view, setView] = useState("cashier");
  const [deviceId, setDeviceId] = useState(localStorage.getItem("deviceId") || "");

  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);

  const [category, setCategory] = useState("All Products");
  const [search, setSearch] = useState("");

  const [orderType, setOrderType] = useState("dine-in");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [discount, setDiscount] = useState("");
  const [cash, setCash] = useState("");

  /* ── Firestore ── */
  useEffect(() => {
    return onSnapshot(collection(db, "orders"), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  /* ── Auth ── */
  const login = async () => {
    setLoginError("");
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      setUser(res.user);
    } catch (e) {
      setLoginError("Invalid email or password.");
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const initDevice = (id) => {
    localStorage.setItem("deviceId", id);
    setDeviceId(id);
  };

  /* ── Cart logic ── */
  const makeKey = (item) => {
    const addons = item.addons ? item.addons.join("|") : "";
    return `${item.id}-${item.sizeType}-${addons}`;
  };

  const addToCart = (item, sizeLabel, price) => {
    setCart(prev => {
      const newItem = { ...item, qty: 1, sizeType: sizeLabel, price, addons: [] };
      const idx = prev.findIndex(p => makeKey(p) === makeKey(newItem));
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, newItem];
    });
  };

  const updateQty = (idx, delta) => {
    setCart(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], qty: copy[idx].qty + delta };
      if (copy[idx].qty <= 0) copy.splice(idx, 1);
      return copy;
    });
  };

  const toggleExtraShot = (idx) => {
    setCart(prev => {
      const copy = [...prev];
      const item = { ...copy[idx] };
      item.addons = item.addons?.includes("Extra Shot")
        ? item.addons.filter(a => a !== "Extra Shot")
        : [...(item.addons || []), "Extra Shot"];
      copy[idx] = item;
      return copy;
    });
  };

  const computeItem = (item) => {
    const base = item.price * item.qty;
    const addon = item.addons?.includes("Extra Shot") ? 10 * item.qty : 0;
    return base + addon;
  };

  const subtotal = cart.reduce((a, b) => a + computeItem(b), 0);
  const total = subtotal + Number(deliveryFee || 0) - Number(discount || 0);
  const change = cash ? Number(cash) - total : 0;

  const formatOrderNum = () => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);
    const todayStr = `${mm}${dd}${yy}`;

    const todayOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      const om = String(d.getMonth() + 1).padStart(2, "0");
      const od = String(d.getDate()).padStart(2, "0");
      const oy = String(d.getFullYear()).slice(-2);
      return `${om}${od}${oy}` === todayStr;
    });

    const seq = String(todayOrders.length + 1).padStart(3, "0");
    return `${mm}${dd}${yy}-${deviceId}-${seq}`;
  };

  const checkout = async () => {
    if (!cart.length) return;
    await addDoc(collection(db, "orders"), {
      orderNumber: formatOrderNum(),
      deviceId,
      items: cart,
      orderType,
      deliveryFee: Number(deliveryFee || 0),
      discount: Number(discount || 0),
      cash: Number(cash || 0),
      total,
      status: "pending",
      createdAt: Date.now()
    });
    setCart([]);
    setCash("");
    setDiscount("");
    setDeliveryFee("");
  };

  const markComplete = async (orderId) => {
    await updateDoc(doc(db, "orders", orderId), { status: "completed" });
  };

  const filtered = useMemo(() => {
    return products.filter(p =>
      (category === "All Products" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [category, search]);

  const activeOrders = orders.filter(o => o.status !== "completed")
    .sort((a, b) => a.createdAt - b.createdAt);
  const completedOrders = orders.filter(o => o.status === "completed")
    .sort((a, b) => b.createdAt - a.createdAt);

  const todayTotal = completedOrders
    .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString())
    .reduce((a, b) => a + b.total, 0);

  /* ── LOGIN ── */
  if (!user) {
    return (
      <div style={S.loginWrap}>
        <div style={S.loginBox}>
          <div style={S.loginBrand}>COFFEE<br />D'TITOS'</div>
          <div style={S.loginTagline}>Ang Hilig Mo Sa Kape</div>
          <label style={S.loginLabel}>Email</label>
          <input
            style={S.loginInput}
            type="email"
            placeholder="staff@coffeedtitos.com"
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
          />
          <label style={S.loginLabel}>Password</label>
          <input
            style={S.loginInput}
            type="password"
            placeholder="••••••••"
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
          />
          {loginError && (
            <div style={{ fontSize:12, color:"#C0622A", marginBottom:8 }}>{loginError}</div>
          )}
          <PrimaryBtn onClick={login}>SIGN IN</PrimaryBtn>
        </div>
      </div>
    );
  }

  /* ── DEVICE SELECT ── */
  if (!deviceId) {
    return (
      <div style={S.deviceWrap}>
        <div style={S.deviceTitle}>SELECT DEVICE</div>
        {DEVICE_IDS.map(id => (
          <button key={id} onClick={() => initDevice(id)} style={{
            padding:"12px 32px", background:"#C0622A", border:"none", borderRadius:8,
            color:"#fff", fontFamily:"'Barlow Condensed', sans-serif",
            fontWeight:800, fontSize:18, cursor:"pointer", letterSpacing:1
          }}>
            {id}
          </button>
        ))}
      </div>
    );
  }

  /* ── MAIN UI ── */
  return (
    <div style={S.root}>

      {/* SIDEBAR */}
      <div style={S.sidebar}>
        <div style={S.sidebarLogo}>
          <div style={S.brand}>COFFEE<br />D'TITOS'</div>
          <div style={S.tagline}>Ang Hilig Mo Sa Kape</div>
        </div>

        <div style={S.navSection}>
          <NavBtn active={view === "cashier"} onClick={() => setView("cashier")} icon="🧾">Cashier</NavBtn>
          <NavBtn active={view === "kitchen"} onClick={() => setView("kitchen")} icon="🍵">
            Kitchen {activeOrders.length > 0 && (
              <span style={{ marginLeft:"auto", background:"#C0622A", color:"#fff", borderRadius:10, fontSize:10, fontWeight:700, padding:"1px 6px" }}>
                {activeOrders.length}
              </span>
            )}
          </NavBtn>
          <NavBtn active={view === "admin"} onClick={() => setView("admin")} icon="📊">Admin</NavBtn>
          <NavBtn onClick={logout} icon="🚪">Logout</NavBtn>
        </div>

        {view === "cashier" && (
          <div style={S.catSection}>
            <span style={S.catLabel}>Menu</span>
            {categories.map(c => (
              <CatBtn key={c} active={category === c} onClick={() => setCategory(c)}>
                {c}
              </CatBtn>
            ))}
          </div>
        )}

        <div style={S.sidebarFooter}>
          <div style={S.deviceBadge}>
            <span style={{ fontSize:14, color:"#C0622A" }}>🖥</span>
            {deviceId}
          </div>
        </div>
      </div>

      {/* ── CASHIER VIEW ── */}
      {view === "cashier" && (
        <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

          {/* Product area */}
          <div style={S.productArea}>
            <div style={S.topbar}>
              <div style={S.searchWrap}>
                <span style={{ fontSize:15, color:"#A0856A" }}>🔍</span>
                <input
                  style={S.searchInput}
                  placeholder="Search drinks..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div style={S.otWrap}>
                {["dine-in","pickup","delivery"].map(t => (
                  <OtBtn key={t} active={orderType === t} onClick={() => setOrderType(t)}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </OtBtn>
                ))}
              </div>
            </div>

            <div style={S.productGrid}>
              {filtered.map(p => (
                <div key={p.id} style={S.prodCard}>
                  <div style={S.prodName}>{p.name}</div>
                  <div style={S.prodSizes}>
                    {p.singleSize ? (
                      <SizeBtn
                        label={p.size.label}
                        price={p.size.price}
                        onClick={() => addToCart(p, p.size.label, p.size.price)}
                      />
                    ) : (
                      p.sizes.map(s => (
                        <SizeBtn
                          key={s.label}
                          label={s.label}
                          price={s.price}
                          onClick={() => addToCart(p, s.label, s.price)}
                        />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart */}
          <div style={S.cartPanel}>
            <div style={S.cartHeader}>
              <span style={S.cartTitle}>ORDER</span>
              {cart.length > 0 && (
                <span style={S.cartCount}>{cart.reduce((a,b)=>a+b.qty,0)} items</span>
              )}
            </div>

            {cart.length === 0 ? (
              <div style={S.emptyCart}>
                <span style={{ fontSize:36 }}>☕</span>
                <p style={{ fontSize:12, fontWeight:500 }}>No items yet</p>
              </div>
            ) : (
              <div style={S.cartItems}>
                {cart.map((item, idx) => (
                  <div key={idx} style={S.cartItem}>
                    <div style={S.ciName}>{item.name}</div>
                    <div style={S.ciSize}>{item.sizeType}</div>
                    <div style={S.ciRow}>
                      <div style={S.qtyCtrl}>
                        <QtyBtn onClick={() => updateQty(idx, -1)}>−</QtyBtn>
                        <span style={S.qtyNum}>{item.qty}</span>
                        <QtyBtn onClick={() => updateQty(idx, 1)}>+</QtyBtn>
                      </div>
                      <span style={S.ciPrice}>₱{computeItem(item)}</span>
                    </div>
                    {item.coffee && (
                      <div>
                        {item.addons?.includes("Extra Shot") ? (
                          <span
                            style={{ ...S.extraShotTag, cursor:"pointer" }}
                            onClick={() => toggleExtraShot(idx)}
                            title="Click to remove"
                          >
                            + Extra Shot ₱{10 * item.qty} ✕
                          </span>
                        ) : (
                          <button
                            onClick={() => toggleExtraShot(idx)}
                            style={{
                              fontSize:10, fontWeight:600, color:"#8A6040",
                              background:"none", border:"1px dashed #C8A98A",
                              borderRadius:4, padding:"2px 6px", cursor:"pointer",
                              marginTop:4, fontFamily:"'Barlow', sans-serif"
                            }}
                          >
                            + Extra Shot
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={S.cartFooter}>
              <div style={S.calcRow}><span>Subtotal</span><span>₱{subtotal}</span></div>

              {orderType === "delivery" && (
                <div style={{ marginBottom:6 }}>
                  <input
                    style={{ width:"100%", padding:"6px 8px", border:"1px solid #DDD0C0", borderRadius:6, fontFamily:"'Barlow', sans-serif", fontSize:12, color:"#3B1F0E", background:"#FAF6EF", outline:"none", boxSizing:"border-box" }}
                    placeholder="Delivery fee ₱"
                    value={deliveryFee}
                    onChange={e => setDeliveryFee(e.target.value)}
                  />
                </div>
              )}

              {deliveryFee && (
                <div style={S.calcRow}><span>Delivery</span><span>+₱{deliveryFee}</span></div>
              )}

              <div style={S.calcTotal}><span>TOTAL</span><span>₱{total}</span></div>

              <div style={S.footerInputs}>
                <input
                  style={{ flex:1, padding:"7px 8px", border:"1px solid #DDD0C0", borderRadius:6, fontFamily:"'Barlow', sans-serif", fontSize:12, color:"#3B1F0E", background:"#FAF6EF", outline:"none" }}
                  placeholder="Discount ₱"
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                />
                <input
                  style={{ flex:1, padding:"7px 8px", border:"1px solid #DDD0C0", borderRadius:6, fontFamily:"'Barlow', sans-serif", fontSize:12, color:"#3B1F0E", background:"#FAF6EF", outline:"none" }}
                  placeholder="Cash ₱"
                  value={cash}
                  onChange={e => setCash(e.target.value)}
                />
              </div>

              {cash && Number(cash) >= total && (
                <div style={S.changeRow}>
                  <span>Change</span><span>₱{change}</span>
                </div>
              )}
              {cash && Number(cash) < total && (
                <div style={{ ...S.changeRow, background:"#FDECEA", color:"#C0622A" }}>
                  <span>Short by</span><span>₱{total - Number(cash)}</span>
                </div>
              )}

              <PrimaryBtn onClick={checkout} disabled={!cart.length}>
                CHECKOUT →
              </PrimaryBtn>
            </div>
          </div>
        </div>
      )}

      {/* ── KITCHEN VIEW ── */}
      {view === "kitchen" && (
        <div style={S.kitchenArea}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:24, color:"#3B1F0E" }}>
              KITCHEN — {activeOrders.length} active
            </div>
          </div>
          {activeOrders.length === 0 ? (
            <div style={{ textAlign:"center", color:"#C8A98A", marginTop:60, fontSize:14 }}>
              <div style={{ fontSize:48 }}>✅</div>
              <div style={{ marginTop:8, fontWeight:500 }}>All caught up!</div>
            </div>
          ) : (
            <div style={S.kitchenGrid}>
              {activeOrders.map(o => (
                <div key={o.id} style={S.kitchenCard}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <div style={S.kitchenOrderNum}>{o.orderNumber}</div>
                      <div style={S.kitchenMeta}>
                        {o.orderType.toUpperCase()} · {new Date(o.createdAt).toLocaleTimeString("en-PH", { hour:"2-digit", minute:"2-digit" })} · {o.deviceId}
                      </div>
                    </div>
                    <span style={{
                      background:"#FFF0E8", color:"#C0622A",
                      fontSize:10, fontWeight:700,
                      padding:"3px 8px", borderRadius:10,
                      border:"1px solid #C0622A40"
                    }}>PENDING</span>
                  </div>

                  <div style={{ marginBottom:12 }}>
                    {o.items.map((item, i) => (
                      <div key={i} style={S.kitchenItem}>
                        <span style={{ fontWeight:700 }}>{item.qty}×</span> {item.name}
                        <span style={{ color:"#8A6040" }}> — {item.sizeType}</span>
                        {item.addons?.includes("Extra Shot") && (
                          <span style={{ color:"#C0622A", fontSize:11 }}> + Extra Shot</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => markComplete(o.id)}
                    style={{
                      width:"100%", padding:"9px", background:"#3B1F0E",
                      border:"none", borderRadius:7,
                      color:"#F5ECD7", fontFamily:"'Barlow Condensed', sans-serif",
                      fontWeight:800, fontSize:14, cursor:"pointer", letterSpacing:"0.5px"
                    }}
                  >
                    ✓ MARK COMPLETE
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ADMIN VIEW ── */}
      {view === "admin" && (
        <div style={S.adminArea}>
          <div style={S.adminTitle}>ADMIN — SALES OVERVIEW</div>

          <div style={S.summaryCards}>
            <div style={S.summaryCard}>
              <div style={S.summaryLabel}>Today's Sales</div>
              <div style={S.summaryValue}>₱{todayTotal.toLocaleString()}</div>
            </div>
            <div style={S.summaryCard}>
              <div style={S.summaryLabel}>Orders Today</div>
              <div style={S.summaryValue}>
                {completedOrders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length}
              </div>
            </div>
            <div style={S.summaryCard}>
              <div style={S.summaryLabel}>Active Now</div>
              <div style={{ ...S.summaryValue, color: activeOrders.length > 0 ? "#C0622A" : "#3B1F0E" }}>
                {activeOrders.length}
              </div>
            </div>
          </div>

          <div style={S.orderTable}>
            <div style={S.tableHeader}>
              <span>Order</span>
              <span>Type</span>
              <span>Device</span>
              <span>Time</span>
              <span style={{ textAlign:"right" }}>Total</span>
            </div>
            {completedOrders.map(o => (
              <div key={o.id} style={S.tableRow}>
                <span style={{ fontWeight:700 }}>{o.orderNumber}</span>
                <span style={{ textTransform:"capitalize", color:"#8A6040" }}>{o.orderType}</span>
                <span style={{ color:"#8A6040" }}>{o.deviceId}</span>
                <span style={{ color:"#8A6040" }}>
                  {new Date(o.createdAt).toLocaleTimeString("en-PH", { hour:"2-digit", minute:"2-digit" })}
                </span>
                <span style={{ textAlign:"right", fontWeight:700, color:"#C0622A" }}>₱{o.total}</span>
              </div>
            ))}
            {completedOrders.length === 0 && (
              <div style={{ padding:"24px", textAlign:"center", color:"#C8A98A", fontSize:13 }}>
                No completed orders yet.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
