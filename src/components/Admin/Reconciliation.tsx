import { useState } from "react";
import { useReconciliation } from "../../hooks/useReconciliation";
import { useAnalytics }      from "../../hooks/useAnalytics";

interface Props {
  reconciliation: ReturnType<typeof useReconciliation>;
  analytics:      ReturnType<typeof useAnalytics>;
}

const peso = (n: number) =>
  `₱${n.toLocaleString("en-PH", { minimumFractionDigits:2, maximumFractionDigits:2 })}`;

export default function Reconciliation({ reconciliation, analytics }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [actualCash, setActualCash]     = useState("");
  const [notes, setNotes]               = useState("");
  const [saving, setSaving]             = useState(false);

  const expected    = reconciliation.getExpectedCash(selectedDate);
  const existing    = reconciliation.getRecordForDate(selectedDate);
  const actual      = Number(actualCash) || 0;
  const difference  = actual - expected;
  const alreadyDone = !!existing;

  const handleSubmit = async () => {
    if (!actualCash || alreadyDone) return;
    setSaving(true);
    try {
      await reconciliation.submitReconciliation(selectedDate, actual, notes);
      setActualCash("");
      setNotes("");
    } finally {
      setSaving(false);
    }
  };

  // Payment breakdown for context
  const payments = analytics.paymentBreakdown(selectedDate, selectedDate);

  return (
    <div style={{ padding:16 }}>
      <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:22, color:"#3B1F0E", marginBottom:4 }}>
        CASH RECONCILIATION
      </div>
      <div style={{ fontSize:12, color:"#8A6040", marginBottom:16 }}>
        Count your physical cash drawer at end of day and enter it here.
      </div>

      {/* Date picker */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"#6B4226", textTransform:"uppercase" }}>Date:</div>
        <input
          type="date" value={selectedDate}
          max={today}
          onChange={e => { setSelectedDate(e.target.value); setActualCash(""); setNotes(""); }}
          style={{
            padding:"7px 10px", border:"1px solid #DDD0C0", borderRadius:7,
            fontFamily:"'Barlow', sans-serif", fontSize:13, color:"#3B1F0E",
            background:"#fff", outline:"none",
          }}
        />
      </div>

      {/* Payment method context */}
      <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, padding:"12px 16px", marginBottom:14 }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#6B4226", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:10 }}>
          Payment Breakdown for {selectedDate}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10 }}>
          {[
            { label:"💵 Cash Sales", value: payments.cash,  note:"= Expected in drawer" },
            { label:"📱 GCash",      value: payments.gcash, note:"Online — not in drawer" },
            { label:"💳 Card",       value: payments.card,  note:"Online — not in drawer" },
          ].map(p => (
            <div key={p.label} style={{ textAlign:"center", padding:8, background:"#FAF6EF", borderRadius:8 }}>
              <div style={{ fontSize:11, color:"#8A6040", fontWeight:600, marginBottom:2 }}>{p.label}</div>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:18, color:"#3B1F0E" }}>{peso(p.value)}</div>
              <div style={{ fontSize:10, color:"#A09080", marginTop:2 }}>{p.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reconciliation form / result */}
      {alreadyDone ? (
        <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, padding:"16px", marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#3B6B28", marginBottom:12 }}>✅ Reconciliation submitted for {selectedDate}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:11, color:"#8A6040", marginBottom:4 }}>Expected</div>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:22, color:"#3B1F0E" }}>{peso(existing!.expectedCash)}</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:11, color:"#8A6040", marginBottom:4 }}>Actual</div>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:22, color:"#3B1F0E" }}>{peso(existing!.actualCash)}</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:11, color:"#8A6040", marginBottom:4 }}>Difference</div>
              <div style={{
                fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:22,
                color: existing!.difference === 0 ? "#3B6B28" : existing!.difference > 0 ? "#0066CC" : "#C0622A",
              }}>
                {existing!.difference >= 0 ? "+" : ""}{peso(existing!.difference)}
              </div>
            </div>
          </div>
          {existing!.notes && (
            <div style={{ marginTop:10, fontSize:12, color:"#8A6040", padding:"8px 12px", background:"#FAF6EF", borderRadius:7 }}>
              Note: {existing!.notes}
            </div>
          )}
          <div style={{ marginTop:8, fontSize:11, color:"#A09080" }}>Submitted by {existing!.submittedBy}</div>
        </div>
      ) : (
        <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, padding:"16px", marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#6B4226", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:12 }}>
            Count Cash Drawer
          </div>

          {/* Expected vs actual live view */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
            <div style={{ textAlign:"center", padding:10, background:"#FAF6EF", borderRadius:8 }}>
              <div style={{ fontSize:11, color:"#8A6040", marginBottom:4 }}>Expected 💵</div>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:22, color:"#3B1F0E" }}>{peso(expected)}</div>
            </div>
            <div style={{ textAlign:"center", padding:10, background:"#FAF6EF", borderRadius:8 }}>
              <div style={{ fontSize:11, color:"#8A6040", marginBottom:4 }}>Actual (entered)</div>
              <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:22, color:"#3B1F0E" }}>
                {actualCash ? peso(actual) : "₱—"}
              </div>
            </div>
            <div style={{ textAlign:"center", padding:10, borderRadius:8, background: !actualCash ? "#FAF6EF" : difference === 0 ? "#E8F5E9" : difference > 0 ? "#E3F2FD" : "#FDECEA" }}>
              <div style={{ fontSize:11, color:"#8A6040", marginBottom:4 }}>Difference</div>
              <div style={{
                fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:22,
                color: !actualCash ? "#C8A98A" : difference === 0 ? "#3B6B28" : difference > 0 ? "#0066CC" : "#C0622A",
              }}>
                {!actualCash ? "₱—" : `${difference >= 0 ? "+" : ""}${peso(difference)}`}
              </div>
              {actualCash && difference !== 0 && (
                <div style={{ fontSize:10, marginTop:2, color: difference > 0 ? "#0066CC" : "#C0622A" }}>
                  {difference > 0 ? "Overage" : "Short"}
                </div>
              )}
            </div>
          </div>

          <div style={{ display:"flex", gap:8, marginBottom:8 }}>
            <input
              type="number" placeholder="Enter actual cash counted ₱"
              value={actualCash} onChange={e => setActualCash(e.target.value)}
              style={{
                flex:2, padding:"10px 12px", border:"1px solid #DDD0C0", borderRadius:7,
                fontFamily:"'Barlow', sans-serif", fontSize:14, color:"#3B1F0E",
                background:"#FAF6EF", outline:"none",
              }}
            />
            <input
              placeholder="Notes (optional)" value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{
                flex:3, padding:"10px 12px", border:"1px solid #DDD0C0", borderRadius:7,
                fontFamily:"'Barlow', sans-serif", fontSize:13, color:"#3B1F0E",
                background:"#FAF6EF", outline:"none",
              }}
            />
          </div>

          <button onClick={handleSubmit} disabled={saving || !actualCash} style={{
            padding:"10px 28px", background: saving || !actualCash ? "#DDD0C0" : "#3B1F0E",
            border:"none", borderRadius:8, color: saving || !actualCash ? "#B0956A" : "#F5ECD7",
            fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:16,
            cursor: saving || !actualCash ? "default" : "pointer", letterSpacing:"0.5px",
          }}>
            {saving ? "Submitting…" : "SUBMIT RECONCILIATION"}
          </button>
        </div>
      )}

      {/* History */}
      <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontWeight:800, fontSize:16, color:"#3B1F0E", marginBottom:10, textTransform:"uppercase" }}>
        History
      </div>
      <div style={{ background:"#fff", border:"1px solid #E8DDD0", borderRadius:10, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"100px 1fr 1fr 1fr 80px", padding:"8px 14px", background:"#F5ECD7", fontSize:11, fontWeight:700, color:"#6B4226", textTransform:"uppercase", letterSpacing:"0.5px" }}>
          <span>Date</span><span style={{ textAlign:"right" }}>Expected</span><span style={{ textAlign:"right" }}>Actual</span><span style={{ textAlign:"right" }}>Difference</span><span style={{ textAlign:"right" }}>By</span>
        </div>
        {reconciliation.records.length === 0
          ? <div style={{ padding:24, textAlign:"center", color:"#C8A98A", fontSize:13 }}>No records yet.</div>
          : reconciliation.records.map(r => (
            <div key={r.id} style={{ display:"grid", gridTemplateColumns:"100px 1fr 1fr 1fr 80px", padding:"10px 14px", borderTop:"1px solid #F0E8DC", fontSize:12, color:"#3B1F0E", alignItems:"center" }}>
              <span style={{ color:"#8A6040" }}>{r.date}</span>
              <span style={{ textAlign:"right" }}>{peso(r.expectedCash)}</span>
              <span style={{ textAlign:"right" }}>{peso(r.actualCash)}</span>
              <span style={{
                textAlign:"right", fontWeight:700,
                color: r.difference === 0 ? "#3B6B28" : r.difference > 0 ? "#0066CC" : "#C0622A",
              }}>
                {r.difference >= 0 ? "+" : ""}{peso(r.difference)}
              </span>
              <span style={{ textAlign:"right", fontSize:10, color:"#A09080" }}>
                {r.submittedBy.split("@")[0]}
              </span>
            </div>
          ))
        }
      </div>
    </div>
  );
}
