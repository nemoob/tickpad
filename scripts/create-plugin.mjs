import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const id = process.argv[2];
if (!id || !/^[a-z0-9-]+$/.test(id)) {
  console.error("Usage: node scripts/create-plugin.mjs my-plugin");
  process.exit(1);
}

const root = join(process.cwd(), "examples", id);
await mkdir(join(root, "src"), { recursive: true });

await writeFile(
  join(root, "package.json"),
  `${JSON.stringify(
    {
      name: `@tickpad/example-${id}`,
      version: "0.1.0",
      type: "module",
      main: "dist/index.js",
      types: "dist/index.d.ts",
      scripts: { build: "tsc -p tsconfig.json" },
      dependencies: { "@tickpad/plugin-api": "workspace:*" }
    },
    null,
    2
  )}\n`
);

await writeFile(
  join(root, "tsconfig.json"),
  `{
  "extends": "../../tsconfig.base.json",
  "include": ["src"]
}
`
);

await writeFile(
  join(root, "src/index.ts"),
  `import type { TickpadPlugin } from "@tickpad/plugin-api";

export default {
  manifest: {
    id: "${id}",
    name: "${id}",
    version: "0.1.0",
    apiVersion: "0.1",
    permissions: ["document:read"]
  },
  activate(ctx) {
    ctx.commands.register({
      id: "${id}.hello",
      title: "Hello",
      run: () => {
        console.log(ctx.document.getStats());
      }
    });
  }
} satisfies TickpadPlugin;
`
);

console.log(`Created examples/${id}`);
