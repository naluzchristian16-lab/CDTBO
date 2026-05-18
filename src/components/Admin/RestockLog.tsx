import { useState } from "react";
import { useRestock }    from "../../hooks/useRestock";
import { useSuppliers }  from "../../hooks/useSuppliers";
import { useIngredients } from "../../hooks/useIngredients";
import { Supplier } from "../../types";

interface Props {
  restock:     ReturnType<typeof useRestock>;
  suppliers:   ReturnType<typeof useSuppliers>;
  ingredients: ReturnType<typeof useIngredients>;
}

const emptyForm = () => ({
  ingredientId: "",
  supplierId:   "",
  qtyAdded:     0,
  costPerUnit:  0,
  date:         new Date().toISOString().slice(0, 10),
  notes:        "",
});

const emptySupplier = (): Omit<Supplier, "id"> => ({
  name: "", contact: "", notes: "",
});

const inputStyle: React.CSSProperties = {
  padding:"7px 10px", border:"1px solid #DDD0C0", borderRadius:7,
  fontFamily:"'Barlow', sans-serif", fontSize:13, color:"#3B1F0E",
  background:"#FAF6EF", outline:"none", width:"100%", boxSizing:"border-box",
};

export default function RestockLog({ restock, suppliers, ingredients }: Props) {
  const [form, setForm]           = useState(emptyForm());
  const [saving, setSaving]       = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));

  // Supplier panel state
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [supplierForm, setSupplierForm]         = useState(emptySupplier());
  const [editSupplierId, setEditSupplierId]     = useState<string | null>(null);

  const set = (k: keyof ReturnType<typeof emptyForm>, v: string | number) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!form.ingredientId || !form.qtyAdded || !form.costPerUnit) return;
    setSaving(true);
    try {
      await restock.logRestock(form);
      setForm(emptyForm());
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSupplier = async () => {
    if (!supplierForm.name.trim()) return;
    if (editSupplierId) {
      await suppliers.updateSupplier(editSupplierId, supplierForm);
      setEditSupplierId(null);
    } else {
      await suppliers.addSupplier(supplierForm);
    }
    setSupplierForm(emptySupplier());
    setShowSupplierForm(false);
  };

  const totalCostPreview = form.qtyAdded && form.costPerUnit
    ? form.qtyAdded * form.costPerUnit : 0;

  const filtered = restock.entriesForDate(filterDate);
  const dayTotal = restock.totalSpentForDate(filterDate);

  const selectedIngredient = ingredients.ingredients.find(i => i.id === form.ingredientId);

  return (
    <div style={{ padding:16 }}>
      <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:22, color:"#3B1F0E", marginBottom:16 }}>
        RESTOCK LOG
      </div>

      {/* ── Suppliers panel ── */}
      <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, padding:"12px 16px", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: showSupplierForm ? 10 : 0 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#6B4226", textTransform:"uppercase", letterSpacing:"0.5px" }}>
            Suppliers ({suppliers.suppliers.length})
          </div>
          <button onClick={() => { setShowSupplierForm(!showSupplierForm); setEditSupplierId(null); setSupplierForm(emptySupplier()); }} style={{
            padding:"5px 12px", background:"#F5ECD7", border:"1px solid #DDD0C0",
            borderRadius:6, fontSize:11, fontWeight:600, color:"#6B4226", cursor:"pointer",
          }}>
            {showSupplierForm ? "Cancel" : "+ Add Supplier"}
          </button>
        </div>

        {showSupplierForm && (
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 2fr auto", gap:8, marginBottom:8 }}>
            <input style={inputStyle} placeholder="Supplier name" value={supplierForm.name}    onChange={e => setSupplierForm(p => ({ ...p, name: e.target.value }))} />
            <input style={inputStyle} placeholder="Contact"       value={supplierForm.contact} onChange={e => setSupplierForm(p => ({ ...p, contact: e.target.value }))} />
            <input style={inputStyle} placeholder="Notes"         value={supplierForm.notes}   onChange={e => setSupplierForm(p => ({ ...p, notes: e.target.value }))} />
            <button onClick={handleSaveSupplier} style={{
              padding:"7px 16px", background:"#C0622A", border:"none", borderRadius:7,
              color:"#fff", fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:13, cursor:"pointer",
            }}>{editSupplierId ? "UPDATE" : "ADD"}</button>
          </div>
        )}

        {suppliers.suppliers.length > 0 && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop: showSupplierForm ? 0 : 8 }}>
            {suppliers.suppliers.map(s => (
              <div key={s.id} style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 10px", background:"#FAF6EF", border:"1px solid #E8DDD0", borderRadius:16, fontSize:11 }}>
                <span style={{ fontWeight:600, color:"#3B1F0E" }}>{s.name}</span>
                {s.contact && <span style={{ color:"#8A6040" }}>· {s.contact}</span>}
                <button onClick={() => { setEditSupplierId(s.id); setSupplierForm({ name:s.name, contact:s.contact, notes:s.notes }); setShowSupplierForm(true); }} style={{ background:"none", border:"none", color:"#8A6040", cursor:"pointer", fontSize:11, padding:"0 2px" }}>✏</button>
                <button onClick={() => suppliers.deleteSupplier(s.id)} style={{ background:"none", border:"none", color:"#C0622A", cursor:"pointer", fontSize:11, padding:"0 2px" }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Restock entry form ── */}
      <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#6B4226", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.5px" }}>
          Log Purchase
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:8, marginBottom:8 }}>
          {/* Ingredient */}
          <select style={inputStyle} value={form.ingredientId} onChange={e => set("ingredientId", e.target.value)}>
            <option value="">— Select ingredient —</option>
            {ingredients.ingredients.map(i => (
              <option key={i.id} value={i.id}>{i.name} (stock: {i.stock} {i.unit})</option>
            ))}
          </select>

          {/* Qty */}
          <input style={inputStyle} type="number" placeholder={`Qty (${selectedIngredient?.unit ?? "unit"})`}
            value={form.qtyAdded || ""}
            onChange={e => set("qtyAdded", Number(e.target.value))} />

          {/* Cost per unit */}
          <input style={inputStyle} type="number" placeholder="Cost/unit ₱"
            value={form.costPerUnit || ""}
            onChange={e => set("costPerUnit", Number(e.target.value))} />

          {/* Date */}
          <input style={inputStyle} type="date" value={form.date}
            onChange={e => set("date", e.target.value)} />

          {/* Supplier */}
          <select style={inputStyle} value={form.supplierId} onChange={e => set("supplierId", e.target.value)}>
            <option value="">— Supplier (optional) —</option>
            {suppliers.suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <input style={{ ...inputStyle, marginBottom:8 }} placeholder="Notes (optional)"
          value={form.notes} onChange={e => set("notes", e.target.value)} />

        {/* Preview */}
        {totalCostPreview > 0 && (
          <div style={{ fontSize:12, marginBottom:8, padding:"8px 12px", background:"#F5ECD7", borderRadius:7, color:"#3B1F0E", fontWeight:600 }}>
            Total purchase cost: <span style={{ color:"#C0622A" }}>₱{totalCostPreview.toLocaleString("en-PH", { minimumFractionDigits:2 })}</span>
            {selectedIngredient && (
              <span style={{ color:"#8A6040", fontWeight:400, marginLeft:8 }}>
                · New stock: {selectedIngredient.stock + form.qtyAdded} {selectedIngredient.unit}
              </span>
            )}
          </div>
        )}

        <button onClick={handleSave} disabled={saving || !form.ingredientId || !form.qtyAdded || !form.costPerUnit} style={{
          padding:"9px 24px", background: saving ? "#DDD0C0" : "#C0622A",
          border:"none", borderRadius:8, color:"#fff",
          fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800,
          fontSize:15, cursor: saving ? "default" : "pointer",
        }}>
          {saving ? "Saving…" : "LOG PURCHASE"}
        </button>
      </div>

      {/* ── Log table ── */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#6B4226", textTransform:"uppercase" }}>History</div>
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} style={{
          padding:"6px 10px", border:"1px solid #DDD0C0", borderRadius:7,
          fontFamily:"'Barlow', sans-serif", fontSize:12, color:"#3B1F0E",
          background:"#fff", outline:"none",
        }} />
        <div style={{ marginLeft:"auto", fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:18, color:"#C0622A" }}>
          Spent: ₱{dayTotal.toLocaleString("en-PH", { minimumFractionDigits:2 })}
        </div>
      </div>

      <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"100px 1fr 80px 80px 90px 1fr", padding:"8px 14px", background:"#F5ECD7", fontSize:11, fontWeight:700, color:"#6B4226", textTransform:"uppercase", letterSpacing:"0.5px" }}>
          <span>Date</span><span>Ingredient</span><span style={{ textAlign:"right" }}>Qty</span>
          <span style={{ textAlign:"right" }}>₱/unit</span><span style={{ textAlign:"right" }}>Total</span><span>Supplier / Notes</span>
        </div>
        {filtered.length === 0
          ? <div style={{ padding:24, textAlign:"center", color:"#C8A98A", fontSize:13 }}>No restock entries for this date.</div>
          : filtered.map(e => {
              const ing = ingredients.ingredients.find(i => i.id === e.ingredientId);
              const sup = suppliers.suppliers.find(s => s.id === e.supplierId);
              return (
                <div key={e.id} style={{ display:"grid", gridTemplateColumns:"100px 1fr 80px 80px 90px 1fr", padding:"10px 14px", borderTop:"1px solid #F0E8DC", fontSize:12, color:"#3B1F0E", alignItems:"center" }}>
                  <span style={{ color:"#8A6040" }}>{e.date}</span>
                  <span style={{ fontWeight:600 }}>{ing?.name ?? e.ingredientId} <span style={{ color:"#8A6040", fontWeight:400 }}>({ing?.unit})</span></span>
                  <span style={{ textAlign:"right" }}>{e.qtyAdded}</span>
                  <span style={{ textAlign:"right" }}>₱{e.costPerUnit}</span>
                  <span style={{ textAlign:"right", fontWeight:700, color:"#C0622A" }}>₱{e.totalCost.toLocaleString("en-PH", { minimumFractionDigits:2 })}</span>
                  <span style={{ color:"#8A6040" }}>{sup?.name ?? "—"}{e.notes ? ` · ${e.notes}` : ""}</span>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}
