import { useState } from "react";
import { useIngredients } from "../../hooks/useIngredients";
import { products }       from "../../data/products";
import { RecipeIngredient } from "../../types";

interface Props {
  ingredients: ReturnType<typeof useIngredients>;
}

export default function Recipes({ ingredients: ctx }: Props) {
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [recipeRows, setRecipeRows]               = useState<RecipeIngredient[]>([]);
  const [saving, setSaving]                        = useState(false);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const loadProduct = (productId: string) => {
    setSelectedProductId(productId);
    const existing = ctx.getRecipeForProduct(productId);
    setRecipeRows(existing ? [...existing.ingredients] : []);
  };

  const addRow = () => setRecipeRows(prev => [...prev, { ingredientId: "", qty: 0 }]);

  const updateRow = (idx: number, key: keyof RecipeIngredient, value: string | number) => {
    setRecipeRows(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: value };
      return copy;
    });
  };

  const removeRow = (idx: number) =>
    setRecipeRows(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!selectedProductId) return;
    const validRows = recipeRows.filter(r => r.ingredientId && r.qty > 0);
    if (validRows.length === 0) return;
    setSaving(true);
    await ctx.saveRecipe({ productId: selectedProductId, ingredients: validRows });
    setSaving(false);
  };

  // COGS estimate for this recipe
  const cogsEstimate = recipeRows.reduce((sum, row) => {
    const ing = ctx.ingredients.find(i => i.id === row.ingredientId);
    return sum + (ing ? ing.costPerUnit * row.qty : 0);
  }, 0);

  const inputStyle = {
    padding:"6px 8px", border:"1px solid #DDD0C0", borderRadius:6,
    fontFamily:"'Barlow', sans-serif", fontSize:12, color:"#3B1F0E",
    background:"#FAF6EF", outline:"none",
  };

  return (
    <div style={{ padding:16 }}>
      <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:22, color:"#3B1F0E", marginBottom:16 }}>
        RECIPES
      </div>
      <div style={{ fontSize:12, color:"#8A6040", marginBottom:16 }}>
        Define which ingredients (and how much) go into each drink. This drives both inventory deduction and COGS calculation in the Dashboard.
      </div>

      {/* Product selector */}
      <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#6B4226", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.5px" }}>
          Select Drink
        </div>
        <select
          style={{ ...inputStyle, width:"100%", padding:"8px 10px" }}
          value={selectedProductId}
          onChange={e => loadProduct(e.target.value)}
        >
          <option value="">— Choose a drink —</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {selectedProduct && ctx.getRecipeForProduct(selectedProductId) && (
          <div style={{ marginTop:8, fontSize:11, color:"#3B6B28", fontWeight:600 }}>
            ✓ Recipe exists — editing will overwrite it.
          </div>
        )}
      </div>

      {/* Recipe builder */}
      {selectedProductId && (
        <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, padding:"14px 16px", marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#6B4226", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.5px" }}>
            Ingredients for: {selectedProduct?.name}
          </div>

          {ctx.ingredients.length === 0 && (
            <div style={{ fontSize:12, color:"#C0622A", marginBottom:10 }}>
              ⚠ No ingredients found. Add ingredients in the Inventory tab first.
            </div>
          )}

          {recipeRows.map((row, idx) => (
            <div key={idx} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
              <select
                style={{ ...inputStyle, flex:2 }}
                value={row.ingredientId}
                onChange={e => updateRow(idx, "ingredientId", e.target.value)}
              >
                <option value="">— Ingredient —</option>
                {ctx.ingredients.map(i => (
                  <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                ))}
              </select>
              <input
                style={{ ...inputStyle, width:90 }}
                type="number"
                placeholder="Qty"
                value={row.qty || ""}
                onChange={e => updateRow(idx, "qty", Number(e.target.value))}
              />
              <span style={{ fontSize:11, color:"#8A6040", minWidth:30 }}>
                {ctx.ingredients.find(i => i.id === row.ingredientId)?.unit ?? ""}
              </span>
              <button onClick={() => removeRow(idx)} style={{
                padding:"5px 10px", background:"#FFF0E8", border:"1px solid #C0622A40",
                borderRadius:6, color:"#C0622A", fontSize:11, cursor:"pointer",
              }}>✕</button>
            </div>
          ))}

          <button onClick={addRow} style={{
            padding:"7px 14px", background:"transparent",
            border:"1px dashed #C8A98A", borderRadius:7,
            color:"#8A6040", fontFamily:"'Barlow', sans-serif",
            fontSize:12, cursor:"pointer", marginBottom:12,
          }}>
            + Add Ingredient
          </button>

          {/* COGS estimate */}
          {recipeRows.length > 0 && (
            <div style={{ fontSize:12, color:"#3B1F0E", fontWeight:600, marginBottom:12, padding:"8px 12px", background:"#F5ECD7", borderRadius:7 }}>
              Estimated COGS per drink: <span style={{ color:"#C0622A" }}>₱{cogsEstimate.toFixed(2)}</span>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || recipeRows.filter(r => r.ingredientId && r.qty > 0).length === 0}
            style={{
              padding:"9px 24px", background: saving ? "#DDD0C0" : "#C0622A",
              border:"none", borderRadius:8, color:"#fff",
              fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800,
              fontSize:15, cursor: saving ? "default" : "pointer",
            }}
          >
            {saving ? "Saving…" : "SAVE RECIPE"}
          </button>
        </div>
      )}

      {/* All recipes overview */}
      <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, overflow:"hidden" }}>
        <div style={{ padding:"8px 14px", background:"#F5ECD7", fontSize:11, fontWeight:700, color:"#6B4226", textTransform:"uppercase", letterSpacing:"0.5px" }}>
          All Recipes ({ctx.recipes.length})
        </div>
        {ctx.recipes.length === 0
          ? <div style={{ padding:24, textAlign:"center", color:"#C8A98A", fontSize:13 }}>No recipes yet.</div>
          : ctx.recipes.map(recipe => {
              const prod = products.find(p => p.id === recipe.productId);
              return (
                <div key={recipe.id} style={{ padding:"10px 14px", borderTop:"1px solid #F0E8DC" }}>
                  <div style={{ fontWeight:700, fontSize:13, color:"#3B1F0E", marginBottom:4 }}>
                    {prod?.name ?? recipe.productId}
                    <button onClick={() => loadProduct(recipe.productId)} style={{
                      marginLeft:10, fontSize:10, padding:"2px 8px",
                      background:"#F5ECD7", border:"1px solid #DDD0C0",
                      borderRadius:4, cursor:"pointer", color:"#6B4226",
                    }}>Edit</button>
                  </div>
                  {recipe.ingredients.map((ri, i) => {
                    const ing = ctx.ingredients.find(x => x.id === ri.ingredientId);
                    return (
                      <div key={i} style={{ fontSize:12, color:"#8A6040" }}>
                        — {ing?.name ?? ri.ingredientId}: {ri.qty} {ing?.unit}
                      </div>
                    );
                  })}
                </div>
              );
            })
        }
      </div>
    </div>
  );
}
