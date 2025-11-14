import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Temporalmente desactivado: lovable-tagger puede causar fallos en Windows
// import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
  },
  // Comentamos el plugin de tagging para aislar fallos durante el arranque
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Alias al paquete en su carpeta para que las importaciones con subpaths
      // (p. ej. 'date-fns/locale') resuelvan correctamente.
      "date-fns": path.resolve(__dirname, "./node_modules/date-fns"),
    },
  },
  // Evitar que esbuild intente procesar source maps rotos en node_modules
  optimizeDeps: {
    esbuildOptions: {
      sourcemap: false,
    },
  },
}));
