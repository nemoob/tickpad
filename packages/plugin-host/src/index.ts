import type {
  CodeBlockStyleContribution,
  CommandContribution,
  EventHandler,
  ExporterContribution,
  MarkdownBlockContribution,
  TickpadPermission,
  TickpadPlugin,
  TickpadPluginContext,
  PanelContribution,
  ToolbarContribution
} from "@tickpad/plugin-api";

export class PermissionDeniedError extends Error {
  constructor(permission: TickpadPermission, pluginId: string) {
    super(`Plugin "${pluginId}" requires permission "${permission}".`);
    this.name = "PermissionDeniedError";
  }
}

export class IncompatiblePluginError extends Error {
  constructor(apiVersion: string, pluginId: string) {
    super(`Unsupported plugin API version "${apiVersion}" for plugin "${pluginId}".`);
    this.name = "IncompatiblePluginError";
  }
}

export interface CreatePluginHostOptions {
  markdown: string;
  onMarkdownChange?: (markdown: string) => void;
  clipboard?: {
    readText(): Promise<string>;
    writeText(text: string): Promise<void>;
    writeHtml?(html: string): Promise<void>;
  };
  network?: {
    fetchText(url: string): Promise<string>;
  };
  fs?: {
    readText(path: string): Promise<string>;
    writeText(path: string, content: string): Promise<void>;
  };
}

export interface PluginHost {
  activate(plugin: TickpadPlugin): Promise<void>;
  deactivate(pluginId: string): Promise<void>;
  emit<T>(eventName: string, payload: T): Promise<void>;
  getCommands(): CommandContribution[];
  getPanels(): PanelContribution[];
  getToolbarItems(): ToolbarContribution[];
  getMarkdownBlocks(): MarkdownBlockContribution[];
  getCodeBlockStyles(): CodeBlockStyleContribution[];
  getExporters(): ExporterContribution[];
  getMarkdown(): string;
  setMarkdown(markdown: string): void;
}

export function createPluginHost(options: CreatePluginHostOptions): PluginHost {
  let markdown = options.markdown;
  const commands: CommandContribution[] = [];
  const panels: PanelContribution[] = [];
  const toolbar: ToolbarContribution[] = [];
  const blocks: MarkdownBlockContribution[] = [];
  const codeBlockStyles: CodeBlockStyleContribution[] = [];
  const exporters: ExporterContribution[] = [];
  const config = new Map<string, unknown>();
  const plugins = new Map<string, TickpadPlugin>();
  const eventHandlers = new Map<string, EventHandler[]>();

  const requirePermission = (
    manifestPermissions: TickpadPermission[] | undefined,
    permission: TickpadPermission,
    pluginId: string
  ) => {
    if (!manifestPermissions?.includes(permission)) {
      throw new PermissionDeniedError(permission, pluginId);
    }
  };

  const createContext = (plugin: TickpadPlugin): TickpadPluginContext => {
    const { manifest } = plugin;
    return {
      manifest,
      commands: {
        register(command) {
          commands.push(command);
        }
      },
      panels: {
        register(panel) {
          panels.push(panel);
        }
      },
      toolbar: {
        register(item) {
          toolbar.push(item);
        }
      },
      markdown: {
        registerBlock(block) {
          blocks.push(block);
        }
      },
      codeBlockStyles: {
        register(style) {
          codeBlockStyles.push(style);
        }
      },
      exporters: {
        register(exporter) {
          exporters.push(exporter);
        }
      },
      events: {
        on(eventName, handler) {
          const handlers = eventHandlers.get(eventName) ?? [];
          handlers.push(handler as EventHandler);
          eventHandlers.set(eventName, handlers);
          return () => {
            const next = (eventHandlers.get(eventName) ?? []).filter((item) => item !== handler);
            eventHandlers.set(eventName, next);
          };
        },
        emit(eventName, payload) {
          return emit(eventName, payload);
        }
      },
      config: {
        get(key, fallback) {
          return (config.has(key) ? config.get(key) : fallback) as typeof fallback;
        },
        set(key, value) {
          config.set(key, value);
        }
      },
      document: {
        getMarkdown() {
          requirePermission(manifest.permissions, "document:read", manifest.id);
          return markdown;
        },
        setMarkdown(nextMarkdown) {
          requirePermission(manifest.permissions, "document:write", manifest.id);
          markdown = nextMarkdown;
          options.onMarkdownChange?.(nextMarkdown);
        },
        getStats() {
          requirePermission(manifest.permissions, "document:read", manifest.id);
          const text = markdown.replace(/[#*_`>\-[\]()]/g, " ").replace(/\s+/g, " ").trim();
          return {
            characters: markdown.length,
            words: text ? text.split(/\s+/).length : 0,
            lines: markdown.split(/\r?\n/).length
          };
        }
      },
      clipboard: {
        async readText() {
          requirePermission(manifest.permissions, "clipboard:read", manifest.id);
          return options.clipboard?.readText() ?? "";
        },
        async writeText(text) {
          requirePermission(manifest.permissions, "clipboard:write", manifest.id);
          await options.clipboard?.writeText(text);
        },
        async writeHtml(html) {
          requirePermission(manifest.permissions, "clipboard:write", manifest.id);
          if (options.clipboard?.writeHtml) {
            await options.clipboard.writeHtml(html);
            return;
          }
          await options.clipboard?.writeText(html);
        }
      },
      network: {
        async fetchText(url) {
          requirePermission(manifest.permissions, "network", manifest.id);
          return options.network?.fetchText(url) ?? "";
        }
      },
      fs: {
        async readText(path) {
          requirePermission(manifest.permissions, "fs:read", manifest.id);
          return options.fs?.readText(path) ?? "";
        },
        async writeText(path, content) {
          requirePermission(manifest.permissions, "fs:write", manifest.id);
          await options.fs?.writeText(path, content);
        }
      }
    };
  };

  async function emit<T>(eventName: string, payload: T): Promise<void> {
    const handlers = eventHandlers.get(eventName) ?? [];
    await Promise.all(handlers.map((handler) => handler(payload)));
  }

  return {
    async activate(plugin) {
      if (plugins.has(plugin.manifest.id)) {
        return;
      }
      if (plugin.manifest.apiVersion !== "0.1") {
        throw new IncompatiblePluginError(plugin.manifest.apiVersion, plugin.manifest.id);
      }
      plugins.set(plugin.manifest.id, plugin);
      await plugin.activate(createContext(plugin));
    },
    async deactivate(pluginId) {
      const plugin = plugins.get(pluginId);
      if (plugin?.deactivate) {
        await plugin.deactivate();
      }
      plugins.delete(pluginId);
    },
    emit,
    getCommands: () => [...commands],
    getPanels: () => [...panels],
    getToolbarItems: () => [...toolbar],
    getMarkdownBlocks: () => [...blocks],
    getCodeBlockStyles: () => [...codeBlockStyles],
    getExporters: () => [...exporters],
    getMarkdown: () => markdown,
    setMarkdown(nextMarkdown) {
      markdown = nextMarkdown;
    }
  };
}
