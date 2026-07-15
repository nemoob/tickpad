import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { applyCodeBlockStyle, getCodeBlockStyle } from "./code-block-style";
import { migrateLegacyStorage } from "./storage-migration";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import "./styles.css";

migrateLegacyStorage(window.localStorage);
applyCodeBlockStyle(getCodeBlockStyle());

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
