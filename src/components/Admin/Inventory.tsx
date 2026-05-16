import { useState } from "react";
import { useIngredients } from "../../hooks/useIngredients";
import { Ingredient } from "../../types";

interface Props {
  ingredients: ReturnType<typeof useIngredients>;
}

const UNITS = ["ml", "g", "kg", "L", "pcs", "tbsp", "tsp"];

const emptyForm = (): Omit<Ingredient, "id"> => ({
  name: "", unit: "ml", stock: 0, costPerUnit: 0, lowStockThreshold: 0,
});

export default function Inventory({ ingredients: ctx }: Props) {
  const [form, setForm]       = useState(emptyForm());
  const [editId, setEditId]   = useState<string | null>(null);
  const [adjId, setAdjId]     = useState<string | null>(null);
  const [adjDelta, setAdjDelta] = useState<string>("");
  const [saving, setSaving]   = useState(false);

  const set = (k: keyof typeof form, v: string | number) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (editId) {
      await ctx.updateIngredient(editId, form);
      setEditId(null);
    } else {
      await ctx.addIngredient(form);
    }
    setForm(emptyForm());
    setSaving(false);
  };

  const handleEdit = (ing: Ingredient) => {
    setEditId(ing.id);
    setForm({ name: ing.name, unit: ing.unit, stock: ing.stock, costPerUnit: ing.costPerUnit, lowStockThreshold: ing.lowStockThreshold });
  };

  const handleAdjust = async (ing: Ingredient) => {
    const delta = Number(adjDelta);
    if (isNaN(delta) || delta === 0) return;
    await ctx.adjustStock(ing.id, delta, ing.stock);
    setAdjId(null);
    setAdjDelta("");
  };

  const inputStyle = {
    padding:"7px 10px", border:"1px solid #DDD0C0", borderRadius:7,
    fontFamily:"'Barlow', sans-serif", fontSize:13, color:"#3B1F0E",
    background:"#FAF6EF", outline:"none", width:"100%", boxSizing:"border-box" as const,
  };

  return (
    <div style={{ padding:16 }}>
      <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:22, color:"#3B1F0E", marginBottom:16 }}>
        INVENTORY
      </div>

      {/* Low stock alerts */}
      {ctx.lowStockIngredients.length > 0 && (
        <div style={{ background:"#FFF0E8", border:"1px solid #C0622A40", borderRadius:8, padding:"10px 14px", marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#C0622A", marginBottom:6 }}>⚠️ Low Stock Alerts</div>
          {ctx.lowStockIngredients.map(i => (
            <div key={i.id} style={{ fontSize:12, color:"#3B1F0E", marginBottom:2 }}>
              <strong>{i.name}</strong> — {i.stock} {i.unit} remaining (threshold: {i.lowStockThreshold} {i.unit})
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit form */}
      <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#6B4226", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.5px" }}>
          {editId ? "Edit Ingredient" : "Add Ingredient"}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr", gap:8, marginBottom:8 }}>
          <input style={inputStyle} placeholder="Name (e.g. Espresso)" value={form.name} onChange={e => set("name", e.target.value)} />
          <select style={inputStyle} value={form.unit} onChange={e => set("unit", e.target.value)}>
            {UNITS.map(u => <option key={u}>{u}</option>)}
          </select>
          <input style={inputStyle} type="number" placeholder="Stock" value={form.stock || ""} onChange={e => set("stock", Number(e.target.value))} />
          <input style={inputStyle} type="number" placeholder="Cost/unit ₱" value={form.costPerUnit || ""} onChange={e => set("costPerUnit", Number(e.target.value))} />
          <input style={inputStyle} type="number" placeholder="Low stock at" value={form.lowStockThreshold || ""} onChange={e => set("lowStockThreshold", Number(e.target.value))} />
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            style={{
              padding:"8px 20px", background: saving ? "#DDD0C0" : "#C0622A",
              border:"none", borderRadius:7, color:"#fff",
              fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800,
              fontSize:14, cursor: saving ? "default" : "pointer",
            }}
          >
            {saving ? "Saving…" : editId ? "UPDATE" : "ADD"}
          </button>
          {editId && (
            <button onClick={() => { setEditId(null); setForm(emptyForm()); }} style={{
              padding:"8px 20px", background:"transparent", border:"1px solid #DDD0C0",
              borderRadius:7, color:"#8A6040", fontFamily:"'Barlow', sans-serif",
              fontSize:13, cursor:"pointer",
            }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Ingredient table */}
      <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, overflow:"hidden" }}>
        <div style={{
          display:"grid", gridTemplateColumns:"2fr 70px 80px 90px 90px 120px",
          padding:"8px 14px", background:"#F5ECD7",
          fontSize:11, fontWeight:700, color:"#6B4226", textTransform:"uppercase", letterSpacing:"0.5px",
        }}>
          <span>Name</span><span>Unit</span><span style={{ textAlign:"right" }}>Stock</span>
          <span style={{ textAlign:"right" }}>Cost/unit</span>
          <span style={{ textAlign:"right" }}>Low at</span>
          <span style={{ textAlign:"right" }}>Actions</span>
        </div>

        {ctx.ingredients.length === 0 && (
          <div style={{ padding:24, textAlign:"center", color:"#C8A98A", fontSize:13 }}>
            No ingredients yet. Add one above.
          </div>
        )}

        {ctx.ingredients.map(ing => (
          <div key={ing.id}>
            <div style={{
              display:"grid", gridTemplateColumns:"2fr 70px 80px 90px 90px 120px",
              padding:"10px 14px", borderTop:"1px solid #F0E8DC",
              fontSize:12, color:"#3B1F0E", alignItems:"center",
              background: ing.stock <= ing.lowStockThreshold ? "#FFF8F5" : "#fff",
            }}>
              <span style={{ fontWeight:600 }}>
                {ing.stock <= ing.lowStockThreshold && <span style={{ color:"#C0622A", marginRight:4 }}>⚠</span>}
                {ing.name}
              </span>
              <span style={{ color:"#8A6040" }}>{ing.unit}</span>
              <span style={{ textAlign:"right", fontWeight:700 }}>{ing.stock}</span>
              <span style={{ textAlign:"right" }}>₱{ing.costPerUnit}</span>
              <span style={{ textAlign:"right", color:"#8A6040" }}>{ing.lowStockThreshold}</span>
              <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
                <button onClick={() => setAdjId(adjId === ing.id ? null : ing.id)} style={{
                  fontSize:11, padding:"3px 8px", border:"1px solid #DDD0C0",
                  borderRadius:5, background:"#FAF6EF", cursor:"pointer", color:"#6B4226",
                }}>± Stock</button>
                <button onClick={() => handleEdit(ing)} style={{
                  fontSize:11, padding:"3px 8px", border:"1px solid #DDD0C0",
                  borderRadius:5, background:"#FAF6EF", cursor:"pointer", color:"#6B4226",
                }}>Edit</button>
                <button onClick={() => ctx.deleteIngredient(ing.id)} style={{
                  fontSize:11, padding:"3px 8px", border:"1px solid #C0622A40",
                  borderRadius:5, background:"#FFF0E8", cursor:"pointer", color:"#C0622A",
                }}>Del</button>
              </div>
            </div>

            {/* Inline stock adjustment */}
            {adjId === ing.id && (
              <div style={{ padding:"8px 14px 8px 40px", background:"#FAF6EF", borderTop:"1px solid #F0E8DC", display:"flex", gap:8, alignItems:"center" }}>
                <input
                  style={{ ...inputStyle, width:120 }}
                  type="number"
                  placeholder="+/- amount"
                  value={adjDelta}
                  onChange={e => setAdjDelta(e.target.value)}
                />
                <button onClick={() => handleAdjust(ing)} style={{
                  padding:"7px 14px", background:"#3B1F0E", border:"none",
                  borderRadius:7, color:"#F5ECD7",
                  fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800,
                  fontSize:13, cursor:"pointer",
                }}>Apply</button>
                <span style={{ fontSize:11, color:"#8A6040" }}>
                  Use negative to remove stock (e.g. -500)
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
