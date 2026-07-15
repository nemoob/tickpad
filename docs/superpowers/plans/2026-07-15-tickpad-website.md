# Tickpad Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a responsive public product page for Tickpad.

**Architecture:** Add a dependency-free Vite site under `apps/site`, using semantic HTML, focused CSS, and real Tickpad assets. GitHub remains the source for releases and documentation; Vercel serves the generated static `dist` directory.

**Tech Stack:** Vite 7, HTML5, CSS, TypeScript, Playwright, Vercel

## Global Constraints

- Do not add a frontend framework, backend, account system, analytics, blog, or CMS.
- Use real Tickpad application screenshots and the existing application icon.
- Link downloads to GitHub Releases rather than hosting packages on Vercel.
- Support keyboard navigation, reduced motion, desktop, and mobile layouts.

---

### Task 1: Static Site Package

**Files:**
- Create: `apps/site/package.json`
- Create: `apps/site/index.html`
- Create: `apps/site/src/main.ts`
- Create: `apps/site/src/styles.css`
- Create: `apps/site/public/tickpad-app.png`
- Create: `apps/site/public/tickpad-icon.png`

**Interfaces:**
- Consumes: existing pnpm workspace and root Vite dependency.
- Produces: `pnpm --filter @tickpad/site build` and `apps/site/dist`.

- [ ] **Step 1: Add the package scripts**

```json
{
  "name": "@tickpad/site",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 2: Build the semantic page**

Create one page with `header`, `main`, feature sections, release guidance, and `footer`. Use direct links to `https://github.com/nemoob/tickpad`, `/releases/latest`, and the plugin guide in the repository.

- [ ] **Step 3: Add verified product assets**

Copy `test-results/screenshots/tickpad-desktop.png` to `apps/site/public/tickpad-app.png` and `apps/desktop/build/icon.png` to `apps/site/public/tickpad-icon.png`.

- [ ] **Step 4: Verify the build**

Run: `pnpm --filter @tickpad/site build`

Expected: Vite exits with code 0 and writes `apps/site/dist/index.html`.

### Task 2: Responsive Visual Verification

**Files:**
- Modify: `apps/site/src/styles.css`
- Create: `apps/site/site.spec.ts`
- Create: `apps/site/playwright.config.ts`

**Interfaces:**
- Consumes: the static page from Task 1.
- Produces: desktop and mobile browser checks with no horizontal overflow.

- [ ] **Step 1: Add layout assertions**

```ts
import { expect, test } from "@playwright/test"

test("shows product and download action without overflow", async ({ page }) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: "Tickpad", level: 1 })).toBeVisible()
  await expect(page.getByRole("link", { name: /download/i })).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
  expect(overflow).toBe(false)
})
```

- [ ] **Step 2: Run desktop and mobile checks**

Run: `pnpm exec playwright test -c apps/site/playwright.config.ts`

Expected: both Chromium projects pass.

- [ ] **Step 3: Inspect screenshots**

Capture the page at 1440x1000 and 390x844. Confirm the real app is visible, text does not overlap, and controls stay inside the viewport.

### Task 3: Vercel Deployment

**Files:**
- Create: `apps/site/vercel.json`
- Modify: `README.md`

**Interfaces:**
- Consumes: verified `apps/site` production build.
- Produces: public Vercel production URL and repository website link.

- [ ] **Step 1: Add static deployment settings**

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

- [ ] **Step 2: Deploy to production**

Run from `apps/site`: `vercel deploy --prod --yes`

Expected: Vercel returns a production URL.

- [ ] **Step 3: Verify production**

Run: `curl -I <production-url>` and browser checks against the production URL.

Expected: HTTP 200 and the same desktop/mobile assertions pass.

- [ ] **Step 4: Commit and push**

```bash
git add apps/site README.md docs/superpowers
git commit -m "feat: add Tickpad website"
git push origin main
```
