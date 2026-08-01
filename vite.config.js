import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { spawn } from "child_process";

function analyzerServer() {
  let proc = null;
  return {
    name: "analyzer-server",
    configureServer(server) {
      proc = spawn("node", ["server/index.mjs"], { stdio: "inherit", env: { ...process.env, PORT: "4314" } });
      server.httpServer?.on("close", () => proc?.kill());
    },
  };
}

export default defineConfig({
  plugins: [react(), analyzerServer()],
  base: "./",
  build: { outDir: "dist" },
  server: {
    port: 4311,
    proxy: {
      "/api": "http://localhost:4314",
    },
  },
});
