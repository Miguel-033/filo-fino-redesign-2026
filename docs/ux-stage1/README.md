# FILO FINO — RELEASE QA REPORT: Stage 1/5, F01 + F04

Date: 27 October 2026, Europe/Madrid.
Repository: `Miguel-033/filo-fino-redesign-2026`.
Branch / PR: `codex/ux-hosteleria-reference`, draft PR #15 (not merged).
Baseline source: `5a6089fafc3a5f464bf24fbb2011b950eb8f094c`.
Final preview: `f28c33ec5b39b21150410a8f9baba9814841142c`; Pages run 40564605547 completed successfully.
Environment: https://miguel-033.github.io/filo-fino-redesign-2026/?stage1=final#servicios
Production changed? **NO**. No writes to Miguel-033/filo-fino, filofino.es, DNS, hosting settings, workflows, GBP, robots, sitemap, canonical or schema. Preview noindex,nofollow retained.

P0 defects observed: 0. P1 defects observed in this bounded card batch: 0. F03 remains intentionally open for the next agreed stage. Device/capture/source limitations below prevent any claim of exhaustive QA or owner approval.

## Sources and scope

The named `FILO_FINO_UX_UI_AUDIT_2026-10-27.md` was not among current attachments and was not in the current repository tree. F01 and F04 were implemented from the owner's explicit detailed request. The complete audit was not silently substituted with an older SEO audit or claimed to have been read.

Applied project AGENTS, SEO_ARCHITECTURE_2026, DESIGN_SYSTEM_2026, frontend-design and ui-ux-pro-max, and Product Design's screenshot-first audit/visual-review workflow. The owner's Stage 1 instructions supersede the old mobile two-column/hand-hint requirements in the design-system document.

## A) Checks

| Check | Result / scope |
|---|---|
| Responsive layout | PASS rendered CSS viewports 320, 360, 390, 430, 768 and 1440 px, frame height 1400 px in desktop Chrome. No document horizontal overflow; no clipped H3. Desktop scrollbars normally reduce available content width |
| F01 mobile | PASS: all three links have equal full available width, one column below 768 px, aligned content padding and one responsive title scale |
| Desktop | PASS: large knife card spans the two right-hand rows at 768 and 1440 px |
| F04 | PASS: exactly one anchor per card; no nested action/disclosure, plus-toggle, hand or pulse ring. Permanent “Ver servicio y precios” row and existing arrow symbol |
| Navigation | Three original service routes verified through native Enter on final preview. Pointer transitions also succeeded in individual tests; cloud pointer automation had intermittent misses during loading/scrolling, so it is not a native touch-device test |
| Focus | Native Tab moves from knife card to scissors; :focus-visible true, brass 3px outline, no nested tab stops. Enter opens the intended service |
| Touch | Permanent affordance visible without hover, large card target and touch-action:manipulation checked; actual touchscreen, iOS and Android NOT_TESTED |
| Other blocks | PASS scope gate: homepage outside #servicios byte-identical, apart from its own stylesheet reference and card-script cache key. Headers/menu/footer and all service pages preserved |
| Media | PASS: all three img tags and source assets preserved; images loaded in browser. No invented/replacement image, crop file or new font |
| SEO/facts | PASS registry, title/H1/description, noindex, original service URLs, frozen production artifacts; prices/conditions unmodified |
| HTTP | PASS returned home, card stylesheet and home script: 200 and byte-identical to local source (`http.json`) |
| Safari / actual mobile OS | NOT_TESTED, unavailable |
| Lighthouse / field CWV | NOT_TESTED, not claimed for this bounded UI batch |

## B) Captured steps and visual review

1. **Before, selecting a service — poor on phones.** Knife card is large, while scissors/manicure are 126.5 px wide at a 320 px CSS viewport. Different title scales, awkward wrapping and disclosure strips split the reading path. The simultaneous linked image, plus toggle, consult links and pulsing hand give competing actions. See `screenshots/before-*.jpg`.
2. **After, choosing a service — ready for owner visual review.** Three full-width integrated-image cards provide room for readable titles and a stable CTA. At 320 px the long manicure heading wraps in complete words without clipping. At 390/430 px the shorter headings fit naturally, with the same padding and CTA baseline rhythm. The image stays behind the text with a controlled dark overlay rather than becoming a separate top image and bottom text template.
3. **After, desktop and tablet — coherent asymmetry.** Knife illustration occupies the upper area; its description, title and CTA share an intentional inset below. Two smaller cards retain their own image/text composition on the right. At 768 px the manicure heading fits on three lines and leaves room for the CTA. At 1440 px the larger knife title remains the dominant element.
4. **Following the service — working.** Keyboard navigation and the three destinations verified. The only card-specific replay animation was removed after an early pointer attempt missed a moving target. Other section animations and all gallery/menu behavior remain unchanged.

Images were captured before editing the site and after the layout change, inspected, and saved. The initial partly animated captures were rejected and replaced by settled frames. Visual screenshots show the final CSS composition; the later r2 change only removed card entrance motion and refreshed its script cache key. The final script URL was verified in the live browser.

[Open the self-contained before/after comparison](comparison.html). It displays the actual saved JPEGs in aligned CSS-viewport coordinates; no screenshot content is redrawn or invented. Original JPEGs remain in screenshots/.

Capture limitation: long after-captures at 1440 px repeatedly timed out. A complete browser view was saved at a lower raster resolution (`after-1440-viewport.jpg`); the comparison displays it at the same CSS scale and labels the limitation. Full paired captures are available at 320/360/390/430/768. Do not describe the 1440 raster exports as identical file dimensions.

## C) What changed

Only three runtime source files:

- `design-premium-preview/index.html`: card markup reduced to one named anchor, original image, description/title, permanent CTA. Other section HTML untouched.
- `design-premium-preview/service-cards.css`: selectors scoped to #servicios, mobile one-column grid, desktop asymmetry, title/spacing/gradient/focus/pressed states. No global styles or hero overrides.
- `design-premium-preview/premium.js`: removed hand observer, disclosure handler and card entry replay. Gallery/menu/process/hero code retained.

Tests updated only where obsolete hands/disclosures/grid assumptions conflicted with the owner's new model. Added `verify-scope.cjs` to enforce the boundary. No new framework or runtime dependency. QA harness is a noindex document outside the normal navigation; it renders the real preview at exact widths and is not a commercial landing page.

## D) Evidence and commands

- `before-metrics.json`, `after-metrics.json`: measured dimensions, headings and destinations.
- `links.json`: actual final Enter navigation results for all three cards.
- `http.json`: status, bytes and exact source equality.
- `screenshots/`: accepted original captures; `comparison.html`: aligned comparison.
- `cards-review.html`: source for preview-only `qa/cards-stage1.html` capture harness.

Commands run successfully:

```
python design-system/render_components.py --check
python seo/verify.py
NODE_PATH=/workspace/scratch/ed3a90d23bd9/qa-deps/node_modules node docs/ux-stage1/verify-scope.cjs
NODE_PATH=/workspace/scratch/ed3a90d23bd9/qa-deps/node_modules node seo/verify-interactions.cjs
NODE_PATH=/workspace/scratch/ed3a90d23bd9/qa-deps/node_modules node seo/verify-services.cjs
git diff --check
```

These are source/DOM checks, not substitutes for browser rendering. Cloud Chrome used for actual layout, keyboard and route checks. QA dependencies jsdom/postcss were installed outside the website checkout; no client dependencies were added.

## E) Remaining questions / decision

- Owner visual acceptance of Stage 1 remains pending. **Do not start Stage 2/F03 or any other audit item.**
- F03 image-language difference intentionally remains: knife illustration, scissors/manicure photos. The same image slot can accept approved photographs later without rebuilding the grid.
- Full audit file still needs to be supplied for future stages if it adds information beyond the explicit brief.
- Safari, real touch devices and the 1440 long-export limitation remain honestly unverified/partial.

Decision: **CONDITIONAL PREVIEW — F01/F04 implemented and available for review.** No production authorization, merge or indexability change.
