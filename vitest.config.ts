import { defineConfig } from "vitest/config"

// Root-level, cross-workspace suites. Each workspace also has its own
// `vitest run` unit suite executed through `pnpm -r run test`.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "architecture",
          include: ["tests/architecture/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "contracts",
          include: ["tests/contracts/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        test: {
          name: "end-to-end",
          include: ["tests/end-to-end/**/*.test.ts"],
          environment: "node",
          testTimeout: 30_000,
        },
      },
    ],
  },
})
