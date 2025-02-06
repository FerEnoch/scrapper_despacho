import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: "./src/tests/setup.ts",
    isolate: true,
    include: ["./src/tests/**/*.test.ts"],
    exclude: ["./src/tests/**/*.spec.ts"],
  },
});
