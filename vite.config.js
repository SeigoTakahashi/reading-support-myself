import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.js"],
    globals: true,
    exclude: [
      "node_modules/**", // 標準で除外
      "tests/e2e/**"     // E2E テストは Playwright で実行するため除外
    ], 
  },
});
