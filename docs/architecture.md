# Tickpad Architecture

## Decision

Tickpad uses Electron, React, TypeScript, and a pnpm workspace. The first public differentiator is the plugin platform, not a custom Markdown parser or a custom editor engine.

## Module Boundaries

- `apps/desktop/main`: owns BrowserWindow creation, dialogs, filesystem writes, PDF export, and native events.
- `apps/desktop/preload`: exposes a small typed `window.tickpad` API. It does not expose generic IPC.
- `apps/desktop/renderer`: owns UI, editor state, and plugin presentation. It must not import Electron or Node modules.
- `packages/plugin-api`: public TypeScript contract. It must not depend on Electron, React, Milkdown, ProseMirror, or app internals.
- `packages/plugin-host`: activates plugins, enforces API version compatibility, records contributions, and guards privileged capabilities.
- `packages/markdown-engine`: renders Markdown and plugin-provided fenced blocks.
- `plugins/*`: first-party plugins that prove the API surface.

## Electron Boundary

BrowserWindow security preferences are explicit:

```ts
contextIsolation: true
nodeIntegration: false
sandbox: true
webSecurity: true
```

Renderer code talks to native features through named preload methods:

- `openMarkdown()`
- `openWorkspace(options)`
- `saveMarkdown({ path, markdown })`
- `exportPdf()`
- `openExternal(url)`
- `checkForUpdates()`
- `setAiSecret({ profileId, baseUrl, apiKey })`
- `deleteAiSecret(profileId)`
- `hasAiSecret(profileId)`
- `completeAi(request)`
- `exportProject(project)`

No generic `invoke(channel, payload)` API is exposed.

AI profile metadata lives in renderer preferences, while API keys are encrypted with Electron `safeStorage` and stay in the main process. A stored key is bound to its normalized HTTPS endpoint. Project exporters return validated relative files; only the main process opens the destination picker and writes a new directory.

## Plugin Model

The MVP supports trusted local plugins and first-party plugins. The permission model is real for host capabilities, but arbitrary third-party UI is not yet marketed as sandboxed. A future version should isolate third-party plugin UI in iframe or worker-style boundaries before calling remote plugin execution secure.

Plugin lifecycle:

1. Host validates `manifest.apiVersion`.
2. Host creates a scoped context.
3. Plugin registers commands, panels, Markdown blocks, exporters, and events.
4. Privileged APIs check declared permissions at call time.

## Risks

- Milkdown/Crepe adds bundle weight. This is acceptable for the MVP because it avoids building an editor engine.
- Mermaid output needs additional sanitization before rendering real SVG output from user content.
- Plugin document writes must eventually route through editor transactions so undo/redo remains coherent.
- Real remote plugin installation needs stronger sandboxing, signing, and host allowlists.
