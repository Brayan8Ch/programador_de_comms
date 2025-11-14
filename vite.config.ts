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

  /** 🔥 ESTA ES LA PARTE CRÍTICA PARA GITHUB PAGES */
  base: "/comms-craft-grid/",
  /** Nota: debe coincidir EXACTAMENTE con el nombre del repositorio */
}));
