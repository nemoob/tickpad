import react from "@vitejs/plugin-react";
import { defineConfig } from "electron-vite";
import { resolve } from "node:path";

const workspaceRoot = resolve(__dirname, "../..");
const alias = {
  "@tickpad/plugin-api": resolve(workspaceRoot, "packages/plugin-api/src/index.ts"),
  "@tickpad/plugin-host": resolve(workspaceRoot, "packages/plugin-host/src/index.ts"),
  "@tickpad/markdown-engine": resolve(workspaceRoot, "packages/markdown-engine/src/index.ts"),
  "@tickpad/editor-core": resolve(workspaceRoot, "packages/editor-core/src/index.ts"),
  "@tickpad/editor-ui": resolve(workspaceRoot, "packages/editor-ui/src/index.ts"),
  "@tickpad/config": resolve(workspaceRoot, "packages/config/src/index.ts"),
  "@tickpad/export": resolve(workspaceRoot, "packages/export/src/index.ts"),
  "@tickpad/shared": resolve(workspaceRoot, "packages/shared/src/index.ts"),
  "@tickpad/plugin-word-count": resolve(workspaceRoot, "plugins/word-count/src/index.ts"),
  "@tickpad/plugin-mermaid": resolve(workspaceRoot, "plugins/mermaid/src/index.ts"),
  "@tickpad/plugin-wechat-export": resolve(workspaceRoot, "plugins/wechat-export/src/index.ts"),
  "@tickpad/plugin-ai-writer": resolve(workspaceRoot, "plugins/ai-writer/src/index.ts"),
  "@tickpad/plugin-vercel-templates": resolve(workspaceRoot, "plugins/vercel-templates/src/index.ts")
};
const reactPlugin = react() as never;

export default defineConfig({
  main: {
    resolve: { alias },
    build: {
      rollupOptions: {
        input: resolve(__dirname, "src/main/index.ts")
      }
    }
  },
  preload: {
    resolve: { alias },
    build: {
      rollupOptions: {
        input: resolve(__dirname, "src/preload/index.ts"),
        output: {
          entryFileNames: "index.cjs",
          format: "cjs"
        }
      }
    }
  },
  renderer: {
    root: __dirname,
    resolve: { alias },
    build: {
      rollupOptions: {
        input: resolve(__dirname, "index.html")
      }
    },
    plugins: [reactPlugin]
  }
});
