import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  publicDir: path.resolve(__dirname, "../public"),
  base: "./",
  build: {
    outDir: "../dist/dashboard",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/socket.io": {
        target: "http://localhost:4287",
        ws: true,
      },
    },
  },
});
