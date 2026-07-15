export interface TickpadUserConfig {
  theme: "light" | "dark";
  fontSize: number;
  lineWidth: number;
  autosave: boolean;
  assetDir: string;
  showOutline: boolean;
}

export const defaultConfig: TickpadUserConfig = {
  theme: "light",
  fontSize: 16,
  lineWidth: 760,
  autosave: true,
  assetDir: "assets",
  showOutline: true
};
