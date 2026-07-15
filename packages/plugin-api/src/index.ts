export type TickpadPermission =
  | "document:read"
  | "document:write"
  | "clipboard:read"
  | "clipboard:write"
  | "network"
  | "fs:read"
  | "fs:write";

export type CommandHandler = (input?: unknown) => void | Promise<void>;
export type EventHandler<T = unknown> = (payload: T) => void | Promise<void>;

export interface CommandContribution {
  id: string;
  title: string;
  run: CommandHandler;
}

export interface PanelContribution {
  id: string;
  title: string;
  render: () => string;
}

export interface ToolbarContribution {
  id: string;
  title: string;
  command: string;
}

export interface MarkdownBlockContribution {
  language: string;
  render: (code: string) => string;
}

export interface CodeBlockStyleContribution {
  id: string;
  title: string;
  tokens: {
    background: string;
    text: string;
    muted: string;
    controlBackground: string;
    activeBackground: string;
    border?: string;
  };
}

export interface ExporterContribution {
  id: string;
  title: string;
  output?: "text" | "project";
  export: (markdown: string) => ExportResult | Promise<ExportResult>;
}

export interface ProjectExportFile {
  path: string;
  content: string;
}

export interface ProjectExportResult {
  kind: "project";
  suggestedDirectoryName: string;
  files: ProjectExportFile[];
}

export type ExportResult = string | ProjectExportResult;

export interface TickpadManifest {
  id: string;
  name: string;
  version: string;
  apiVersion: "0.1";
  main?: string;
  permissions?: TickpadPermission[];
  contributes?: {
    commands?: string[];
    panels?: string[];
    toolbar?: string[];
    markdownBlocks?: string[];
    codeBlockStyles?: string[];
    exporters?: string[];
  };
}

export interface PluginDocumentApi {
  getMarkdown(): string;
  setMarkdown(markdown: string): void;
  getStats(): { characters: number; words: number; lines: number };
}

export interface PluginClipboardApi {
  readText(): Promise<string>;
  writeText(text: string): Promise<void>;
  writeHtml(html: string): Promise<void>;
}

export interface PluginNetworkApi {
  fetchText(url: string): Promise<string>;
}

export interface PluginFsApi {
  readText(path: string): Promise<string>;
  writeText(path: string, content: string): Promise<void>;
}

export interface TickpadPluginContext {
  manifest: TickpadManifest;
  commands: {
    register(command: CommandContribution): void;
  };
  panels: {
    register(panel: PanelContribution): void;
  };
  toolbar: {
    register(item: ToolbarContribution): void;
  };
  markdown: {
    registerBlock(block: MarkdownBlockContribution): void;
  };
  codeBlockStyles: {
    register(style: CodeBlockStyleContribution): void;
  };
  exporters: {
    register(exporter: ExporterContribution): void;
  };
  events: {
    on<T = unknown>(eventName: string, handler: EventHandler<T>): () => void;
    emit<T = unknown>(eventName: string, payload: T): Promise<void>;
  };
  config: {
    get<T>(key: string, fallback: T): T;
    set<T>(key: string, value: T): void;
  };
  document: PluginDocumentApi;
  clipboard: PluginClipboardApi;
  network: PluginNetworkApi;
  fs: PluginFsApi;
}

export interface TickpadPlugin {
  manifest: TickpadManifest;
  activate(ctx: TickpadPluginContext): void | Promise<void>;
  deactivate?(): void | Promise<void>;
}
