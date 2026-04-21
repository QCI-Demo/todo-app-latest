import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: [
      "tests/inMemoryRepo.test.ts",
      "tests/localProxyRepo.test.ts",
      "tests/todoApi.test.ts",
    ],
  },
});
