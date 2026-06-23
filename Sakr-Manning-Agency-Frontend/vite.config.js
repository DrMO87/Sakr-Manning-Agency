import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Sakr Manning Agency Dashboard",
        short_name: "SMA Dashboard",
        start_url: "/",
        display: "standalone",
        background_color: "#F3F4F6",
        theme_color: "#0F172A",
        icons: [
          {
            src: "/pwa-192x192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "/pwa-512x512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin,
            handler: "NetworkFirst",
            options: { cacheName: "static-assets" },
          },
        ],
      },
    }),
  ],
  server: {
    historyApiFallback: true,
    proxy: {
      "/ai": {
        target: "https://backend.sakrshipping.com",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});

