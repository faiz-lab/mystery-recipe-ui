// vite.config.js  （プロジェクト直下）
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],

  /* @ を src フォルダに解決 */
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  /* ここを追加 ------------------------------------------------ */
  server: {
  proxy: {
    "/registration_submit": { target: "http://localhost:8000", changeOrigin: true },
    "/selection_submit":    { target: "http://localhost:8000", changeOrigin: true },
    "/ingredients":         { target: "http://localhost:8000", changeOrigin: true },
  },
  },
  
});
