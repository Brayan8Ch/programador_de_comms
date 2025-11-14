import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  // Permite ajustar la base pública (útil para GitHub Pages).
  // Se puede pasar `VITE_BASE` desde el entorno (p. ej. en GitHub Actions).
  base: process.env.VITE_BASE || "/",
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "date-fns": path.resolve(__dirname, "./node_modules/date-fns"),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      sourcemap: false,
    },
  },

  // Nota: la base pública debe establecerse con la variable de entorno VITE_BASE
  // cuando se necesite (p. ej. en GitHub Actions). Por defecto usamos '/'.
}));
