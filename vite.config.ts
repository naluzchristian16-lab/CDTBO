import { defineConfig } from "vite";
import react            from "@vitejs/plugin-react";
import { VitePWA }      from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // "autoUpdate" — new SW activates as soon as it's ready
      registerType: "autoUpdate",

      // Tell Vite where our custom service worker lives
      srcDir:    "src",
      filename:  "sw.ts",
      strategies: "injectManifest",   // we write the SW ourselves (sw.ts)

      // Files that get pre-cached at install time (app shell)
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },

      manifest: {
        name:             "BrewPOS",
        short_name:       "BrewPOS",
        description:      "Offline-first POS for your coffee shop",
        theme_color:      "#3B1F0E",
        background_color: "#FAF6EF",
        display:          "standalone",        // hides browser chrome → feels native
        orientation:      "portrait",
        start_url:        "/",
        scope:            "/",
        icons: [
          // Generate these with: https://realfavicongenerator.net
          // Place in /public/icons/
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },

      devOptions: {
        // See SW behaviour in dev (vite dev server)
        enabled: true,
        type:    "module",
      },
    }),
  ],
});
