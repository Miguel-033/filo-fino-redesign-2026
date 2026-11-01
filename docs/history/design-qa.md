# Shipping reference implementation QA — 2026-10-28

Source visual truth: `/workspace/scratch/ed3a90d23bd9/generated_images/exec-72802c28-1e68-48ab-a8c1-4537054d6d6d.png` (first presented/selected option, central 03 Envía; 1774×887 px board).

Implementation evidence: `docs/ux-shipping-approved/shipping-390.jpg` and `docs/ux-shipping-approved/shipping-1440.jpg`. Browser: cloud Chrome. State: section visible, modal closed, original illustrations loaded. Actual CSS iframe widths: 390 and 1440. Source crops: mobile 403×796 → 390×770, desktop 1249×725 → 1440×836. Mobile screenshot is 390×886 at 1:1. Desktop screenshot was captured from a 1440 CSS px iframe fitted to the 1363 px browser capture surface (scale 1363/1440), cropped to the component and density-normalized to 1440×823. No content was reconstructed in the screenshots.

Full-view comparisons opened together (source left, render right): `/workspace/scratch/ed3a90d23bd9/shipping-mobile-comparison-final.jpg` and `shipping-desktop-comparison-final.jpg`. Focused CTA comparison: `shipping-cta-comparison.jpg`. These comparison artifacts are temporary analysis; final browser screenshots are retained in this repository.

## Findings and comparison history

1. First browser capture: P2 headline wrapped to four lines because the QA iframe acquired a desktop scrollbar, reducing its content width to 375 px. Fixed capture harness to preserve the declared CSS width and added the reference's explicit mobile/desktop heading breaks. Final 390 px capture has the intended three-line title.
2. P2 desktop arrowheads were missing when their marker definition lived inside a hidden mobile SVG. Gave the desktop process diagram its own marker definition; final desktop capture has visible arrowheads.
3. P2 mobile connector crossed the first row captions. Moved it below the captions, retained the curved route and lowered the final connector between Afilamos and Recibe. Final comparison shows clear caption areas.
4. P2 equal desktop columns compressed the reference's asymmetric spacing. Matched track proportions to the reference (282/298/309/272/158 px at 1440) and adjusted original-scene crops/scales. Kept the last desktop caption on one line within the section's right gutter. Final desktop capture has the intended five-scene horizontal composition.

## Required fidelity surfaces

- **Typography:** existing Barlow display and Manrope body retained, actual fonts rendered in Chrome. Mobile title 36/38.16 px; stage headings 24/26; short captions 14/20. Desktop title 76/79.04, stages 30/34, captions 16/24. No truncation. The generated reference is not an authoritative new font asset; existing brand fonts take precedence.
- **Spacing/layout:** mobile retains 2–1–2, centered larger Envía scene, and bottom full-width instruction button. Desktop retains measured asymmetric horizontal positions and left instruction button. Mobile is about 116 px taller than the normalized generated mock: original artwork aspect ratios and readable short text are retained; Recibe's caption wraps naturally. This follows the user's explicit permission to adapt mobile layout without shrinking type. No extra UI or section was introduced.
- **Colors/tokens:** original graphite, paper and bronze tokens retained. Existing bronze source linework is less bright than the generated reference; it was intentionally preserved rather than redrawn/recolored or regenerated. The instruction button uses the existing bronze token, dark text and clipped corner. No new decorative effects/animation.
- **Image quality:** all five actual original scenes reuse the unchanged 2048×683 WebP, with precise CSS viewports and preserved aspect ratios. Recognizable phone/contact, protected instruments/box, handoff parcel, craftsperson and returned parcel. Functional SVG route connectors are diagram geometry, not replacements for the five illustration assets.
- **Copy:** exact five approved headings and short captions; instruction CTA unchanged. Existing modal detail and WhatsApp URL remain unchanged. No new prices, timing, carriers or service promises.

## Browser and functional checks

Rendered widths 320, 360, 390, 430, 768 and 1440: document scrollWidth equals clientWidth after styles/fonts loaded; captions remain 14 px on mobile. The QA component harness uses actual production component markup/CSS from the preview, not a duplicate mock implementation. Full homepage integration checked separately in Chrome.

Native dialog: opens; initial close-button focus; Shift+Tab wraps to WhatsApp; Tab wraps back; Escape closes and returns focus. Close button also tested on the full homepage; body inline styles clear and scrolling returns after the close event, at the position saved following the browser's automatic CTA scroll into view. No WhatsApp message sent. Console checked: no page application error; extension metadata-transport errors are external to the site.

Scope guard, SEO verification, interaction DOM tests, all seven service pages and shared component source check passed. Modal HTML/CSS/JS and original illustration bytes remain unchanged. Preview noindex remains. No production, original repository, URL, service facts or other sections changed. No PR merge.

## Residual gaps / owner review

Safari, physical-device touch, Lighthouse and field CWV were not run. Desktop screenshot density normalization is documented above. Browser viewport captures timed out for non-default clip/full-page modes; default viewport captures were used and cropped/density-normalized. Final owner visual acceptance remains outstanding; this QA result does not imply owner approval.

## Implementation checklist

- [x] Approved composition and original illustrations
- [x] Responsive readable copy and route connectors
- [x] Instruction CTA and original modal retained
- [x] Narrow scope/SEO regression gates
- [x] Chrome captures and reference comparisons
- [ ] Owner visual acceptance

final result: passed
