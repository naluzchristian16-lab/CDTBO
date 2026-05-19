/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";
import { clientsClaim }                            from "workbox-core";
import { registerRoute }                           from "workbox-routing";
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from "workbox-strategies";

declare const self: ServiceWorkerGlobalScope;

// ── Take control immediately on activation ────────────────────────────────────
self.skipWaiting();
clientsClaim();

// ── Pre-cache the app shell (injected by vite-plugin-pwa at build time) ───────
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);  // __WB_MANIFEST is replaced at build time

// ── Runtime caching strategies ────────────────────────────────────────────────

// Firebase Firestore & Auth — Network first, fall back to cache
// (When offline, Firestore's own SDK handles this; SW just ensures
//  the auth/config scripts are available.)
registerRoute(
  ({ url }) =>
    url.hostname.includes("firebaseapp.com") ||
    url.hostname.includes("googleapis.com")  ||
    url.hostname.includes("firestore.googleapis.com"),
  new NetworkFirst({ cacheName: "firebase-cache", networkTimeoutSeconds: 4 })
);

// Google Fonts
registerRoute(
  ({ url }) => url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com",
  new CacheFirst({ cacheName: "google-fonts", plugins: [] })
);

// Static assets (JS chunks, CSS, images) — Stale-while-revalidate
registerRoute(
  ({ request }) =>
    request.destination === "script"  ||
    request.destination === "style"   ||
    request.destination === "image",
  new StaleWhileRevalidate({ cacheName: "static-assets" })
);

// ── Offline fallback ──────────────────────────────────────────────────────────
// If everything fails, serve index.html from the pre-cache
// (so the React app can boot and show "you're offline" gracefully)
self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match("/index.html").then(r => r ?? Response.error())
      )
    );
  }
});
