# Tickpad Carbon Blue Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the Tickpad product website with the approved Carbon Blue direction while preserving its content, assets, links, responsiveness, and deployment.

**Architecture:** Keep the existing static Vite page and replace only its semantic presentation layer. The HTML receives compact product metadata and technical labels; the existing stylesheet is rewritten as a dependency-free tokenized dark theme with responsive breakpoints.

**Tech Stack:** HTML, CSS, TypeScript, Vite, Playwright CLI, Vercel

## Global Constraints

- Do not change the Tickpad desktop application or add dependencies.
- Keep `tickpad-app.png` and `tickpad-icon.png` as the product visuals.
- Use `#0b0d11`, `#11141a`, `#f5f7fa`, `#a8afb9`, and `#3274ff` as the core palette.
- Do not add decorative gradients, orbs, or horizontal overflow.
- Keep every modified source file at or below 500 lines.
- Preserve the existing GitHub links, release download flow, and Vercel configuration.

---

### Task 1: Carbon Blue Page Structure

**Files:**
- Modify: `apps/site/index.html`

**Interfaces:**
- Consumes: Existing static assets and GitHub URLs.
- Produces: Semantic classes consumed by `apps/site/src/styles.css`.

- [ ] **Step 1: Update the document chrome**

Set the browser theme color to `#0b0d11` and keep the current metadata, icon, title, and navigation links.

- [ ] **Step 2: Add hero metadata**

Add a compact list with `LOCAL-FIRST`, `PLUGIN-READY`, and `v0.1.0 PREVIEW`, and add a product-frame toolbar above the existing screenshot surface.

- [ ] **Step 3: Add restrained technical labels**

Add section indices and command-line labels to the existing feature, plugin, download, and footer content without changing the content hierarchy.

- [ ] **Step 4: Validate HTML references**

Run: `rg 'tickpad-app|tickpad-icon|github.com/nemoob/tickpad' apps/site/index.html`

Expected: Both assets and all existing repository/release links remain present.

### Task 2: Carbon Blue Responsive Styling

**Files:**
- Modify: `apps/site/src/styles.css`

**Interfaces:**
- Consumes: Classes and semantic elements from `apps/site/index.html`.
- Produces: Desktop, tablet, and mobile visual layout.

- [ ] **Step 1: Define the visual tokens**

Create CSS custom properties for the approved carbon, charcoal, white, gray, blue, border, and typography values.

- [ ] **Step 2: Restyle navigation and hero**

Use a dark sticky header, compact monospace labels, a blue primary action, and a dark application frame that displays the real screenshot unchanged.

- [ ] **Step 3: Restyle content sections**

Use border-separated feature cells, a charcoal plugin code surface, one blue download action, and a compact technical footer.

- [ ] **Step 4: Implement responsive breakpoints**

Keep three feature columns on desktop, two on tablet, and one on mobile. Make actions full width on small screens and ensure the screenshot remains inspectable without page overflow.

- [ ] **Step 5: Enforce the source size limit**

Run: `wc -l apps/site/index.html apps/site/src/styles.css`

Expected: Each file reports 500 lines or fewer.

### Task 3: Build, Visual Verification, and Deployment

**Files:**
- Test output only: `test-results/site/`

**Interfaces:**
- Consumes: Completed static site.
- Produces: Verified build and production deployment.

- [ ] **Step 1: Build the website**

Run: `pnpm --filter @tickpad/site build`

Expected: Vite exits with code 0 and creates `apps/site/dist`.

- [ ] **Step 2: Verify desktop rendering**

Open the local site at 1440x1000 with Playwright, capture a screenshot, and evaluate `document.documentElement.scrollWidth <= window.innerWidth`.

Expected: The result is `true`, the next section is visible below the hero, and there are no console errors or overlaps.

- [ ] **Step 3: Verify mobile rendering**

Open the local site at 390x844 with Playwright, capture a screenshot, and run the same overflow evaluation.

Expected: The result is `true`; navigation, buttons, screenshot, and text remain readable.

- [ ] **Step 4: Publish and verify production**

Push the reviewed commit to `main`, wait for the Git-connected Vercel deployment, then run `curl -I https://tickpad.vercel.app`.

Expected: The production deployment is Ready and the public URL returns HTTP 200.
