import { useState } from "react";
import { useProducts } from "../../hooks/useProducts";
import { Product, ProductSize } from "../../types";
import { v4 as uuidv4 } from "uuid";

const S: Record<string, React.CSSProperties> = {
  wrap:      { padding: 16 },
  header:    { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 22, color: "#3B1F0E", marginBottom: 16 },
  card:      { background: "#fff", border: "1px solid #E8DDD0", borderRadius: 10, padding: "12px 14px", marginBottom: 8 },
  row:       { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const },
  label:     { fontSize: 10, fontWeight: 700, color: "#8A6040", textTransform: "uppercase" as const, letterSpacing: "0.5px", marginBottom: 2 },
  input:     { padding: "7px 10px", border: "1px solid #DDD0C0", borderRadius: 7, fontFamily: "'Barlow', sans-serif", fontSize: 13, color: "#3B1F0E", background: "#FAF6EF", outline: "none", width: "100%", boxSizing: "border-box" as const },
  btn:       { padding: "8px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontFamily: "'Barlow', sans-serif", fontWeight: 700, fontSize: 12 },
  btnAdd:    { background: "#C0622A", color: "#fff" },
  btnDanger: { background: "transparent", border: "1px solid #C0622A", color: "#C0622A" },
  btnGhost:  { background: "#F5ECD7", color: "#6B4226" },
  tag:       { padding: "3px 10px", borderRadius: 12, background: "#F5ECD7", color: "#6B4226", fontSize: 11, fontWeight: 600 },
  sectionTitle: { fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 15, color: "#3B1F0E", marginBottom: 8, marginTop: 20, textTransform: "uppercase" as const, letterSpacing: "0.5px" },
  sizeRow:   { display: "flex", gap: 6, alignItems: "center", marginBottom: 4 },
};

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ flex: 1, minWidth: 120 }}>
      <div style={S.label}>{label}</div>
      {children}
    </div>
  );
}

// ── Add Category ──────────────────────────────────────────────────────────────
function AddCategoryForm({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = useState("");
  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName("");
  };
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
      <input
        style={{ ...S.input, flex: 1 }}
        placeholder="New category name…"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === "Enter" && submit()}
      />
      <button style={{ ...S.btn, ...S.btnAdd }} onClick={submit}>+ Add</button>
    </div>
  );
}

// ── Add / Edit Product Form ───────────────────────────────────────────────────
interface ProductFormData {
  name:       string;
  category:   string;
  coffee:     boolean;
  singleSize: boolean;
  sizeLabel:  string;   // for singleSize
  sizePrice:  string;
  sizes:      { label: string; price: string }[];
}

const BLANK_FORM: ProductFormData = {
  name: "", category: "", coffee: false, singleSize: true,
  sizeLabel: "", sizePrice: "",
  sizes: [{ label: "Malaki", price: "" }, { label: "Mas Malaki", price: "" }],
};

function ProductForm({
  categories,
  initial,
  onSave,
  onCancel,
}: {
  categories: string[];
  initial?: ProductFormData;
  onSave: (data: ProductFormData) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ProductFormData>(initial ?? BLANK_FORM);

  const set = (k: keyof ProductFormData, v: any) => setForm(f => ({ ...f, [k]: v }));

  const updateSize = (i: number, key: "label" | "price", val: string) => {
    const sizes = [...form.sizes];
    sizes[i] = { ...sizes[i], [key]: val };
    setForm(f => ({ ...f, sizes }));
  };

  const addSize = () => setForm(f => ({ ...f, sizes: [...f.sizes, { label: "", price: "" }] }));
  const removeSize = (i: number) => setForm(f => ({ ...f, sizes: f.sizes.filter((_, idx) => idx !== i) }));

  const cats = categories.filter(c => c !== "All Products");

  const valid = form.name.trim() && form.category &&
    (form.singleSize
      ? form.sizeLabel.trim() && Number(form.sizePrice) > 0
      : form.sizes.every(s => s.label.trim() && Number(s.price) > 0));

  return (
    <div style={{ ...S.card, border: "1px solid #C0622A", background: "#FFF8F4" }}>
      <div style={{ ...S.row, marginBottom: 10 }}>
        <FieldGroup label="Product Name">
          <input style={S.input} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Iced Lavender Latte" />
        </FieldGroup>
        <FieldGroup label="Category">
          <select style={S.input} value={form.category} onChange={e => set("category", e.target.value)}>
            <option value="">— Choose —</option>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </FieldGroup>
      </div>

      <div style={{ ...S.row, marginBottom: 10 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
          <input type="checkbox" checked={form.coffee} onChange={e => set("coffee", e.target.checked)} />
          Has Espresso (enables Extra Shot add-on)
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
          <input type="radio" checked={form.singleSize} onChange={() => set("singleSize", true)} />
          Single size
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
          <input type="radio" checked={!form.singleSize} onChange={() => set("singleSize", false)} />
          Multiple sizes
        </label>
      </div>

      {form.singleSize ? (
        <div style={S.row}>
          <FieldGroup label="Size Label">
            <input style={S.input} value={form.sizeLabel} onChange={e => set("sizeLabel", e.target.value)} placeholder="e.g. 12oz" />
          </FieldGroup>
          <FieldGroup label="Price (₱)">
            <input style={S.input} type="number" value={form.sizePrice} onChange={e => set("sizePrice", e.target.value)} placeholder="0" />
          </FieldGroup>
        </div>
      ) : (
        <div>
          <div style={S.label}>Sizes & Prices</div>
          {form.sizes.map((s, i) => (
            <div key={i} style={S.sizeRow}>
              <input style={{ ...S.input, width: 120 }} placeholder="Label" value={s.label} onChange={e => updateSize(i, "label", e.target.value)} />
              <span style={{ fontSize: 12, color: "#8A6040" }}>₱</span>
              <input style={{ ...S.input, width: 80 }} type="number" placeholder="0" value={s.price} onChange={e => updateSize(i, "price", e.target.value)} />
              {form.sizes.length > 1 && (
                <button style={{ ...S.btn, ...S.btnDanger, padding: "5px 10px" }} onClick={() => removeSize(i)}>✕</button>
              )}
            </div>
          ))}
          <button style={{ ...S.btn, ...S.btnGhost, marginTop: 4 }} onClick={addSize}>+ Add Size</button>
        </div>
      )}

      <div style={{ ...S.row, marginTop: 12, justifyContent: "flex-end" }}>
        <button style={{ ...S.btn, ...S.btnGhost }} onClick={onCancel}>Cancel</button>
        <button style={{ ...S.btn, ...S.btnAdd, opacity: valid ? 1 : 0.5 }} onClick={() => valid && onSave(form)} disabled={!valid}>
          Save Product
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProductManager() {
  const { products, categories, catRows, loading, addProduct, updateProduct, deleteProduct, addCategory, deleteCategory } = useProducts();
  const [showAddProduct, setShowAddProduct]   = useState(false);
  const [editingId, setEditingId]             = useState<string | null>(null);
  const [filterCat, setFilterCat]             = useState("All Products");
  const [confirmDelete, setConfirmDelete]     = useState<string | null>(null);

  if (loading) return <div style={{ padding: 24, color: "#8A6040" }}>Loading products…</div>;

  const formDataToProduct = (data: ProductFormData, id?: string): Omit<Product, "id"> => ({
    name:     data.name.trim(),
    category: data.category,
    coffee:   data.coffee,
    singleSize: data.singleSize,
    ...(data.singleSize
      ? { size: { label: data.sizeLabel.trim(), price: Number(data.sizePrice) } }
      : { sizes: data.sizes.map(s => ({ label: s.label.trim(), price: Number(s.price) })) }
    ),
  });

  const productToFormData = (p: Product): ProductFormData => ({
    name:       p.name,
    category:   p.category,
    coffee:     p.coffee,
    singleSize: !!p.singleSize,
    sizeLabel:  p.size?.label ?? "",
    sizePrice:  p.size ? String(p.size.price) : "",
    sizes:      p.sizes?.map(s => ({ label: s.label, price: String(s.price) })) ?? [{ label: "Malaki", price: "" }, { label: "Mas Malaki", price: "" }],
  });

  const handleSaveNew = async (data: ProductFormData) => {
    await addProduct(formDataToProduct(data));
    setShowAddProduct(false);
  };

  const handleUpdate = async (id: string, data: ProductFormData) => {
    await updateProduct(id, formDataToProduct(data));
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    setConfirmDelete(null);
  };

  const filtered = filterCat === "All Products"
    ? products
    : products.filter(p => p.category === filterCat);

  return (
    <div style={S.wrap}>
      <div style={S.header}>🛍 Product Manager</div>

      {/* ── Categories ─────────────────────────────────────────────────────── */}
      <div style={S.sectionTitle}>Categories</div>
      <AddCategoryForm onAdd={addCategory} />
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {catRows.map(c => (
          <div key={c.id} style={{ ...S.tag, display: "flex", alignItems: "center", gap: 6 }}>
            {c.name}
            <button
              onClick={() => deleteCategory(c.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#C0622A", fontSize: 12, padding: 0, lineHeight: 1 }}
              title="Delete category"
            >✕</button>
          </div>
        ))}
      </div>

      {/* ── Products ───────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={S.sectionTitle}>Products ({products.length})</div>
        <button style={{ ...S.btn, ...S.btnAdd }} onClick={() => { setShowAddProduct(true); setEditingId(null); }}>
          + Add Product
        </button>
      </div>

      {/* Filter by category */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
        {categories.map(c => (
          <button key={c} onClick={() => setFilterCat(c)} style={{
            ...S.btn, padding: "5px 10px",
            background: filterCat === c ? "#C0622A" : "#F5ECD7",
            color: filterCat === c ? "#fff" : "#6B4226",
          }}>{c}</button>
        ))}
      </div>

      {/* Add form */}
      {showAddProduct && !editingId && (
        <ProductForm categories={categories} onSave={handleSaveNew} onCancel={() => setShowAddProduct(false)} />
      )}

      {/* Product list */}
      {filtered.length === 0 && (
        <div style={{ padding: "24px 0", textAlign: "center", color: "#C8A98A", fontSize: 13 }}>
          No products yet. Add one above!
        </div>
      )}

      {filtered.map(p => (
        <div key={p.id}>
          {editingId === p.id ? (
            <ProductForm
              categories={categories}
              initial={productToFormData(p)}
              onSave={data => handleUpdate(p.id, data)}
              onCancel={() => setEditingId(null)}
            />
          ) : confirmDelete === p.id ? (
            <div style={{ ...S.card, border: "1px solid #C0622A", background: "#FFF0EB" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#3B1F0E", marginBottom: 8 }}>
                Delete <strong>{p.name}</strong>? This can't be undone.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ ...S.btn, ...S.btnGhost }} onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button style={{ ...S.btn, background: "#C0622A", color: "#fff" }} onClick={() => handleDelete(p.id)}>Yes, Delete</button>
              </div>
            </div>
          ) : (
            <div style={S.card}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 15, color: "#3B1F0E" }}>
                    {p.name}
                    {p.coffee && <span style={{ marginLeft: 6, fontSize: 10, background: "#C0622A20", color: "#C0622A", borderRadius: 4, padding: "1px 6px", fontFamily: "Barlow" }}>☕ coffee</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#8A6040", marginTop: 2 }}>
                    {p.category} ·&nbsp;
                    {p.singleSize
                      ? `${p.size?.label} — ₱${p.size?.price}`
                      : p.sizes?.map(s => `${s.label} ₱${s.price}`).join(" / ")
                    }
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button style={{ ...S.btn, ...S.btnGhost, padding: "5px 10px" }} onClick={() => { setEditingId(p.id); setShowAddProduct(false); }}>Edit</button>
                  <button style={{ ...S.btn, ...S.btnDanger, padding: "5px 10px" }} onClick={() => setConfirmDelete(p.id)}>Delete</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
