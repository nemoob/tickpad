# Tickpad

Tickpad is an Alpha, plugin-first Markdown editor built with Electron, React, and TypeScript.

The editor should be useful on its own, but the project's main product direction is a public plugin surface for commands, panels, Markdown blocks, exporters, events, configuration, and permissioned host capabilities.

## Alpha Status

Tickpad is early software. APIs, plugins, file formats, and behavior may change without migration support. Keep backups of work that matters to you.

The project currently supports:

- Running from source on a development machine.
- A local, unsigned macOS arm64 application build.

There are no official signed release artifacts yet. Do not treat a locally built app as a signed, notarized, or supported distribution.

## Run From Source

Requirements: Node.js 22 or newer and Corepack. The `packageManager` field pins pnpm to 11.7.0.

```bash
corepack enable
pnpm install
pnpm dev
```

For a browser-only renderer preview:

```bash
pnpm --filter @tickpad/desktop dev:web
```

## Develop, Test, And Package

Run these from the repository root:

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm package:mac -- --arm64
```

`package:mac` produces a local unsigned macOS arm64 app build. It is not an official release and is not signed or notarized.

## Architecture

```txt
apps/desktop              Electron main, preload, and renderer application
packages/plugin-api       Public plugin contracts
packages/plugin-host      Plugin lifecycle, registries, and permissions
packages/editor-core      Document state and editor commands
packages/markdown-engine  Markdown rendering and block extensions
packages/export           Built-in export helpers
plugins/*                 First-party plugins that exercise the API
examples/*                Third-party plugin examples
docs/*                    Architecture and plugin documentation
```

The renderer does not import Electron or Node modules. Native capabilities are exposed through the named `window.tickpad` preload API.

## Documentation

- [Architecture](docs/architecture.md)
- [Plugin development](docs/plugin-development.md)
- [API reference](docs/api-reference.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Code of conduct](CODE_OF_CONDUCT.md)

## Included Plugins

- `@tickpad/plugin-word-count`: document word and character counts.
- `@tickpad/plugin-mermaid`: Mermaid diagrams in Markdown documents.
- `@tickpad/plugin-vercel-templates`: export the current document as a static site project.

## License

Tickpad is available under the [MIT License](LICENSE).
