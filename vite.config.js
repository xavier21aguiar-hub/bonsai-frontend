import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "Bonsai Care",
        short_name: "Bonsai",

        description:
          "Asistente inteligente para cuidado de plantas",

        theme_color: "#4CAF50",

        background_color: "#ffffff",

        display: "standalone",

        orientation: "portrait",

        start_url: "/",

        icons: [
          {
            src: "/bonsai-icon.png",
            sizes: "192x192",
            type: "image/png"
          },

          {
            src: "/bonsai-icon.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ]
});