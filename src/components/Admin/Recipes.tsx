import { useState } from "react";
import { useIngredients } from "../../hooks/useIngredients";
import { RecipeIngredient, Product } from "../../types";

interface Props {
  ingredients: ReturnType<typeof useIngredients>;
  products: Product[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build the Firestore productId key for a given product + optional size label. */
function recipeKey(productId: string, sizeLabel: string | null): string {
  return sizeLabel ? `${productId}__${sizeLabel}` : productId;
}

/** Get all selectable size labels for a product (null = single-size). */
function getSizes(productId: string, products: Product[]): string[] | null {
  const p = products.find(x => x.id === productId);
  if (!p) return null;
  if (p.singleSize || !p.sizes) return null;
  return p.sizes.map(s => s.label);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Recipes({ ingredients: ctx, products }: Props) {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedSize, setSelectedSize]           = useState<string | null>(null);
  const [recipeRows, setRecipeRows]               = useState<RecipeIngredient[]>([]);
  const [saving, setSaving]                        = useState(false);

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const sizes           = selectedProductId ? getSizes(selectedProductId, products) : null;
  const activeKey       = selectedProductId
    ? recipeKey(selectedProductId, selectedSize)
    : null;

  // ── Selectors ────────────────────────────────────────────────────────────────

  const loadProduct = (productId: string) => {
    setSelectedProductId(productId);
    const productSizes = getSizes(productId, products);
    // Auto-select first size (or null for single-size)
    const firstSize = productSizes ? productSizes[0] : null;
    setSelectedSize(firstSize);
    loadRecipeRows(productId, firstSize);
  };

  const loadSize = (sizeLabel: string) => {
    setSelectedSize(sizeLabel);
    loadRecipeRows(selectedProductId, sizeLabel);
  };

  const loadRecipeRows = (productId: string, sizeLabel: string | null) => {
    const key      = recipeKey(productId, sizeLabel);
    const existing = ctx.getRecipeForProduct(key);
    setRecipeRows(existing ? [...existing.ingredients] : []);
  };

  // ── Row management ───────────────────────────────────────────────────────────

  const addRow = () => setRecipeRows(prev => [...prev, { ingredientId: "", qty: 0 }]);

  const updateRow = (idx: number, key: keyof RecipeIngredient, value: string | number) => {
    setRecipeRows(prev => {
      const copy = [...prev];
      copy[idx]  = { ...copy[idx], [key]: value };
      return copy;
    });
  };

  const removeRow = (idx: number) =>
    setRecipeRows(prev => prev.filter((_, i) => i !== idx));

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!activeKey) return;
    const validRows = recipeRows.filter(r => r.ingredientId && r.qty > 0);
    if (validRows.length === 0) return;
    setSaving(true);
    await ctx.saveRecipe({ productId: activeKey, ingredients: validRows });
    setSaving(false);
  };

  // ── COGS estimate ────────────────────────────────────────────────────────────

  const cogsEstimate = recipeRows.reduce((sum, row) => {
    const ing = ctx.ingredients.find(i => i.id === row.ingredientId);
    return sum + (ing ? ing.costPerUnit * row.qty : 0);
  }, 0);

  // ── Selling price for margin preview ────────────────────────────────────────

  const sellingPrice = (() => {
    if (!selectedProduct) return 0;
    if (selectedProduct.singleSize) return selectedProduct.size?.price ?? 0;
    return selectedProduct.sizes?.find(s => s.label === selectedSize)?.price ?? 0;
  })();

  const marginPct = sellingPrice > 0
    ? ((sellingPrice - cogsEstimate) / sellingPrice) * 100
    : null;

  // ── Styles ───────────────────────────────────────────────────────────────────

  const inputStyle = {
    padding: "6px 8px", border: "1px solid #DDD0C0", borderRadius: 6,
    fontFamily: "'Barlow', sans-serif", fontSize: 12, color: "#3B1F0E",
    background: "#FAF6EF", outline: "none",
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 22, color: "#3B1F0E", marginBottom: 4 }}>
        RECIPES
      </div>
      <div style={{ fontSize: 12, color: "#8A6040", marginBottom: 16 }}>
        Define ingredients per drink <strong>per size</strong>. Each size has its own recipe and COGS.
      </div>

      {/* ── Step 1: Pick drink ──────────────────────────────────────────────── */}
      <div style={{ background: "#fff", border: "1px solid #E8DDD0", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#6B4226", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          1 · Select Drink
        </div>
        <select
          style={{ ...inputStyle, width: "100%", padding: "8px 10px" }}
          value={selectedProductId}
          onChange={e => loadProduct(e.target.value)}
        >
          <option value="">— Choose a drink —</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* ── Step 2: Pick size (only for multi-size drinks) ──────────────────── */}
      {selectedProductId && sizes && (
        <div style={{ background: "#fff", border: "1px solid #E8DDD0", borderRadius: 10, padding: "12px 16px", marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6B4226", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            2 · Select Size
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {sizes.map(size => {
              const key     = recipeKey(selectedProductId, size);
              const hasRecipe = !!ctx.getRecipeForProduct(key);
              const isActive  = selectedSize === size;
              return (
                <button
                  key={size}
                  onClick={() => loadSize(size)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    border: isActive ? "2px solid #C0622A" : "1px solid #DDD0C0",
                    background: isActive ? "#C0622A" : "#FAF6EF",
                    color: isActive ? "#fff" : "#6B4226",
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: "pointer",
                    position: "relative",
                  }}
                >
                  {size}
                  {/* Green dot if recipe exists */}
                  {hasRecipe && (
                    <span style={{
                      position: "absolute", top: -4, right: -4,
                      width: 8, height: 8, borderRadius: "50%",
                      background: "#3B6B28", border: "1.5px solid #fff",
                    }} />
                  )}
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: "#8A6040" }}>
            🟢 = recipe already saved &nbsp;|&nbsp; Each size can have different ingredient amounts
          </div>
        </div>
      )}

      {/* ── Step 3: Recipe builder ──────────────────────────────────────────── */}
      {activeKey && (
        <div style={{ background: "#fff", border: "1px solid #E8DDD0", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6B4226", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            {sizes ? "3" : "2"} · Ingredients
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#3B1F0E", marginBottom: 10 }}>
            {selectedProduct?.name}
            {selectedSize && (
              <span style={{ marginLeft: 8, background: "#C0622A", color: "#fff", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif" }}>
                {selectedSize}
              </span>
            )}
            {sellingPrice > 0 && (
              <span style={{ marginLeft: 8, color: "#8A6040", fontSize: 12, fontWeight: 400 }}>
                Selling price: ₱{sellingPrice}
              </span>
            )}
          </div>

          {ctx.ingredients.length === 0 && (
            <div style={{ fontSize: 12, color: "#C0622A", marginBottom: 10 }}>
              ⚠ No ingredients found. Add ingredients in the Inventory tab first.
            </div>
          )}

          {recipeRows.map((row, idx) => {
            const ing = ctx.ingredients.find(i => i.id === row.ingredientId);
            const rowCost = ing ? ing.costPerUnit * row.qty : 0;
            return (
              <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <select
                  style={{ ...inputStyle, flex: 2 }}
                  value={row.ingredientId}
                  onChange={e => updateRow(idx, "ingredientId", e.target.value)}
                >
                  <option value="">— Ingredient —</option>
                  {ctx.ingredients.map(i => (
                    <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                  ))}
                </select>
                <input
                  style={{ ...inputStyle, width: 80 }}
                  type="number"
                  placeholder="Qty"
                  value={row.qty || ""}
                  onChange={e => updateRow(idx, "qty", Number(e.target.value))}
                />
                <span style={{ fontSize: 11, color: "#8A6040", minWidth: 28 }}>
                  {ing?.unit ?? ""}
                </span>
                {/* Per-row cost */}
                <span style={{ fontSize: 11, color: rowCost > 0 ? "#C0622A" : "#C8A98A", minWidth: 52, textAlign: "right" }}>
                  {rowCost > 0 ? `₱${rowCost.toFixed(2)}` : "—"}
                </span>
                <button onClick={() => removeRow(idx)} style={{
                  padding: "5px 10px", background: "#FFF0E8", border: "1px solid #C0622A40",
                  borderRadius: 6, color: "#C0622A", fontSize: 11, cursor: "pointer",
                }}>✕</button>
              </div>
            );
          })}

          <button onClick={addRow} style={{
            padding: "7px 14px", background: "transparent",
            border: "1px dashed #C8A98A", borderRadius: 7,
            color: "#8A6040", fontFamily: "'Barlow', sans-serif",
            fontSize: 12, cursor: "pointer", marginBottom: 12,
          }}>
            + Add Ingredient
          </button>

          {/* COGS + margin */}
          {recipeRows.length > 0 && (
            <div style={{
              fontSize: 12, marginBottom: 12, padding: "10px 14px",
              background: "#F5ECD7", borderRadius: 7,
              display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8,
            }}>
              <div>
                <div style={{ fontSize: 10, color: "#8A6040", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>COGS</div>
                <div style={{ fontWeight: 800, color: "#C0622A", fontSize: 16, fontFamily: "'Barlow Condensed', sans-serif" }}>
                  ₱{cogsEstimate.toFixed(2)}
                </div>
              </div>
              {sellingPrice > 0 && (
                <>
                  <div>
                    <div style={{ fontSize: 10, color: "#8A6040", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>Gross Profit</div>
                    <div style={{ fontWeight: 800, fontSize: 16, fontFamily: "'Barlow Condensed', sans-serif", color: sellingPrice - cogsEstimate > 0 ? "#3B6B28" : "#C0622A" }}>
                      ₱{(sellingPrice - cogsEstimate).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#8A6040", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>Margin</div>
                    <div style={{ fontWeight: 800, fontSize: 16, fontFamily: "'Barlow Condensed', sans-serif",
                      color: (marginPct ?? 0) > 60 ? "#3B6B28" : (marginPct ?? 0) > 30 ? "#8A6040" : "#C0622A" }}>
                      {marginPct !== null ? `${marginPct.toFixed(1)}%` : "—"}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || recipeRows.filter(r => r.ingredientId && r.qty > 0).length === 0}
            style={{
              padding: "9px 24px",
              background: saving ? "#DDD0C0" : "#C0622A",
              border: "none", borderRadius: 8, color: "#fff",
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800,
              fontSize: 15, cursor: saving ? "default" : "pointer",
            }}
          >
            {saving ? "Saving…" : `SAVE RECIPE${selectedSize ? ` — ${selectedSize}` : ""}`}
          </button>
        </div>
      )}

      {/* ── All recipes overview ────────────────────────────────────────────── */}
      <div style={{ background: "#fff", border: "1px solid #E8DDD0", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "8px 14px", background: "#F5ECD7", fontSize: 11, fontWeight: 700, color: "#6B4226", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          All Recipes ({ctx.recipes.length})
        </div>
        {ctx.recipes.length === 0
          ? <div style={{ padding: 24, textAlign: "center", color: "#C8A98A", fontSize: 13 }}>No recipes yet.</div>
          : ctx.recipes.map(recipe => {
              // Parse display name from key (e.g. "iced_spanish_latte__Malaki")
              const [baseId, sizeLabel] = recipe.productId.split("__");
              const prod = products.find(p => p.id === baseId);
              const cogs = recipe.ingredients.reduce((s, ri) => {
                const ing = ctx.ingredients.find(i => i.id === ri.ingredientId);
                return s + (ing ? ing.costPerUnit * ri.qty : 0);
              }, 0);
              // Selling price for this variant
              const price = (() => {
                if (!prod) return 0;
                if (prod.singleSize) return prod.size?.price ?? 0;
                return prod.sizes?.find(s => s.label === sizeLabel)?.price ?? 0;
              })();
              const margin = price > 0 ? ((price - cogs) / price) * 100 : null;

              return (
                <div key={recipe.id} style={{ padding: "10px 14px", borderTop: "1px solid #F0E8DC" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#3B1F0E" }}>
                      {prod?.name ?? baseId}
                    </span>
                    {sizeLabel && (
                      <span style={{ background: "#F5ECD7", border: "1px solid #DDD0C0", borderRadius: 4, padding: "1px 7px", fontSize: 10, color: "#6B4226", fontWeight: 700 }}>
                        {sizeLabel}
                      </span>
                    )}
                    {margin !== null && (
                      <span style={{
                        marginLeft: "auto", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                        background: margin > 60 ? "#E8F5E9" : margin > 30 ? "#FFF8E1" : "#FDECEA",
                        color:      margin > 60 ? "#3B6B28" : margin > 30 ? "#8A6040" : "#C0622A",
                      }}>
                        {margin.toFixed(0)}% margin
                      </span>
                    )}
                    <button onClick={() => {
                      loadProduct(baseId);
                      if (sizeLabel) setTimeout(() => loadSize(sizeLabel), 0);
                    }} style={{
                      fontSize: 10, padding: "2px 8px",
                      background: "#F5ECD7", border: "1px solid #DDD0C0",
                      borderRadius: 4, cursor: "pointer", color: "#6B4226",
                    }}>Edit</button>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {recipe.ingredients.map((ri, i) => {
                      const ing = ctx.ingredients.find(x => x.id === ri.ingredientId);
                      return (
                        <span key={i} style={{ fontSize: 11, color: "#8A6040" }}>
                          {ing?.name ?? ri.ingredientId}: <strong>{ri.qty}{ing?.unit}</strong>
                          <span style={{ color: "#C8A98A", marginLeft: 2 }}>
                            (₱{ing ? (ing.costPerUnit * ri.qty).toFixed(2) : "?"})
                          </span>
                        </span>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 11, color: "#C0622A", fontWeight: 700 }}>
                    COGS: ₱{cogs.toFixed(2)}
                    {price > 0 && <span style={{ color: "#8A6040", fontWeight: 400 }}> / ₱{price} selling</span>}
                  </div>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}
