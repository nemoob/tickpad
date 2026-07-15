# Tickpad Carbon Blue Website Redesign

## Goal

Replace the current quiet light website with the selected Carbon Blue direction: a sharper dark developer-tool identity that still presents the real Tickpad application clearly.

## Scope

- Restyle the existing single-page website without changing its content model, links, deployment, or dependencies.
- Keep the real Tickpad screenshot and icon as the primary product visuals.
- Preserve the current responsive layout, accessibility, GitHub Release download flow, and Vercel deployment.

## Visual System

- Base background: near-black carbon (`#0b0d11`).
- Secondary surface: restrained charcoal (`#11141a`).
- Primary text: cool white (`#f5f7fa`).
- Secondary text: neutral gray (`#a8afb9`).
- Interaction accent: electric blue (`#3274ff`) used only for actions, focus, section indices, and small technical labels.
- Structure: thin neutral dividers, coordinate-style labels, compact monospace metadata, and deliberate alignment lines instead of decorative gradients or floating shapes.

## Hero

- Keep `Tickpad` as the H1 and first-viewport brand signal.
- Use a shorter developer-oriented supporting line while retaining the Chinese product explanation.
- Place the unmodified application screenshot prominently below the copy inside a dark browser-like frame.
- Add concise metadata such as `LOCAL-FIRST`, `PLUGIN-READY`, and the current preview version.
- Keep the next section visible at the bottom of desktop and mobile viewports.

## Sections

- Feature items remain a six-cell grid separated by thin borders, with blue numeric indices and no floating cards.
- The plugin section uses a charcoal code surface and a stronger command-line treatment.
- The download section uses the darkest surface with one high-emphasis blue action.
- The footer stays compact and uses the same navigation hierarchy as the header.

## Responsive Behavior

- Desktop retains the three-column feature grid and split plugin layout.
- Tablet reduces the feature grid to two columns.
- Mobile uses one column, keeps actions full width, crops the screenshot to an inspectable area, and never introduces horizontal scrolling.

## Verification

- Build the site with `pnpm --filter @tickpad/site build`.
- Check 1440x1000 and 390x844 viewports with Playwright.
- Confirm no clipping, overlap, console errors, or horizontal overflow.
- Deploy through the existing Git-connected Vercel project and verify `https://tickpad.vercel.app` returns HTTP 200.
