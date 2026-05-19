/**
 * useSyncStatus.ts
 * ----------------
 * Exposes sync state to the UI:
 *   - pendingCount  : how many writes are queued offline
 *   - lastSyncedAt  : ISO string of last successful sync
 *   - isSyncing     : flush in progress
 *   - manualSync()  : trigger a full pull + flush
 *
 * Auto-flushes pending writes whenever the app comes back online.
 * Mount this once at the top of your app (e.g. in App.tsx).
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { useOnlineStatus }    from "./useOnlineStatus";
import {
  pullFromFirebase, flushPendingWrites,
  startRealtimeListeners, stopRealtimeListeners,
} from "../db/syncEngine";
import { getAllPendingWrites, getLastSyncedAt } from "../db/localDb";

export interface SyncStatus {
  isOnline:     boolean;
  isSyncing:    boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
  lastError:    string | null;
  manualSync:   () => Promise<void>;
}

export function useSyncStatus(): SyncStatus {
  const isOnline      = useOnlineStatus();
  const [isSyncing,    setIsSyncing]    = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [lastError,    setLastError]    = useState<string | null>(null);

  // Track previous online state to detect transitions
  const prevOnlineRef = useRef<boolean | null>(null);

  // ── Poll pending count every 5 seconds ───────────────────────────────────
  useEffect(() => {
    const refresh = async () => {
      const writes = await getAllPendingWrites();
      setPendingCount(writes.length);
    };
    refresh();
    const timer = setInterval(refresh, 5_000);
    return () => clearInterval(timer);
  }, []);

  // ── Load lastSyncedAt from IndexedDB on mount ─────────────────────────────
  useEffect(() => {
    getLastSyncedAt().then(val => setLastSyncedAt(val));
  }, []);

  // ── Real-time listeners: start when online, stop when offline ─────────────
  useEffect(() => {
    if (isOnline) {
      startRealtimeListeners();
    } else {
      stopRealtimeListeners();
    }
    return () => stopRealtimeListeners();
  }, [isOnline]);

  // ── Auto-flush when coming back online ────────────────────────────────────
  useEffect(() => {
    const wasOffline = prevOnlineRef.current === false;
    prevOnlineRef.current = isOnline;

    if (isOnline && wasOffline) {
      flush();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  // ── Initial pull on first load ────────────────────────────────────────────
  useEffect(() => {
    if (isOnline) {
      initialPull();
    }
  // Only on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const initialPull = async () => {
    try {
      setIsSyncing(true);
      setLastError(null);
      await pullFromFirebase();
      const ts = new Date().toISOString();
      setLastSyncedAt(ts);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setLastError(msg);
    } finally {
      setIsSyncing(false);
    }
  };

  const flush = async () => {
    try {
      setIsSyncing(true);
      setLastError(null);
      const { flushed, failed } = await flushPendingWrites();
      if (failed > 0) {
        setLastError(`${failed} write(s) failed to sync — will retry.`);
      }
      if (flushed > 0) {
        const ts = new Date().toISOString();
        setLastSyncedAt(ts);
      }
      const writes = await getAllPendingWrites();
      setPendingCount(writes.length);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setLastError(msg);
    } finally {
      setIsSyncing(false);
    }
  };

  const manualSync = useCallback(async () => {
    if (!isOnline) {
      setLastError("You're offline — connect to a network first.");
      return;
    }
    setIsSyncing(true);
    setLastError(null);
    try {
      await pullFromFirebase();
      await flush();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setLastError(msg);
      setIsSyncing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  return { isOnline, isSyncing, pendingCount, lastSyncedAt, lastError, manualSync };
}
