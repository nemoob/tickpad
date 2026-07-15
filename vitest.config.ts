import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "packages/**/*.test.ts",
      "apps/**/*.test.ts",
      "plugins/**/*.test.ts",
      "examples/**/*.test.ts"
    ]
  },
  resolve: {
    alias: {
      "@tickpad/plugin-api": new URL("./packages/plugin-api/src/index.ts", import.meta.url).pathname,
      "@tickpad/plugin-host": new URL("./packages/plugin-host/src/index.ts", import.meta.url).pathname,
      "@tickpad/markdown-engine": new URL("./packages/markdown-engine/src/index.ts", import.meta.url).pathname,
      "@tickpad/editor-core": new URL("./packages/editor-core/src/index.ts", import.meta.url).pathname,
      "@tickpad/config": new URL("./packages/config/src/index.ts", import.meta.url).pathname,
      "@tickpad/export": new URL("./packages/export/src/index.ts", import.meta.url).pathname,
      "@tickpad/shared": new URL("./packages/shared/src/index.ts", import.meta.url).pathname,
      "@tickpad/plugin-word-count": new URL("./plugins/word-count/src/index.ts", import.meta.url).pathname,
      "@tickpad/plugin-mermaid": new URL("./plugins/mermaid/src/index.ts", import.meta.url).pathname,
      "@tickpad/plugin-wechat-export": new URL("./plugins/wechat-export/src/index.ts", import.meta.url).pathname,
      "@tickpad/plugin-ai-writer": new URL("./plugins/ai-writer/src/index.ts", import.meta.url).pathname,
      "@tickpad/plugin-vercel-templates": new URL("./plugins/vercel-templates/src/index.ts", import.meta.url).pathname
    }
  }
});
