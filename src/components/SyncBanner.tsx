/**
 * SyncBanner.tsx
 * --------------
 * Sticky banner at the top of the app that shows:
 *  - 🟢 Online / 🔴 Offline status
 *  - Number of pending writes queued offline
 *  - Last synced time
 *  - Manual sync button
 *  - Sync-in-progress spinner
 *
 * Mount inside your root layout, above <Tabs> or <Router>.
 *
 * Usage:
 *   const sync = useSyncStatus();
 *   <SyncBanner sync={sync} />
 */

import { SyncStatus } from "../hooks/useSyncStatus";

interface Props {
  sync: SyncStatus;
}

function formatTime(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  return d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
}

export default function SyncBanner({ sync }: Props) {
  // Safety guard: if sync is not yet available, render nothing
  if (!sync) return null;

  const { isOnline, isSyncing, pendingCount, lastSyncedAt, lastError, manualSync } = sync;

  // ── Don't render anything if online, synced, and no issues ───────────────
  if (isOnline && pendingCount === 0 && !lastError && !isSyncing) {
    return (
      // Subtle online pill — non-intrusive
      <div style={{
        display: "flex", justifyContent: "flex-end",
        padding: "4px 16px", background: "transparent",
      }}>
        <span style={{ fontSize: 10, color: "#3B6B28", fontWeight: 600 }}>
          🟢 Synced {formatTime(lastSyncedAt)}
        </span>
      </div>
    );
  }

  // ── Offline or pending writes banner ─────────────────────────────────────
  const bgColor     = isOnline ? "#FFF8E1" : "#FFF0E8";
  const borderColor = isOnline ? "#D4A017" : "#C0622A";
  const textColor   = isOnline ? "#7A5C00" : "#C0622A";

  return (
    <div style={{
      background:   bgColor,
      borderBottom: `2px solid ${borderColor}`,
      padding:      "8px 16px",
      display:      "flex",
      alignItems:   "center",
      gap:          10,
      flexWrap:     "wrap",
      position:     "sticky",
      top:          0,
      zIndex:       100,
    }}>

      {/* Status dot + label */}
      <span style={{ fontSize: 12, fontWeight: 700, color: textColor }}>
        {isOnline ? "🟡" : "🔴"}
        {" "}
        {isOnline ? "Online" : "Offline mode"}
      </span>

      {/* Pending writes */}
      {pendingCount > 0 && (
        <span style={{
          fontSize: 11, color: textColor,
          background: borderColor + "22",
          border: `1px solid ${borderColor}`,
          borderRadius: 5, padding: "2px 8px", fontWeight: 600,
        }}>
          {pendingCount} change{pendingCount > 1 ? "s" : ""} pending sync
        </span>
      )}

      {/* Syncing spinner */}
      {isSyncing && (
        <span style={{ fontSize: 11, color: textColor, fontStyle: "italic" }}>
          ⏳ Syncing…
        </span>
      )}

      {/* Error */}
      {lastError && (
        <span style={{ fontSize: 11, color: "#C0622A", flex: 1 }}>
          ⚠ {lastError}
        </span>
      )}

      {/* Last synced */}
      <span style={{ fontSize: 10, color: "#A09080", marginLeft: "auto" }}>
        Last synced: {formatTime(lastSyncedAt)}
      </span>

      {/* Manual sync button */}
      <button
        onClick={manualSync}
        disabled={isSyncing || !isOnline}
        style={{
          padding:     "5px 12px",
          background:  isSyncing || !isOnline ? "#E0D0C0" : "#C0622A",
          border:      "none",
          borderRadius: 6,
          color:       isSyncing || !isOnline ? "#A09080" : "#fff",
          fontFamily:  "'Barlow Condensed', sans-serif",
          fontWeight:  800,
          fontSize:    12,
          cursor:      isSyncing || !isOnline ? "default" : "pointer",
          letterSpacing: "0.5px",
        }}
      >
        {isSyncing ? "Syncing…" : "↻ Sync Now"}
      </button>
    </div>
  );
}
