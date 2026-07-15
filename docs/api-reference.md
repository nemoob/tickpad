# Plugin API Reference

## `TickpadPlugin`

```ts
interface TickpadPlugin {
  manifest: TickpadManifest;
  activate(ctx: TickpadPluginContext): void | Promise<void>;
  deactivate?(): void | Promise<void>;
}
```

## `TickpadManifest`

Required fields:

- `id`
- `name`
- `version`
- `apiVersion`

Optional fields:

- `main`
- `permissions`
- `contributes`

## Context Registries

### Commands

```ts
ctx.commands.register({
  id: "plugin.command",
  title: "Run command",
  run: async (input) => {}
});
```

### Panels

```ts
ctx.panels.register({
  id: "plugin.panel",
  title: "Panel",
  render: () => "Panel content"
});
```

### Markdown Blocks

```ts
ctx.markdown.registerBlock({
  language: "diagram",
  render: (code) => `<pre>${code}</pre>`
});
```

### Exporters

```ts
ctx.exporters.register({
  id: "plugin.export",
  title: "Export",
  export: async (markdown) => markdown
});
```

Project exporters return a structured file set instead of writing to disk directly:

```ts
ctx.exporters.register({
  id: "plugin.site",
  title: "Export site",
  output: "project",
  export: async (markdown) => ({
    kind: "project",
    suggestedDirectoryName: "my-site",
    files: [
      { path: "index.html", content: renderSite(markdown) },
      { path: "vercel.json", content: "{}" }
    ]
  })
});
```

The desktop host validates every relative path and owns the destination picker and filesystem write.

## Events

```ts
const dispose = ctx.events.on("document:save", (payload) => {
  console.log(payload);
});

dispose();
```
