# Plugin Development

Tickpad plugins depend on `@tickpad/plugin-api` and should not import private app packages.

## Manifest

```json
{
  "id": "reading-time",
  "name": "Reading Time",
  "version": "0.1.0",
  "apiVersion": "0.1",
  "main": "dist/index.js",
  "permissions": ["document:read"],
  "contributes": {
    "panels": ["reading-time.panel"]
  }
}
```

## Permissions

Plugins are default-deny. Declare only the capabilities you use:

- `document:read`
- `document:write`
- `clipboard:read`
- `clipboard:write`
- `network`
- `fs:read`
- `fs:write`

The MVP enforces permissions at the host API boundary.

## API Surface

```ts
ctx.commands.register()
ctx.panels.register()
ctx.toolbar.register()
ctx.markdown.registerBlock()
ctx.exporters.register()
ctx.events.on()
ctx.config.get()
ctx.config.set()
```

## Local Examples

- `examples/plugin-basic`: registers one command.
- `examples/plugin-panel`: registers one panel.
- `examples/plugin-exporter`: registers one exporter.

Run:

```bash
pnpm install
pnpm --filter @tickpad/example-plugin-basic build
pnpm --filter @tickpad/example-plugin-panel build
pnpm --filter @tickpad/example-plugin-exporter build
```

## Create A Plugin

```bash
node scripts/create-plugin.mjs my-plugin
```

This creates a local plugin skeleton under `examples/my-plugin`.
