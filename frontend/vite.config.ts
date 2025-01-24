import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";

const { NODE_ENV } = process.env;
const VITE_PORT = NODE_ENV === "development" ? 5173 : 4173;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  envDir: "../",
  server: {
    port: VITE_PORT,
    host: true, // needed for the Docker Container port mapping to work
    strictPort: true,
  },
});
