import { useState } from "react";
import { useIngredients } from "../../hooks/useIngredients";
import { Ingredient } from "../../types";

interface Props {
  ingredients: ReturnType<typeof useIngredients>;
}

const UNITS = ["ml", "g", "kg", "L", "pcs", "tbsp", "tsp"];

// ── Types ────────────────────────────────────────────────────────────────────

interface PurchaseForm {
  name:              string;
  packageLabel:      string; // e.g. "Carton Box", "Pack", "Jar"
  packageSize:       string; // numeric string, e.g. "1", "180", "2.5"
  packageUnit:       string; // e.g. "L", "g", "kg"
  qtyPurchased:      string; // how many packages
  totalCost:         string; // total price paid
  lowStockThreshold: string;
}

const emptyPurchaseForm = (): PurchaseForm => ({
  name: "", packageLabel: "", packageSize: "", packageUnit: "g",
  qtyPurchased: "", totalCost: "", lowStockThreshold: "",
});

// ── Derived calculations ─────────────────────────────────────────────────────

function calcDerived(f: PurchaseForm) {
  const size  = parseFloat(f.packageSize);
  const qty   = parseFloat(f.qtyPurchased);
  const total = parseFloat(f.totalCost);

  const valid    = size > 0 && qty > 0 && total > 0;
  const totalStock   = valid ? size * qty : null;          // in package unit
  const costPerUnit  = valid ? total / (size * qty) : null; // ₱ per package unit
  return { totalStock, costPerUnit, valid };
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Inventory({ ingredients: ctx }: Props) {
  const [form, setForm]       = useState<PurchaseForm>(emptyPurchaseForm());
  const [editId, setEditId]   = useState<string | null>(null);
  const [adjId, setAdjId]     = useState<string | null>(null);
  const [adjDelta, setAdjDelta] = useState<string>("");
  const [saving, setSaving]   = useState(false);

  const set = (k: keyof PurchaseForm, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const { totalStock, costPerUnit, valid } = calcDerived(form);

  // ── Save ──────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.name.trim() || !valid) return;
    setSaving(true);

    const payload: Omit<Ingredient, "id"> = {
      name:              form.name.trim(),
      unit:              form.packageUnit,
      stock:             totalStock!,
      costPerUnit:       Math.round(costPerUnit! * 1000) / 1000,
      lowStockThreshold: parseFloat(form.lowStockThreshold) || 0,
    };

    if (editId) {
      await ctx.updateIngredient(editId, payload);
      setEditId(null);
    } else {
      await ctx.addIngredient(payload);
    }
    setForm(emptyPurchaseForm());
    setSaving(false);
  };

  // ── Edit — pre-fill form from existing ingredient ─────────────────────────
  // We reverse-engineer packageSize=1 and qtyPurchased=1 as placeholders
  // since we don't store the original purchase breakdown.

  const handleEdit = (ing: Ingredient) => {
    setEditId(ing.id);
    setForm({
      name:              ing.name,
      packageLabel:      "",
      packageSize:       "1",
      packageUnit:       ing.unit,
      qtyPurchased:      String(ing.stock),
      totalCost:         String(Math.round(ing.costPerUnit * ing.stock * 100) / 100),
      lowStockThreshold: String(ing.lowStockThreshold),
    });
  };

  // ── Stock adjustment ──────────────────────────────────────────────────────

  const handleAdjust = async (ing: Ingredient) => {
    const delta = Number(adjDelta);
    if (isNaN(delta) || delta === 0) return;
    await ctx.adjustStock(ing.id, delta, ing.stock);
    setAdjId(null);
    setAdjDelta("");
  };

  // ── Styles ────────────────────────────────────────────────────────────────

  const inputStyle = {
    padding: "7px 10px", border: "1px solid #DDD0C0", borderRadius: 7,
    fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#3B1F0E",
    background: "#FAF6EF", outline: "none", width: "100%",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontSize: 10, fontWeight: 700 as const, color: "#8A6040",
    textTransform: "uppercase" as const, letterSpacing: "0.4px",
    marginBottom: 3, display: "block",
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 22, color: "#3B1F0E", marginBottom: 16 }}>
        INVENTORY
      </div>

      {/* ── Low stock alerts ────────────────────────────────────────────── */}
      {ctx.lowStockIngredients.length > 0 && (
        <div style={{ background: "#FFF0E8", border: "1px solid #C0622A40", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#C0622A", marginBottom: 6 }}>⚠️ Low Stock Alerts</div>
          {ctx.lowStockIngredients.map(i => (
            <div key={i.id} style={{ fontSize: 12, color: "#3B1F0E", marginBottom: 2 }}>
              <strong>{i.name}</strong> — {i.stock} {i.unit} remaining (threshold: {i.lowStockThreshold} {i.unit})
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit form ──────────────────────────────────────────────── */}
      <div style={{ background: "#fff", border: "1px solid #E8DDD0", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#6B4226", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {editId ? "✏️ Edit Ingredient" : "➕ Add Ingredient"}
        </div>

        {/* Row 1: Name + Package info */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
          <div>
            <label style={labelStyle}>Ingredient Name</label>
            <input style={inputStyle} placeholder="e.g. Emborg All-Purpose Cream"
              value={form.name} onChange={e => set("name", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Package Type</label>
            <input style={inputStyle} placeholder="e.g. Carton Box, Pack, Jar"
              value={form.packageLabel} onChange={e => set("packageLabel", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Package Size</label>
            <input style={inputStyle} type="number" placeholder="e.g. 1, 180, 2.5"
              value={form.packageSize} onChange={e => set("packageSize", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Unit</label>
            <select style={inputStyle} value={form.packageUnit} onChange={e => set("packageUnit", e.target.value)}>
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>

        {/* Row 2: Purchase details */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
          <div>
            <label style={labelStyle}>Qty Purchased</label>
            <input style={inputStyle} type="number" placeholder="e.g. 12"
              value={form.qtyPurchased} onChange={e => set("qtyPurchased", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Total Cost (₱)</label>
            <input style={inputStyle} type="number" placeholder="e.g. 986"
              value={form.totalCost} onChange={e => set("totalCost", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Low Stock Threshold</label>
            <input style={inputStyle} type="number" placeholder={`in ${form.packageUnit}`}
              value={form.lowStockThreshold} onChange={e => set("lowStockThreshold", e.target.value)} />
          </div>

          {/* Auto-computed preview */}
          <div style={{
            background: valid ? "#F0FAF0" : "#FAF6EF",
            border: `1px solid ${valid ? "#A8D5A2" : "#DDD0C0"}`,
            borderRadius: 7, padding: "7px 10px",
            display: "flex", flexDirection: "column", justifyContent: "center",
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#6B4226", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 2 }}>
              Auto-computed
            </div>
            {valid ? (
              <>
                <div style={{ fontSize: 12, color: "#2A6A2A", fontWeight: 700 }}>
                  Stock: {totalStock} {form.packageUnit}
                </div>
                <div style={{ fontSize: 12, color: "#2A6A2A" }}>
                  ₱{costPerUnit!.toFixed(4)} / {form.packageUnit}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 11, color: "#C8A98A" }}>
                Fill in size, qty &amp; cost
              </div>
            )}
          </div>
        </div>

        {/* Purchase summary tag */}
        {valid && form.packageLabel && (
          <div style={{
            fontSize: 11, color: "#6B4226", background: "#F5ECD7",
            border: "1px solid #DDD0C0", borderRadius: 6,
            padding: "5px 10px", marginBottom: 10, display: "inline-block",
          }}>
            📦 {form.qtyPurchased} × {form.packageLabel} ({form.packageSize}{form.packageUnit}) = {totalStock}{form.packageUnit} for ₱{form.totalCost}
            {" "}→ <strong>₱{costPerUnit!.toFixed(4)}/{form.packageUnit}</strong>
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim() || !valid}
            style={{
              padding: "8px 20px",
              background: saving || !valid ? "#DDD0C0" : "#C0622A",
              border: "none", borderRadius: 7, color: "#fff",
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
              fontSize: 14, cursor: saving || !valid ? "default" : "pointer",
            }}
          >
            {saving ? "Saving…" : editId ? "UPDATE" : "ADD"}
          </button>
          {editId && (
            <button onClick={() => { setEditId(null); setForm(emptyPurchaseForm()); }} style={{
              padding: "8px 20px", background: "transparent", border: "1px solid #DDD0C0",
              borderRadius: 7, color: "#8A6040", fontFamily: "'Barlow', sans-serif",
              fontSize: 13, cursor: "pointer",
            }}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ── Ingredient table ─────────────────────────────────────────────── */}
      <div style={{ background: "#fff", border: "1px solid #E8DDD0", borderRadius: 10, overflow: "hidden" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 70px 80px 90px 90px 120px",
          padding: "8px 14px", background: "#F5ECD7",
          fontSize: 11, fontWeight: 700, color: "#6B4226", textTransform: "uppercase", letterSpacing: "0.5px",
        }}>
          <span>Name</span><span>Unit</span>
          <span style={{ textAlign: "right" }}>Stock</span>
          <span style={{ textAlign: "right" }}>Cost/unit</span>
          <span style={{ textAlign: "right" }}>Low at</span>
          <span style={{ textAlign: "right" }}>Actions</span>
        </div>

        {ctx.ingredients.length === 0 && (
          <div style={{ padding: 24, textAlign: "center", color: "#C8A98A", fontSize: 13 }}>
            No ingredients yet. Add one above.
          </div>
        )}

        {ctx.ingredients.map(ing => (
          <div key={ing.id}>
            <div style={{
              display: "grid", gridTemplateColumns: "2fr 70px 80px 90px 90px 120px",
              padding: "10px 14px", borderTop: "1px solid #F0E8DC",
              fontSize: 12, color: "#3B1F0E", alignItems: "center",
              background: ing.stock <= ing.lowStockThreshold ? "#FFF8F5" : "#fff",
            }}>
              <span style={{ fontWeight: 600 }}>
                {ing.stock <= ing.lowStockThreshold && <span style={{ color: "#C0622A", marginRight: 4 }}>⚠</span>}
                {ing.name}
              </span>
              <span style={{ color: "#8A6040" }}>{ing.unit}</span>
              <span style={{ textAlign: "right", fontWeight: 700 }}>{ing.stock}</span>
              <span style={{ textAlign: "right" }}>₱{ing.costPerUnit}</span>
              <span style={{ textAlign: "right", color: "#8A6040" }}>{ing.lowStockThreshold}</span>
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button onClick={() => setAdjId(adjId === ing.id ? null : ing.id)} style={{
                  fontSize: 11, padding: "3px 8px", border: "1px solid #DDD0C0",
                  borderRadius: 5, background: "#FAF6EF", cursor: "pointer", color: "#6B4226",
                }}>± Stock</button>
                <button onClick={() => handleEdit(ing)} style={{
                  fontSize: 11, padding: "3px 8px", border: "1px solid #DDD0C0",
                  borderRadius: 5, background: "#FAF6EF", cursor: "pointer", color: "#6B4226",
                }}>Edit</button>
                <button onClick={() => ctx.deleteIngredient(ing.id)} style={{
                  fontSize: 11, padding: "3px 8px", border: "1px solid #C0622A40",
                  borderRadius: 5, background: "#FFF0E8", cursor: "pointer", color: "#C0622A",
                }}>Del</button>
              </div>
            </div>

            {/* Inline stock adjustment */}
            {adjId === ing.id && (
              <div style={{ padding: "8px 14px 8px 40px", background: "#FAF6EF", borderTop: "1px solid #F0E8DC", display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  style={{ ...inputStyle, width: 120 }}
                  type="number"
                  placeholder="+/- amount"
                  value={adjDelta}
                  onChange={e => setAdjDelta(e.target.value)}
                />
                <button onClick={() => handleAdjust(ing)} style={{
                  padding: "7px 14px", background: "#3B1F0E", border: "none",
                  borderRadius: 7, color: "#F5ECD7",
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
                  fontSize: 13, cursor: "pointer",
                }}>Apply</button>
                <span style={{ fontSize: 11, color: "#8A6040" }}>
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
