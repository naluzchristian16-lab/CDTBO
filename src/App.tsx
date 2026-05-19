import { useMemo, useState } from "react";
import { auth } from "./firebase";
// ✅ FIX: Import ErrorBoundary for error handling
import { ErrorBoundary } from "./components/ErrorBoundary";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

import { useOrders }      from "./hooks/useOrders";
import { useIngredients } from "./hooks/useIngredients";
import { useIsMobile }    from "./hooks/useIsMobile";
import { useSyncStatus }  from "./hooks/useSyncStatus";

import { categories, products } from "./data/products";
import { CartItem, OrderType, PaymentMethod } from "./types";
import AdminShell  from "./components/Admin/AdminShell";
import SyncBanner  from "./components/SyncBanner";

const fonts = document.createElement("link");
fonts.rel = "stylesheet";
fonts.href = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600&display=swap";
document.head.appendChild(fonts);

/* ─── Styles ─────────────────────────────────────────────────────────────── */
const S: Record<string, React.CSSProperties> = {
  root:         { display:"flex", height:"100dvh", background:"#FAF6EF", fontFamily:"'Barlow', sans-serif", overflow:"hidden" },
  sidebar:      { width:190, background:"#3B1F0E", display:"flex", flexDirection:"column", flexShrink:0 },
  sidebarLogo:  { padding:"16px 14px 12px", borderBottom:"1px solid #5a3020" },
  brand:        { fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:22, color:"#F5ECD7", lineHeight:1.1, letterSpacing:0.5 },
  tagline:      { fontSize:9, color:"#C0622A", letterSpacing:"1.5px", textTransform:"uppercase", marginTop:3, fontWeight:600 },
  navSection:   { padding:"10px 10px 6px", borderBottom:"1px solid #5a3020" },
  catSection:   { flex:1, overflowY:"auto", padding:10 },
  catLabel:     { fontSize:9, letterSpacing:"1.5px", color:"#8A6040", textTransform:"uppercase", fontWeight:600, padding:"4px 6px 8px", display:"block" },
  sidebarFooter:{ padding:10, borderTop:"1px solid #5a3020" },
  deviceBadge:  { display:"flex", alignItems:"center", gap:6, padding:"6px 10px", background:"#5a302050", borderRadius:6, fontSize:11, color:"#C8A98A", fontWeight:600 },
  productArea:  { flex:1, display:"flex", flexDirection:"column", overflow:"hidden" },
  topbar:       { padding:"10px 12px", background:"#FAF6EF", borderBottom:"1px solid #E8DDD0", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" },
  searchWrap:   { flex:1, display:"flex", alignItems:"center", background:"#fff", border:"1px solid #DDD0C0", borderRadius:8, padding:"0 10px", gap:8, minWidth:120 },
  searchInput:  { border:"none", background:"transparent", fontFamily:"'Barlow', sans-serif", fontSize:13, color:"#3B1F0E", padding:"8px 0", outline:"none", width:"100%" },
  otWrap:       { display:"flex", gap:4, flexWrap:"wrap" },
  cartPanel:    { width:282, background:"#fff", borderLeft:"1px solid #E8DDD0", display:"flex", flexDirection:"column", flexShrink:0 },
  cartHeader:   { padding:"12px 14px 10px", borderBottom:"1px solid #E8DDD0", display:"flex", alignItems:"center", justifyContent:"space-between" },
  cartTitle:    { fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:20, color:"#3B1F0E", letterSpacing:0.5 },
  cartCount:    { background:"#C0622A", color:"#fff", fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:20 },
  cartItems:    { flex:1, overflowY:"auto", padding:10 },
  cartItem:     { border:"1px solid #E8DDD0", borderRadius:8, padding:"8px 10px", marginBottom:6, background:"#FAF6EF" },
  ciName:       { fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:13, color:"#3B1F0E" },
  ciSize:       { fontSize:11, color:"#8A6040", marginBottom:6 },
  ciRow:        { display:"flex", alignItems:"center", justifyContent:"space-between" },
  qtyCtrl:      { display:"flex", alignItems:"center", gap:6 },
  qtyNum:       { fontSize:13, fontWeight:700, color:"#3B1F0E", minWidth:16, textAlign:"center" },
  ciPrice:      { fontWeight:700, fontSize:13, color:"#C0622A" },
  emptyCart:    { flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#C8A98A", gap:8 },
  cartFooter:   { padding:"12px 14px", borderTop:"1px solid #E8DDD0" },
  calcRow:      { display:"flex", justifyContent:"space-between", fontSize:12, color:"#8A6040", marginBottom:4 },
  calcTotal:    { display:"flex", justifyContent:"space-between", fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:22, color:"#3B1F0E", marginTop:8, marginBottom:8 },
  footerInputs: { display:"flex", gap:6, marginBottom:8 },
  changeRow:    { display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:10, padding:"6px 8px", background:"#F0F7ED", borderRadius:6, color:"#3B6B28", fontWeight:600 },
  kitchenArea:  { flex:1, overflowY:"auto", padding:16, background:"#FAF6EF" },
  kitchenGrid:  { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))", gap:12 },
  kitchenCard:  { background:"#fff", border:"1px solid #E8DDD0", borderRadius:12, padding:14 },
  kitchenItem:  { fontSize:13, color:"#3B1F0E", padding:"4px 0", borderBottom:"1px solid #F0E8DC" },
  loginWrap:    { display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#3B1F0E" },
  loginBox:     { background:"#FAF6EF", borderRadius:16, padding:36, width:320 },
  loginLabel:   { fontSize:12, fontWeight:600, color:"#6B4226", marginBottom:4, display:"block" },
  loginInput:   { width:"100%", padding:"10px 12px", border:"1px solid #DDD0C0", borderRadius:8, fontFamily:"'Barlow', sans-serif", fontSize:13, color:"#3B1F0E", background:"#fff", outline:"none", marginBottom:12, boxSizing:"border-box" },
  deviceWrap:   { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", background:"#3B1F0E", gap:12 },
};

const DEVICE_IDS = ["POS1", "POS2", "POS3"];

/* ─── Reusable buttons ───────────────────────────────────────────────────── */
function NavBtn({ active, onClick, icon, children }: { active?: boolean; onClick: () => void; icon: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      display:"flex", alignItems:"center", gap:8, width:"100%", padding:"8px 10px",
      background: active ? "#C0622A" : "transparent", border:"none",
      color: active ? "#FAF6EF" : "#C8A98A", fontFamily:"'Barlow', sans-serif",
      fontSize:13, fontWeight:500, borderRadius:6, cursor:"pointer", textAlign:"left", marginBottom:2,
    }}>
      <span style={{ fontSize:16 }}>{icon}</span>{children}
    </button>
  );
}

function CatBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      display:"block", width:"100%", padding:"7px 10px",
      background: active ? "#F5ECD730" : "transparent", border:"none",
      borderLeft: active ? "3px solid #C0622A" : "3px solid transparent",
      color: active ? "#F5ECD7" : "#C8A98A",
      fontFamily:"'Barlow', sans-serif", fontSize:12, fontWeight:500,
      borderRadius:4, cursor:"pointer", textAlign:"left", marginBottom:2,
    }}>{children}</button>
  );
}

function OtBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding:"6px 11px", borderRadius:6,
      border: active ? "1px solid #C0622A" : "1px solid #DDD0C0",
      background: active ? "#C0622A" : "#fff", fontSize:11, fontWeight:600,
      color: active ? "#fff" : "#8A6040", cursor:"pointer", fontFamily:"'Barlow', sans-serif",
    }}>{children}</button>
  );
}

function SizeBtn({ onClick, label, price }: { onClick: () => void; label: string; price: number }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      display:"flex", justifyContent:"space-between", alignItems:"center",
      padding:"5px 8px", borderRadius:6,
      border: hover ? "1px solid #C0622A" : "1px solid #E8DDD0",
      background: hover ? "#C0622A" : "#FAF6EF",
      cursor:"pointer", fontFamily:"'Barlow', sans-serif", fontSize:11, fontWeight:600,
      color: hover ? "#fff" : "#6B4226", transition:"all 0.1s",
    }}>
      <span>{label}</span><span>₱{price}</span>
    </button>
  );
}

function QtyBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      width:22, height:22, borderRadius:"50%",
      border: hover ? "1px solid #C0622A" : "1px solid #DDD0C0",
      background: hover ? "#C0622A" : "#fff", fontSize:14, cursor:"pointer",
      color: hover ? "#fff" : "#6B4226", display:"flex", alignItems:"center",
      justifyContent:"center", fontWeight:700, lineHeight:1, transition:"all 0.1s",
    }}>{children}</button>
  );
}

function PrimaryBtn({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:"100%", padding:"12px",
      background: disabled ? "#DDD0C0" : "#C0622A", border:"none", borderRadius:8,
      color: disabled ? "#B0956A" : "#fff",
      fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:16, letterSpacing:"1px",
      cursor: disabled ? "default" : "pointer",
    }}>{children}</button>
  );
}

/* ─── Mobile bottom tab bar ──────────────────────────────────────────────── */
function BottomTabBar({ view, setView, activeCount }: { view: string; setView: (v: string) => void; activeCount: number }) {
  const tabs = [
    { id:"cashier", icon:"🧾", label:"Cashier" },
    { id:"kitchen", icon:"🍵", label:"Kitchen", badge: activeCount },
    { id:"admin",   icon:"📊", label:"Admin" },
  ];
  return (
    <div style={{
      position:"fixed", bottom:0, left:0, right:0,
      background:"#3B1F0E", display:"flex", borderTop:"1px solid #5a3020",
      zIndex:100, paddingBottom:"env(safe-area-inset-bottom)",
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setView(t.id)} style={{
          flex:1, padding:"10px 0", background:"transparent", border:"none",
          color: view === t.id ? "#C0622A" : "#C8A98A", cursor:"pointer",
          fontFamily:"'Barlow', sans-serif", fontSize:10, fontWeight:600,
          display:"flex", flexDirection:"column", alignItems:"center", gap:2, position:"relative",
        }}>
          <span style={{ fontSize:20 }}>{t.icon}</span>
          {t.label}
          {t.badge ? (
            <span style={{ position:"absolute", top:6, right:"calc(50% - 18px)", background:"#C0622A", color:"#fff", borderRadius:10, fontSize:9, fontWeight:700, padding:"1px 5px" }}>
              {t.badge}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/* ─── Mobile cart drawer ─────────────────────────────────────────────────── */
function CartDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      {open && <div onClick={onClose} style={{ position:"fixed", inset:0, background:"#00000060", zIndex:200 }} />}
      <div style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:201,
        background:"#fff", borderRadius:"16px 16px 0 0",
        boxShadow:"0 -4px 24px #00000020",
        transform: open ? "translateY(0)" : "translateY(100%)",
        transition:"transform 0.3s ease",
        maxHeight:"85vh", display:"flex", flexDirection:"column",
        paddingBottom:"env(safe-area-inset-bottom)",
      }}>
        <div style={{ padding:"10px 16px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:20, color:"#3B1F0E" }}>ORDER</div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#8A6040" }}>✕</button>
        </div>
        <div style={{ flex:1, overflowY:"auto" }}>{children}</div>
      </div>
    </>
  );
}

/* ─── Payment method selector ────────────────────────────────────────────── */
const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id:"cash",  label:"Cash",  icon:"💵" },
  { id:"gcash", label:"GCash", icon:"📱" },
  { id:"card",  label:"Card",  icon:"💳" },
];

function PaymentSelector({ value, onChange }: { value: PaymentMethod; onChange: (m: PaymentMethod) => void }) {
  return (
    <div style={{ display:"flex", gap:4, marginBottom:8 }}>
      {PAYMENT_METHODS.map(m => (
        <button key={m.id} onClick={() => onChange(m.id)} style={{
          flex:1, padding:"6px 4px", borderRadius:6, border:"none", cursor:"pointer",
          background: value === m.id ? "#3B1F0E" : "#F5ECD7",
          color:      value === m.id ? "#F5ECD7" : "#6B4226",
          fontFamily:"'Barlow', sans-serif", fontSize:11, fontWeight:700,
          display:"flex", flexDirection:"column", alignItems:"center", gap:1,
          transition:"all 0.15s",
        }}>
          <span style={{ fontSize:14 }}>{m.icon}</span>
          {m.label}
        </button>
      ))}
    </div>
  );
}

/* ─── Main App ───────────────────────────────────────────────────────────── */
function AppContent() {
  const [user, authLoading] = useAuthState(auth);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [view, setView]         = useState("cashier");
  const [deviceId, setDeviceId] = useState(localStorage.getItem("deviceId") || "");

  const [cart, setCart]                   = useState<CartItem[]>([]);
  const [category, setCategory]           = useState("All Products");
  const [search, setSearch]               = useState("");
  const [orderType, setOrderType]         = useState<OrderType>("dine-in");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [deliveryFee, setDeliveryFee]     = useState("");
  const [discount, setDiscount]           = useState("");
  const [cash, setCash]                   = useState("");
  const [cartOpen, setCartOpen]           = useState(false);

  const isMobile       = useIsMobile();
  const ordersCtx      = useOrders();
  const ingredientsCtx = useIngredients();

  // ── Sync engine — mount once at root ─────────────────────────────────────
  const sync = useSyncStatus();

  /* ── Auth ── */
  const login = async () => {
    setLoginError("");
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch { setLoginError("Invalid email or password."); }
  };
  const logout = () => signOut(auth);

  const initDevice = (id: string) => {
    localStorage.setItem("deviceId", id);
    setDeviceId(id);
  };

  /* ── Cart logic ── */
  const makeKey = (item: CartItem) =>
    `${item.id}-${item.sizeType}-${(item.addons ?? []).join("|")}`;

  const addToCart = (item: any, sizeLabel: string, price: number) => {
    setCart(prev => {
      const newItem: CartItem = { ...item, qty:1, sizeType:sizeLabel, price, addons:[] };
      const idx = prev.findIndex(p => makeKey(p) === makeKey(newItem));
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [...prev, newItem];
    });
  };

  const updateQty = (idx: number, delta: number) => {
    setCart(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], qty: copy[idx].qty + delta };
      if (copy[idx].qty <= 0) copy.splice(idx, 1);
      return copy;
    });
  };

  const toggleExtraShot = (idx: number) => {
    setCart(prev => {
      const copy = [...prev];
      const item = { ...copy[idx] };
      item.addons = item.addons?.includes("Extra Shot")
        ? item.addons.filter(a => a !== "Extra Shot")
        : [...(item.addons ?? []), "Extra Shot"];
      copy[idx] = item;
      return copy;
    });
  };

  const computeItem = (item: CartItem) =>
    item.price * item.qty + (item.addons?.includes("Extra Shot") ? 10 * item.qty : 0);

  const subtotal = cart.reduce((a, b) => a + computeItem(b), 0);
  const total    = subtotal + Number(deliveryFee || 0) - Number(discount || 0);
  const change   = cash ? Number(cash) - total : 0;

  const formatOrderNum = () => {
    const now = new Date();
    const mm  = String(now.getMonth() + 1).padStart(2, "0");
    const dd  = String(now.getDate()).padStart(2, "0");
    const yy  = String(now.getFullYear()).slice(-2);
    const todayStr = `${mm}${dd}${yy}`;
    const todayOrders = ordersCtx.orders.filter(o => {
      const d = new Date(o.createdAt);
      return `${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}${String(d.getFullYear()).slice(-2)}` === todayStr;
    });
    return `${mm}${dd}${yy}-${deviceId}-${String(todayOrders.length + 1).padStart(3, "0")}`;
  };

  const checkout = async () => {
    if (!cart.length) return;
    await ordersCtx.placeOrder({
      orderNumber:   formatOrderNum(),
      deviceId,
      items:         cart,
      orderType,
      paymentMethod,
      deliveryFee:   Number(deliveryFee || 0),
      discount:      Number(discount || 0),
      cash:          paymentMethod === "cash" ? Number(cash || 0) : total,
      total,
    });
    await ingredientsCtx.deductStockForOrder(cart);
    setCart([]);
    setCash("");
    setDiscount("");
    setDeliveryFee("");
    setCartOpen(false);
  };

  const filtered = useMemo(() =>
    products.filter(p =>
      (category === "All Products" || p.category === category) &&
      p.name.toLowerCase().includes(search.toLowerCase())
    ), [category, search]
  );

  /* ── Guards ── */
  if (authLoading) return (
    <div style={S.loginWrap}>
      <div style={{ color:"#F5ECD7", fontFamily:"'Barlow Condensed', sans-serif", fontSize:20 }}>Loading…</div>
    </div>
  );

  if (!user) return (
    <div style={S.loginWrap}>
      <div style={S.loginBox}>
        <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:32, color:"#3B1F0E", lineHeight:1, marginBottom:4 }}>COFFEE<br />D'TITOS'</div>
        <div style={{ fontSize:11, color:"#C0622A", letterSpacing:"1.5px", textTransform:"uppercase", fontWeight:600, marginBottom:24 }}>Ang Hilig Mo Sa Kape</div>
        <label style={S.loginLabel}>Email</label>
        <input style={S.loginInput} type="email" placeholder="staff@coffeedtitos.com" onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
        <label style={S.loginLabel}>Password</label>
        <input style={S.loginInput} type="password" placeholder="••••••••" onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} />
        {loginError && <div style={{ fontSize:12, color:"#C0622A", marginBottom:8 }}>{loginError}</div>}
        <PrimaryBtn onClick={login}>SIGN IN</PrimaryBtn>
      </div>
    </div>
  );

  if (!deviceId) return (
    <div style={S.deviceWrap}>
      <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, fontSize:28, color:"#F5ECD7", marginBottom:8 }}>SELECT DEVICE</div>
      {DEVICE_IDS.map(id => (
        <button key={id} onClick={() => initDevice(id)} style={{
          padding:"12px 32px", background:"#C0622A", border:"none", borderRadius:8,
          color:"#fff", fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:18, cursor:"pointer", letterSpacing:1,
        }}>{id}</button>
      ))}
    </div>
  );

  /* ── Cart content (shared between desktop sidebar + mobile drawer) ─────── */
  const CartContent = () => (
    <>
      <div style={S.cartItems}>
        {cart.length === 0 ? (
          <div style={S.emptyCart}>
            <span style={{ fontSize:36 }}>☕</span>
            <p style={{ fontSize:12, fontWeight:500 }}>No items yet</p>
          </div>
        ) : (
          cart.map((item, idx) => (
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
              {/* ✅ FIX: Use item.coffee flag instead of hardcoded IDs */}
              {item.coffee && (
                <button onClick={() => toggleExtraShot(idx)} style={{
                  marginTop:6, width:"100%", padding:"4px",
                  background: item.addons?.includes("Extra Shot") ? "#C0622A" : "transparent",
                  border:"1px solid #C0622A", borderRadius:4, fontSize:10,
                  color: item.addons?.includes("Extra Shot") ? "#fff" : "#C0622A",
                  fontWeight:600, cursor:"pointer",
                }}>⭐ Extra Shot +₱10</button>
              )}
            </div>
          ))
        )}
      </div>

      <div style={S.cartFooter}>
        <div style={S.calcRow}>
          <span>Subtotal:</span>
          <span>₱{subtotal}</span>
        </div>
        <div style={S.calcRow}>
          <span>Delivery:</span>
          <input type="number" placeholder="0" value={deliveryFee} onChange={e => setDeliveryFee(e.target.value)} style={{ width:80, padding:"4px", border:"1px solid #DDD0C0", borderRadius:4 }} />
        </div>
        <div style={S.calcRow}>
          <span>Discount:</span>
          <input type="number" placeholder="0" value={discount} onChange={e => setDiscount(e.target.value)} style={{ width:80, padding:"4px", border:"1px solid #DDD0C0", borderRadius:4 }} />
        </div>
        <div style={S.calcTotal}>
          <span>TOTAL</span>
          <span>₱{total}</span>
        </div>

        {paymentMethod === "cash" && (
          <>
            <div style={S.footerInputs}>
              <div style={{ flex:1 }}>
                <label style={S.loginLabel}>Cash</label>
                <input type="number" placeholder="0" value={cash} onChange={e => setCash(e.target.value)} style={S.loginInput} />
              </div>
            </div>
            {change > 0 && <div style={S.changeRow}><span>Change</span><span>₱{change}</span></div>}
          </>
        )}

        <PaymentSelector value={paymentMethod} onChange={setPaymentMethod} />

        <div style={{ display:"flex", gap:6 }}>
          <PrimaryBtn onClick={() => setCart([])} disabled={!cart.length}>CLEAR</PrimaryBtn>
          <PrimaryBtn onClick={checkout} disabled={!cart.length}>CHECKOUT</PrimaryBtn>
        </div>
      </div>
    </>
  );

  return (
    <div style={S.root}>
      {/* Sidebar — hidden on mobile */}
      {!isMobile && (
        <div style={S.sidebar}>
          <div style={S.sidebarLogo}>
            <div style={S.brand}>CD'T</div>
            <div style={S.tagline}>POS</div>
          </div>

          <div style={S.navSection}>
            <NavBtn active={view === "cashier"} onClick={() => setView("cashier")} icon="🧾">Cashier</NavBtn>
            <NavBtn active={view === "kitchen"} onClick={() => setView("kitchen")} icon="🍵">Kitchen</NavBtn>
            <NavBtn active={view === "admin"} onClick={() => setView("admin")} icon="📊">Admin</NavBtn>
          </div>

          <div style={S.catSection}>
            <span style={S.catLabel}>Categories</span>
            {categories.map(c => (
              <CatBtn key={c} active={category === c} onClick={() => setCategory(c)}>{c}</CatBtn>
            ))}
          </div>

          <div style={S.sidebarFooter}>
            <div style={S.deviceBadge}>📍 {deviceId}</div>
            <button onClick={logout} style={{ marginTop:8, width:"100%", padding:"6px", background:"transparent", border:"1px solid #C0622A", borderRadius:6, color:"#C0622A", fontFamily:"'Barlow', sans-serif", fontSize:11, fontWeight:600, cursor:"pointer" }}>LOGOUT</button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={S.productArea}>
        {/* Sync banner — ✅ FIX: pass sync prop */}
        <SyncBanner sync={sync} />

        {/* Cashier view — ✅ FIX: flexDirection row so cart stays on the side */}
        {view === "cashier" && (
          <div style={{ ...S.productArea, flexDirection:"row" }}>
            {/* Left: product grid */}
            <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
              {isMobile && (
                <div style={{ padding:"10px", background:"#FAF6EF", borderBottom:"1px solid #E8DDD0", display:"flex", gap:6, overflowX:"auto" }}>
                  {categories.map(c => (
                    <button key={c} onClick={() => setCategory(c)} style={{
                      padding:"5px 12px", borderRadius:16, whiteSpace:"nowrap",
                      background: category === c ? "#C0622A" : "transparent",
                      border: category === c ? "none" : "1px solid #5a3020",
                      color: category === c ? "#fff" : "#C8A98A",
                      fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"'Barlow', sans-serif",
                    }}>{c}</button>
                  ))}
                </div>
              )}

              <div style={S.topbar}>
                <div style={S.searchWrap}>
                  <span style={{ fontSize:15, color:"#A0856A" }}>🔍</span>
                  <input style={S.searchInput} placeholder="Search drinks…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={S.otWrap}>
                  {(["dine-in","pickup","delivery"] as OrderType[]).map(t => (
                    <OtBtn key={t} active={orderType === t} onClick={() => setOrderType(t)}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </OtBtn>
                  ))}
                </div>
              </div>

              <div style={{
                flex:1, overflowY:"auto", padding:10,
                display:"grid", gap:8, alignContent:"start",
                gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fill, minmax(148px, 1fr))",
              }}>
                {filtered.map(p => (
                  <div key={p.id} style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, padding:10 }}>
                    <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:700, fontSize:13, color:"#3B1F0E", lineHeight:1.2, marginBottom:8 }}>{p.name}</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                      {p.singleSize ? (
                        <SizeBtn label={p.size!.label} price={p.size!.price} onClick={() => { addToCart(p, p.size!.label, p.size!.price); if (isMobile) setCartOpen(true); }} />
                      ) : (
                        p.sizes!.map(s => (
                          <SizeBtn key={s.label} label={s.label} price={s.price} onClick={() => { addToCart(p, s.label, s.price); if (isMobile) setCartOpen(true); }} />
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: desktop cart panel */}
            {!isMobile && (
              <div style={S.cartPanel}>
                <div style={S.cartHeader}>
                  <span style={S.cartTitle}>ORDER</span>
                  {cart.length > 0 && <span style={S.cartCount}>{cart.reduce((a,b)=>a+b.qty,0)} items</span>}
                </div>
                <CartContent />
              </div>
            )}
          </div>
        )}

        {/* Kitchen view */}
        {view === "kitchen" && (
          <div style={S.kitchenArea}>
            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:24, color:"#3B1F0E", marginBottom:16 }}>
              KITCHEN — {ordersCtx.activeOrders.length} active
            </div>
            {ordersCtx.activeOrders.length === 0 ? (
              <div style={{ textAlign:"center", color:"#C8A98A", marginTop:60, fontSize:14 }}>
                <div style={{ fontSize:48 }}>✅</div>
                <div style={{ marginTop:8, fontWeight:500 }}>All caught up!</div>
              </div>
            ) : (
              <div style={S.kitchenGrid}>
                {ordersCtx.activeOrders.map(o => (
                  <div key={o.id} style={S.kitchenCard}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                      <div>
                        <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:18, color:"#3B1F0E" }}>{o.orderNumber}</div>
                        <div style={{ fontSize:11, color:"#8A6040", marginBottom:10 }}>
                          {o.orderType.toUpperCase()} · {new Date(o.createdAt).toLocaleTimeString("en-PH", { hour:"2-digit", minute:"2-digit" })} · {o.deviceId}
                        </div>
                      </div>
                      <span style={{ background:"#FFF0E8", color:"#C0622A", fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:10, border:"1px solid #C0622A40" }}>PENDING</span>
                    </div>
                    <div style={{ marginBottom:12 }}>
                      {o.items.map((item, i) => (
                        <div key={i} style={S.kitchenItem}>
                          <span style={{ fontWeight:700 }}>{item.qty}×</span> {item.name}
                          <span style={{ color:"#8A6040" }}> — {item.sizeType}</span>
                          {item.addons?.includes("Extra Shot") && <span style={{ color:"#C0622A", fontSize:11 }}> + Extra Shot</span>}
                        </div>
                      ))}
                    </div>
                    <button onClick={() => ordersCtx.markComplete(o.id)} style={{
                      width:"100%", padding:"9px", background:"#3B1F0E", border:"none", borderRadius:7,
                      color:"#F5ECD7", fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:14, cursor:"pointer",
                    }}>✓ MARK COMPLETE</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Admin view */}
        {view === "admin" && <AdminShell />}

      </div>{/* end main content */}

      {/* Mobile bottom nav */}
      {isMobile && <BottomTabBar view={view} setView={setView} activeCount={ordersCtx.activeOrders.length} />}

      {/* Mobile floating cart button */}
      {isMobile && view === "cashier" && cart.length > 0 && !cartOpen && (
        <button onClick={() => setCartOpen(true)} style={{
          position:"fixed", bottom:70, right:16, zIndex:150,
          background:"#C0622A", border:"none", borderRadius:28,
          padding:"12px 20px", color:"#fff",
          fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:15,
          boxShadow:"0 4px 16px #C0622A60", cursor:"pointer",
          display:"flex", alignItems:"center", gap:8,
        }}>
          🛒 {cart.reduce((a,b)=>a+b.qty,0)} · ₱{total}
        </button>
      )}

      {/* Mobile cart drawer */}
      {isMobile && (
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)}>
          <CartContent />
        </CartDrawer>
      )}

    </div>
  );
}

// ✅ Wrap entire app in ErrorBoundary to catch errors gracefully
export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
