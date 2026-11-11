# FILO FINO — RELEASE QA REPORT

Date: 27 October 2026 (Europe/Madrid)
Scope: Stage A across seven preview pages; Stage B Hostelería hero prototype only; Stage C recommendations, no gallery removal or photographic card replacement.
Repository: Miguel-033/filo-fino-redesign-2026
Branch: codex/ux-hosteleria-reference
UI source commit: f01f5631eb812a1a4381ce3b0bef36ea193ff506 (final QA/source documentation commit is recorded in PR #15).
Preview: https://miguel-033.github.io/filo-fino-redesign-2026/
Hero: https://miguel-033.github.io/filo-fino-redesign-2026/servicios/afilado-cuchillos-hosteleria-valencia/?review=ux20261027
Responsive review: https://miguel-033.github.io/filo-fino-redesign-2026/qa/responsive.html?review=ux20261027
Draft PR: https://github.com/Miguel-033/filo-fino-redesign-2026/pull/15
Production changed? NO. No merge, original-repository write, live-site write, hosting/DNS/workflow/Pages-setting change, robots/sitemap/canonical/schema/GBP change.

P0 blockers: 0 observed in this preview batch.
P1 unresolved: 1 fact confirmation — inherited opening hours lack owner-confirmed source in SERVICE_FACTS; final owner acceptance remains pending. Browser/device/performance exclusions also prevent full acceptance.
P2 decisions: 2 — photographic card restyling and redundant home gallery.

## A) Checks

| Area | Result and exact scope |
|---|---|
| Content/business facts | PASS for service prices, deadlines, exclusions and individual B2B logistics; opening hours UNKNOWN |
| Search intent | PASS static comparative check: home/workshop, catalog/selection, knives/general, Hostelería/B2B; existing routes unchanged |
| Titles/H1/descriptions | PASS registry and HTML checks, one H1 per page; Hostelería wording retained, rendered with emphasis and a smaller contextual line |
| Preview protection | PASS returned HTML and browser DOM: noindex,nofollow, no canonical/active production JSON-LD |
| Internal routes/assets | PASS static graph and HTTP checks; seven HTML pages and six CSS/JS resources 200 and byte-identical to source |
| Media integrity | PASS existing media bytes preserved, hero image loaded at all tested widths, videos retain controls/playsinline/preload=none/no autoplay; full playback NOT_TESTED |
| Shared components | PASS header/footer/menu rendered from templates and --check; one shared native dialog script |
| Navigation/CTA | PASS DOM regressions, desktop native menu/Escape/focus/contact anchor; 390 px iframe keyboard Enter/Tab/Escape, focus return and contact anchor/scroll unlock. WhatsApp, telephone and directions destinations inspected; no message/call initiated |
| Responsive layout | PASS 42 rendered cases: seven pages × 320/375/390/430/768/1440 CSS viewport widths in cloud Chrome on Linux; scrollWidth <= clientWidth, hero image loaded, sticky header, preview noindex. Desktop scrollbars reduce available content width normally |
| Visual | Hostelería screenshot comparison at mobile widths and desktop; home shortcut order/card title checked. This is CSS viewport rendering in desktop Chrome, not real mobile OS/touch emulation |
| Safari/iOS/Android | NOT_TESTED: no actual devices or Safari engine exposed |
| Lighthouse / field CWV | NOT_TESTED / NO DATA; no performance score claimed |
| Production candidate SEO | NOT APPLICABLE; not built/deployed |
| Legacy migration | NOT STARTED this batch; existing migration ledger unchanged |

## B) Defects and remaining decisions

| ID | Severity | Page | Finding / reproduction | Next action | Status |
|---|---|---|---|---|---|
| FACT-HOURS | P1 confirmation | All contact/footer blocks | Existing Mon–Fri 10–14 / 17–20 is inherited from previous preview/recorded GBP observation, not confirmed by attached SERVICE_FACTS | Owner confirms regular hours and weekend policy; no GBP update authorized | OPEN |
| DESIGN-HERO | Acceptance gate | Hostelería | New composition uses real afilado.webp, soft shade, brass emphasis, full-width mobile actions, from €6 and deadline by agreement | Owner approves prototype before applying to four other service heroes | OPEN |
| DESIGN-CARDS | P2 decision | Home | Knife illustration differs from the two real photographs; only title anchoring corrected now | Compare real afilado.webp / tijeras.webp / manicura.webp under one neutral grade and bottom shade, retaining asymmetric grid; show visual comparison before replacing | OPEN, no substitution performed |
| CONTENT-GALLERY | P2 decision | Home #trabajos | Exactly the same three subjects/assets appear in service cards and the gallery; gallery enlarges them but adds no distinct documented case or service-choice information; knife asset is an illustration | Recommend replacing the full gallery with one compact, verified work example linked to its service, or removing this duplicate section after owner confirmation | OPEN, preserved |
| DEVICE-QA | Test limit | All | CSS widths checked in desktop Chrome; native touch, iOS/Safari and Android not tested | Real-device follow-up before full acceptance | NOT_TESTED |
| PERF-QA | Test limit | Home/Hostelería | Local preview daemon unavailable; no Lighthouse or field measurements | Run diagnostics when supported tooling is available | NOT_TESTED |

## C) Facts requiring owner confirmation

Regular opening hours, weekend availability and visit arrangements. No new hours were invented. Existing availability reminders remain. Service prices are confirmed: general knives from €4; Hostelería from €6. Pickup/return costs and terms are individual, not free or universal. There is no fixed B2B turnaround, replacement knives or guaranteed service cycle. Every Hostelería WhatsApp link now prepares a restaurant/professional-kitchen inquiry, including shared footer context.

## D) Evidence

- `ux-browser-results.json`: 42 measured browser cases and native-menu test scope.
- `ux-http-checks.json`: seven returned HTML documents and six CSS/JS resources, status, size and exact source equality.
- Desktop image: `ux-screenshots/hosteleria-desktop.jpg`; full mobile review screenshot: `ux-screenshots/hosteleria-mobile-review.jpg`; responsive screen supports focus=390 for single-width review.
- Preview UI run 40499404493: completed/success for b6786ec886afdc76c2ec9e7585c233ed829b8084; QA run 40499637878: completed/success for 5152c9ff706e4eed5238db6bc0147ae4849ea649. Final QA-only run 40500744176: completed/success for b3c5e61720f06aad6f88d0daf272a1f7d0e2f0aa.
- The first catalog 320px iframe request showed a transient GitHub error page. One reload succeeded; all 42 final measurements and HTTP checks passed. Not treated as a site-code defect or hidden.
- Initial browser cache showed new HTML with old CSS. Changed stylesheet/script URLs now use `?v=ux20261027`; verified fresh styles in browser. Resource validators resolve the URL path without its query string.
- Native menu close-event cleanup is asynchronous; after the event, aria-expanded=false, focus returns and modal-open is removed.
- No WhatsApp messages, phone calls, GBP updates or external client communication performed.

Commands actually run:

```
python design-system/render_components.py
python design-system/render_components.py --check
python seo/verify.py
NODE_PATH=/workspace/scratch/ed3a90d23bd9/qa-deps/node_modules node seo/verify-interactions.cjs
NODE_PATH=/workspace/scratch/ed3a90d23bd9/qa-deps/node_modules node seo/verify-services.cjs
git diff --check
```

These pass. verify-interactions also runs the knife and design-system regressions. Obsolete shortcut-order and menu-loader assumptions were updated to the authorized component behavior; price, media, route and frozen-release assertions remain enforced. Static CSS cascade verification is not described as rendered visual evidence.

Local preview attempt: `sites-preview start .../design-premium-preview` and `sites-preview status` both returned `sites-previewd mailbox is unavailable`. No substitute local server was launched; published authorized preview was used for browser QA.

## E) What changed

- Shared sticky header stays in document flow; fixed size at 72px mobile / 92px desktop, opaque dark backing, scroll-padding for anchors.
- Primary Servicios always targets the directory using page-relative links; the home #servicios section remains and its local link still works.
- Shared static menu exposes Inicio, Servicios, five compact service links, Contacto, route and contextual WhatsApp. Native dialog handles keyboard trapping/Escape; shared code closes on every link and cleans scrolling.
- Home shortcuts reordered in HTML and keyboard order: manicure full-width, then scissors and knives.
- Knife card title has an explicit stable inset; illustration reservation keeps it clear of the title. No changes to the three-card artistic direction yet.
- Existing knife-page B2B content is now an outlined callout with clear heading and descriptive CTA to the original Hostelería route.
- Only Hostelería has the immersive prototype; large H1, real workshop photo, soft gradients, brass emphasis, visible price/deadline and two comfortable stacked actions on mobile.
- Hostelería action context corrected throughout. Service URLs, metadata intents and confirmed facts retained. No new commercial landing pages.
- Preview-only QA screen added with noindex,nofollow; excluded from navigation and production assets. It is not a service page or migration item.

## F) What was not tested

Safari/macOS/iOS, actual Android/Chrome touch, orientation/virtual keyboard, full screen-reader navigation, browser zoom/text-scale combinations, slow-network lab performance, Lighthouse, real-user LCP/INP/CLS, complete audiovisual playback/captions, Google Rich Results Test, production HTTP/SEO or indexing. No claim of final cross-browser or production readiness.

## G) Decision

CONDITIONAL PREVIEW — Stage A and Hostelería prototype are available for review; owner visual approval is required. Do not spread the prototype to the other four service heroes yet. Do not remove #trabajos or replace the card media without the agreed Stage C decision. Production release authorized? NO.
