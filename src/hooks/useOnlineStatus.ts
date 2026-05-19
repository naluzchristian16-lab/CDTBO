/**
 * useOnlineStatus.ts
 * ------------------
 * Tracks whether the browser has a network connection.
 * Uses navigator.onLine + online/offline events.
 *
 * Note: navigator.onLine = true means "has a network interface",
 * NOT "Firebase is reachable". For a tighter check you could ping
 * a known endpoint, but for a POS this is accurate enough.
 */

import { useEffect, useState } from "react";

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
