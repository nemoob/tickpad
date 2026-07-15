# Tickpad Website Design

## Goal

Create a public product page for Tickpad that helps a new visitor understand the app, inspect the real interface, download the current macOS release, and find the source code and plugin documentation.

## Scope

- One responsive landing page deployed on Vercel.
- Real Tickpad application screenshots and the existing app icon.
- Product overview for editing, file management, Mermaid, themes, export, and plugins.
- Primary download link to the latest GitHub Release.
- Links to GitHub, plugin development documentation, and release notes.
- Clear preview and unsigned macOS build notices.

The first version has no backend, account system, analytics, blog, CMS, or duplicated package hosting.

## Architecture

The site lives in `apps/site` as a standalone Vite package in the existing pnpm workspace. It uses semantic HTML, CSS, and minimal TypeScript instead of adding a frontend framework or runtime dependency. Vercel builds the package into static files and serves them globally.

GitHub remains the source of truth for code, documentation, issues, releases, and downloadable assets. The website only links to those resources.

## Page Structure

1. Compact navigation with the Tickpad mark, GitHub link, and download action.
2. Product-first hero with a literal Tickpad heading, concise description, download action, and a real application screenshot.
3. Focused feature grid covering WYSIWYG Markdown, workspace files, Mermaid, themes, exports, and plugin extensibility.
4. Plugin section explaining the public API and linking to the development guide.
5. Release section with macOS Apple Silicon requirements and unsigned-build guidance.
6. Minimal footer with repository, documentation, license, and release links.

## Visual Direction

- Quiet desktop-tool aesthetic consistent with the Tickpad application.
- Neutral light background, dark text, blue interaction accent, and restrained borders.
- No decorative gradients, floating color blobs, marketing cards inside cards, or oversized empty hero space.
- Real interface imagery is the main visual signal in the first viewport.
- Responsive layout must preserve readable text and an inspectable product screenshot on desktop and mobile.

## Accessibility And Behavior

- Semantic landmarks and heading order.
- Visible keyboard focus states and sufficient contrast.
- Links remain usable without JavaScript.
- Screenshot has descriptive alternative text.
- Reduced-motion preferences disable nonessential transitions.

## Deployment

- Vercel project root: `apps/site`.
- Build command: `pnpm build`.
- Output directory: `dist`.
- Production deployment is linked to the GitHub repository so future `main` updates can deploy automatically.
- The first deployment uses the default Vercel domain; a custom domain can be attached later.

## Verification

- `pnpm --filter @tickpad/site build` succeeds.
- No broken local or external links in the rendered page.
- Desktop and mobile screenshots show no clipping, overlap, or horizontal overflow.
- The download action reaches the latest GitHub Release.
- The deployed production URL returns the same verified page.
