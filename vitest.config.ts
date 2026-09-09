import { defineConfig, configDefaults } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    exclude: [...configDefaults.exclude, "**/.local-test/**"],
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: {
      "server-only": path.resolve(__dirname, "vitest.server-only.ts"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
