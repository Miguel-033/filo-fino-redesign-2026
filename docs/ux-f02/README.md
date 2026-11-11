# F02 — mobile menu

Only the mobile menu and its shared interaction handler were changed. Baseline source tree: `d0ec4d78fbb421536b0bef138bec92654d097c5f` (PR head 4909e49 before F02).

## Result

The original `assets/images/afilado.webp` is now a compact photographic introduction above navigation on widths below 768 px. It retains the existing caption, monochrome treatment and brand typography. Its mobile crop shows hands and the knife, with a different corner crop from desktop. The caption has real layout height, so enlarged type expands the photograph region rather than being clipped.

The light sticky menu header keeps the 44×44 close control accessible while the dialog scrolls. Navigation remains separate from the photograph. The service grid adapts to available width and text size; links are at least 48 px high. All ten destinations, their names, href values and source order are unchanged. No disclosure, animation, generated asset or new menu item was added.

The handler now explicitly loops Tab/Shift+Tab between the first and last controls, sets initial focus to Close, and starts each opening at the top. Existing Escape, same-page anchor navigation, return focus, cross-page links and scroll unlocking remain.

Runtime changes: appended menu-only rules inside `(max-width:767px)` in `refinement.css`; menu focus changes in `navigation.js`; homepage cache keys for those two assets. All existing CSS is a byte-identical prefix. All service HTML files, homepage body, shared menu markup, original photo, shipping section/dialog/CSS/JS, hero, cards, other sections, URLs, prices and metadata are unchanged. `seo/verify.py` only refreshes the checksum of the authorized stylesheet; `seo/checks.json` records the updated resource byte count, not SEO settings.

## Browser evidence

- Chrome: all 24 combinations of widths 320/360/390/430/768/1440 and heights 667/700/800/900. See `viewport-matrix.json`. Menu horizontal overflow was zero throughout; all ten links remain present.
- Before/after mobile captures use the same 390×800 CSS viewport, open-menu state and default 100% type. `before-after-390x800.jpg` is a comparison board; individual captures are also retained.
- Desktop 1440×900 before/after capture pixels are identical (mean absolute RGB difference 0). Browser captures fit the 1440 CSS iframe into the 1363 px capture surface; desktop exports are normalized to 1440 px. Mobile captures are 1:1.
- Short screen 320×667: scroll to last WhatsApp link leaves Close visible at top 16 px. Forward/reverse Tab wraps correctly; Escape returns focus to the menu trigger and clears body scroll locking. Reopening starts at scrollTop 0.
- Close button tested; Contacto closes the menu, sets `#visita`, focuses that section and unlocks the page. Catalog and all five service links were actually followed on the full preview; every destination loaded with the menu closed and page unlocked. See `link-results.json`. WhatsApp/Maps hrefs were retained and inspected, without sending messages or calls.
- Text-only 200% emulation in QA at 390×800 and 320×667: font sizes doubled from computed styles; no horizontal overflow. At 390 the photo grows to ~264 px and the services use one column. At 320 it grows to ~329 px; the last link is reachable with the sticky close still visible. This is a text-resize test, not a native OS accessibility or physical-device test.
- Console checked separately; application errors are distinguished from browser-extension metadata errors.

The QA harness loads the real preview inside an iframe, opens its actual menu and can request fresh CSS to avoid stale browser cache. It is a test page, not a second menu implementation. Before images were captured before runtime edits were published.

## Automated gates

`python seo/verify.py`, `node seo/verify-interactions.cjs`, `node seo/verify-services.cjs`, `python design-system/render_components.py --check`, and `node docs/ux-f02/verify.cjs` pass. Node checks use the installed QA jsdom/postcss dependencies via NODE_PATH. The new scope guard requires the original stylesheet prefix, menu-only mobile selectors, unchanged page content and shipping files, and exercises initial focus, scroll reset, Tab boundaries and closing in DOM doubles. These tests do not substitute for the Chrome checks above.

## Limits

Safari, physical touch devices and native browser zoom were not tested. No Lighthouse/CWV claim is made. Owner visual acceptance remains open. No later audit items, production changes, original repository writes, PR merge or indexing changes are included.
