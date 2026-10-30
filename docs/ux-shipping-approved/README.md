# Approved shipping composition

User-selected reference: first visual option with central 03 Envía, mobile 2–1–2 and corresponding desktop horizontal scene.

Runtime scope: only `#trabajos` in `design-premium-preview/index.html`, its stylesheet cache key and shipping section rules in `shipping.css`. The original five illustrations remain in the same unchanged `envios.webp`; CSS selects each scene without stretching it. Connector paths express the process flow. No extra imagery, animation, section, route or service claim was added. The separate WhatsApp action absent from the selected mock was removed from the section; its existing modal contact remains.

The modal HTML, all modal CSS rules, `shipping.js`, other homepage sections and frozen production materials are unchanged. Preview noindex/nofollow remains. PR #15 stays unmerged.

## Verification

- `python docs/ux-shipping-approved/verify.py`: byte-equivalence outside shipping, original media, modal styles and JavaScript, noindex.
- `python seo/verify.py`: registry, resources, preview metadata, frozen release artifacts.
- `node seo/verify-interactions.cjs`: existing interactions and shipping dialog test doubles.
- `node seo/verify-services.cjs`: seven unchanged service pages/facts/resources.
- `python design-system/render_components.py --check`: shared components unchanged.
- Chrome rendered component widths 320, 360, 390, 430, 768, 1440; no horizontal overflow. These are desktop Chrome CSS viewports, not physical-device tests.
- Native Chrome modal opening, Escape, close button, forward/reverse Tab boundary, returned focus, body scrolling restored; full-page integration also checked. WhatsApp href inspected without sending a message.
- No application console errors observed; the browser extension reports metadata transport errors, unrelated to the page.
- Safari, physical touch devices, Lighthouse/CWV not tested.

`review.html` is a QA-only capture harness. The deployed copy at `qa/shipping-approved.html` extracts the actual component, its original modal and the live styles rather than maintaining a duplicate design. Internal iframe width is the named CSS viewport. The desktop canvas is scaled to fit the capture surface; the exported screenshot is normalized back to 1440 px. Mobile is captured at 1:1. The mobile section can grow to preserve 14 px captions and source illustration proportions; at 390 it is about 886 px high, above the approximately 770 px generated reference.

Final screenshots: `shipping-390.jpg` and `shipping-1440.jpg`. Owner visual acceptance is still required.
