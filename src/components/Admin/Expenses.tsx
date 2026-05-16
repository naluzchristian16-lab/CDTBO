import { useState } from "react";
import { useExpenses, EXPENSE_CATEGORIES } from "../../hooks/useExpenses";
import { Expense } from "../../types";

interface Props {
  expenses: ReturnType<typeof useExpenses>;
}

const emptyForm = (): Omit<Expense, "id" | "createdAt"> => ({
  date: new Date().toISOString().slice(0, 10),
  category: "Fuel",
  description: "",
  amount: 0,
});

export default function Expenses({ expenses: ctx }: Props) {
  const [form, setForm]     = useState(emptyForm());
  const [editId, setEditId] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form, v: string | number) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!form.description.trim() || !form.amount) return;
    setSaving(true);
    if (editId) {
      await ctx.updateExpense(editId, form);
      setEditId(null);
    } else {
      await ctx.addExpense(form);
    }
    setForm(emptyForm());
    setSaving(false);
  };

  const handleEdit = (e: Expense) => {
    setEditId(e.id);
    setForm({ date: e.date, category: e.category, description: e.description, amount: e.amount });
  };

  const inputStyle = {
    padding:"7px 10px", border:"1px solid #DDD0C0", borderRadius:7,
    fontFamily:"'Barlow', sans-serif", fontSize:13, color:"#3B1F0E",
    background:"#FAF6EF", outline:"none", width:"100%", boxSizing:"border-box" as const,
  };

  const filtered  = ctx.expensesForDate(filterDate);
  const dayTotal  = ctx.expenseTotalForDate(filterDate);

  return (
    <div style={{ padding:16 }}>
      <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:22, color:"#3B1F0E", marginBottom:16 }}>
        DAILY EXPENSES
      </div>

      {/* Add / Edit form */}
      <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#6B4226", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.5px" }}>
          {editId ? "Edit Expense" : "Log Expense"}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"140px 1fr 2fr 110px", gap:8, marginBottom:8 }}>
          <input
            style={inputStyle} type="date"
            value={form.date}
            onChange={e => set("date", e.target.value)}
          />
          <select style={inputStyle} value={form.category} onChange={e => set("category", e.target.value)}>
            {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input
            style={inputStyle} placeholder="Description (e.g. Gas for delivery)"
            value={form.description}
            onChange={e => set("description", e.target.value)}
          />
          <input
            style={inputStyle} type="number" placeholder="Amount ₱"
            value={form.amount || ""}
            onChange={e => set("amount", Number(e.target.value))}
          />
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button
            onClick={handleSave}
            disabled={saving || !form.description.trim() || !form.amount}
            style={{
              padding:"8px 20px", background: saving ? "#DDD0C0" : "#C0622A",
              border:"none", borderRadius:7, color:"#fff",
              fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800,
              fontSize:14, cursor: saving ? "default" : "pointer",
            }}
          >
            {saving ? "Saving…" : editId ? "UPDATE" : "LOG EXPENSE"}
          </button>
          {editId && (
            <button onClick={() => { setEditId(null); setForm(emptyForm()); }} style={{
              padding:"8px 20px", background:"transparent", border:"1px solid #DDD0C0",
              borderRadius:7, color:"#8A6040", fontFamily:"'Barlow', sans-serif",
              fontSize:13, cursor:"pointer",
            }}>Cancel</button>
          )}
        </div>
      </div>

      {/* Date filter + total */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:10 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#6B4226", textTransform:"uppercase", letterSpacing:"0.5px" }}>
          Filter by Date:
        </div>
        <input
          type="date" value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          style={{
            padding:"6px 10px", border:"1px solid #DDD0C0", borderRadius:7,
            fontFamily:"'Barlow', sans-serif", fontSize:12, color:"#3B1F0E",
            background:"#fff", outline:"none",
          }}
        />
        <div style={{ marginLeft:"auto", fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:20, color:"#C0622A" }}>
          Total: ₱{dayTotal.toLocaleString("en-PH", { minimumFractionDigits:2 })}
        </div>
      </div>

      {/* Expense table */}
      <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, overflow:"hidden" }}>
        <div style={{
          display:"grid", gridTemplateColumns:"120px 110px 1fr 90px 100px",
          padding:"8px 14px", background:"#F5ECD7",
          fontSize:11, fontWeight:700, color:"#6B4226", textTransform:"uppercase", letterSpacing:"0.5px",
        }}>
          <span>Date</span>
          <span>Category</span>
          <span>Description</span>
          <span style={{ textAlign:"right" }}>Amount</span>
          <span style={{ textAlign:"right" }}>Actions</span>
        </div>

        {filtered.length === 0
          ? <div style={{ padding:24, textAlign:"center", color:"#C8A98A", fontSize:13 }}>
              No expenses logged for this date.
            </div>
          : filtered.map(e => (
            <div key={e.id} style={{
              display:"grid", gridTemplateColumns:"120px 110px 1fr 90px 100px",
              padding:"10px 14px", borderTop:"1px solid #F0E8DC",
              fontSize:12, color:"#3B1F0E", alignItems:"center",
            }}>
              <span style={{ color:"#8A6040" }}>{e.date}</span>
              <span style={{
                display:"inline-block", padding:"2px 8px",
                background:"#F5ECD7", borderRadius:10,
                fontSize:11, fontWeight:600, color:"#6B4226",
              }}>{e.category}</span>
              <span>{e.description}</span>
              <span style={{ textAlign:"right", fontWeight:700, color:"#C0622A" }}>
                ₱{e.amount.toLocaleString("en-PH", { minimumFractionDigits:2 })}
              </span>
              <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
                <button onClick={() => handleEdit(e)} style={{
                  fontSize:11, padding:"3px 8px", border:"1px solid #DDD0C0",
                  borderRadius:5, background:"#FAF6EF", cursor:"pointer", color:"#6B4226",
                }}>Edit</button>
                <button onClick={() => ctx.deleteExpense(e.id)} style={{
                  fontSize:11, padding:"3px 8px", border:"1px solid #C0622A40",
                  borderRadius:5, background:"#FFF0E8", cursor:"pointer", color:"#C0622A",
                }}>Del</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
