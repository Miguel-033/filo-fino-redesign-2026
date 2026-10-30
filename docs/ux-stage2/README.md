# Filo Fino — Stage 2/5: F03, F05 and card composition

Date: 27 October 2026 (Europe/Madrid). Owner visual acceptance remains pending.

Repository: Miguel-033/filo-fino-redesign-2026. Existing draft PR #15, not merged.
Baseline: 8efb3ab13e13598d4506523b7722ba30205f6605.
Preview: https://miguel-033.github.io/filo-fino-redesign-2026/?stage2=review-final#trabajos
Final preview commit: 73592ea641d55d369d9d089193620cde95a6c85c.
GitHub Pages run 40580938410: completed / success.

## Card composition

A large knife card is followed by a pair at 390/430 px. Below 380 px, deliberately staggered wider cards with different heights avoid cramped narrow columns. Desktop retains a large left card across two rows. Bronze CTA rules and permanent “Ver servicio y precios” remain, with one link per card, visible focus, no disclosure, hint pulse or added entrance animation. Original service URLs and card headings/descriptions retained.

## F03 — real photographic language

All three cards now use real existing Filo Fino media: kitchen knives from the owner archive, a clearer workshop frame of thinning scissors, and the selected nipper photo. The final scissors frame replaces the first iteration's too-abstract blade close-up and is only 27,190 bytes. All share CSS monochrome/contrast treatment, a dark text gradient and deliberate subject positioning. Original photo bytes remain intact; the scissors asset is an exact copy of the repository's existing video poster. No stock or generated service photo and no fabricated before/after claim. Full provenance: media.json.

## F05 — useful shipping section

The duplicate gallery and its now-unused dialog/handlers have been replaced by a five-step postal workflow at the existing #trabajos anchor. No new commercial page or URL. Spanish copy follows the owner's explicit process: contact first; protect each tool and fill voids; advise dispatch with parcel/label photo or sender details; confirm receipt/count; advise readiness/payment; pack and return after payment, with label photo. No carrier, shipping price, guaranteed deadline or internal 3–5-day control appears.

A single bronze contour panorama becomes five coherent vignettes. This is an AI-generated decorative illustration, not a workshop photograph or evidence of a job. On desktop it reads as one connected scene; on mobile it sits beside each step. At tablet size illustrations sit inline with text to reduce the section from approximately 1721 to 1143 px high. Artwork source/prompt and encoding are documented in media.json.

The native dialog has a visible 44px close control, Escape, initial focus, Tab/Shift+Tab boundaries, a keyboard-scrollable text region, and an always-available shipping-specific WhatsApp action. It restores body styles and focus on close. Background contact links/menu/service pages were not redesigned.

## Actual checks and evidence

- Cloud Chrome, CSS viewport widths 320, 360, 390, 430, 768 and 1440: no horizontal overflow; all headings and CTA content fit; all card photographs and shipping artwork load. browser-checks.json and final-layout.json.
- Native Enter opens each of the three actual service destinations; destination H1s and URLs saved in links.json.
- Native Enter/Escape and Tab/Shift+Tab boundaries tested at all six widths; modal fits horizontally, starts on the close button, body scroll locks. Every recorded backward/forward boundary test passed.
- At 390 px, End scrolls the instruction region to its last step (797px scrollTop, 664px viewport, 1461px content). The last return/payment/label text is accessible above the fixed action area.
- Close by mouse verified on desktop and mobile-width frame; keyboard Escape verified. Focus returns to #shipping-open and inline body styles/overflow are restored. A separate native open/close check without screenshot-export interference returned within 2px of the pre-activation page position; see restore.json. Screenshot export and locator auto-scroll can move the browser during capture, so no exact-zero pixel restoration claim is made.
- The two shipping WhatsApp links are identical, contain +34614005053 and a Spain postal-service inquiry. They were inspected without sending a message.
- Nine published HTML/CSS/JS/image resources return HTTP 200 and match local bytes; see http.json. Original card/source image files are unchanged. One 100,212-byte WebP illustration was added. No new font/library/client dependency.
- Scope gate: homepage outside the two authorized sections, the replacement dialog and scoped asset references is byte-identical to baseline. Metadata, one H1, navigation/menu/shared components, service pages, prices/conditions, route registry, production assets and indexability retained.

Commands passed:

```
python design-system/render_components.py --check
python seo/verify.py
NODE_PATH=/workspace/scratch/ed3a90d23bd9/qa-deps/node_modules node seo/verify-interactions.cjs
NODE_PATH=/workspace/scratch/ed3a90d23bd9/qa-deps/node_modules node seo/verify-services.cjs
NODE_PATH=/workspace/scratch/ed3a90d23bd9/qa-deps/node_modules node docs/ux-stage2/verify.cjs
node --check design-premium-preview/shipping.js
git diff --check
```

The legacy Playwright verification script was updated for the new interaction model, but was NOT executed. Browser tests used the cloud browser's native UI API. DOM test doubles are not presented as native-device evidence.

## Screenshots / visual review

Captured before editing and after the visual iterations in this run; accepted captures were inspected. No screenshots were redrawn or composited. Long exports sometimes timed out; viewport captures were used when necessary. Raster dimensions/heights differ and are not a pixel-diff claim. The phone shipping section is shown in start/end scroll states because the full process exceeds one mobile viewport. Some fallback captures retain surrounding browser-page background. Failed/duplicated/partly animated captures are excluded.

- [Cards before, phone](screenshots/before-cards-390.jpg) / [after, phone](screenshots/after-cards-390.jpg)
- [Cards before, desktop](screenshots/before-cards-1440.jpg) / [after, desktop](screenshots/after-cards-1440.jpg)
- [Shipping, desktop](screenshots/shipping-1440.jpg)
- [Shipping, phone start](screenshots/shipping-390-top.jpg) / [end](screenshots/shipping-390-bottom.jpg)
- [Open instruction dialog, phone](screenshots/modal-390.jpg) / [last steps](screenshots/modal-390-bottom.jpg)

Visual verdict: ready for owner review. The knives carry the primary hierarchy; compact cards retain readable 28px headings in the paired phone layout. Nippers and thinning-scissor teeth remain visible rather than disappearing under text. The shipping illustration is distinct from service photography and adds useful process content instead of repeating the cards.

## Limits / remaining decisions

- Safari, real iOS/Android touch hardware, screen-reader speech, no-JS browser mode and Lighthouse/field CWV were not tested. No full accessibility/production-performance certification is claimed.
- The named FILO_FINO_UX_UI_AUDIT_2026-10-27.md still is not available among current attachments/project files; the detailed F03/F05 owner brief is the implementation source. No other audit item was implemented.
- Owner visual acceptance of card composition, photo selection and shipping illustration/copy remains required. No next stage started.
- Production filofino.es and Miguel-033/filo-fino were not modified. No PR merge, DNS/hosting/indexability/robots/sitemap/canonical/GBP changes. Preview remains noindex,nofollow.
