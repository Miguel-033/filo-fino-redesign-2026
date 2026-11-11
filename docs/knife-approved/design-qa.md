# Design QA — selected knife Hero

final result: passed

This is implementation QA, not owner acceptance. Only the knife Hero is in scope.

Source: first column (308×1024 pixels) of the owner's attached five-column reference; normalized to 390×1297 for comparison. Supplied clean knife JPEG used intact. Implementation: Chrome iframe viewport 390×1400, scaled to fit cloud canvas then normalized to CSS pixels; this is not a native-density phone capture. Desktop viewport 1440×1000 is an adaptation, with no independent approved desktop reference.

Evidence: comparison-390.jpg, comparison-details.jpg, screenshots/knife-390.jpg, screenshots/knife-1440.jpg. Source and implementation opened together in one composite; the detail composite separately checks facts, icons, buttons, address and readable type.

Iteration 1: price knife icon too small/thin; description and button labels smaller than the reference. Result blocked. Fixed: readable 18 px mobile description, 16 px actions (14 px at 320), 64 px action targets; closer photographic scale and flow; existing knife SVG resized to a recognizable broad blade. No source-image modification.

Iteration 2: re-captured 390 and 1440 after icon revision. Compared both composites. No outstanding P0/P1/P2 issues. Header remains unchanged by user scope, explaining some vertical differences. Body headline starts approximately 497 px, WhatsApp 956 px on 390; no extra fixed-height gap before actions. Mobile image ends through a soft fade, with heading over the dark lower photographic zone; left-aligned text does not cover the knife cutting edge. Headline is three readable lines; gold accent, line dividers, rectangular actions, hierarchy and original links preserved.

Typography: existing licensed local Barlow Condensed 600 / Manrope. Spacing: source order and rhythm reproduced, adapted to the unchanged header. Colors: near-black photographic background, warm brass title and CTA, pale text. Image: clean owner JPEG, sharp enough at checked sizes, no generated replacement or retouching. Content: copy from approved reference, from €4/knife, from 15 minutes plus visible factual conditions. No invented delivery/guarantee claims. Icons: outlines, no emoji. Behavior: genuine anchor links; keyboard Tab/Shift+Tab and visible 3 px outline observed in Chrome.

Six widths checked: 320, 360, 390, 430, 768, 1440. scrollWidth equals clientWidth for each. Image loads; one H1; noindex,nofollow. Other runtime files and page content outside Hero verified byte-identical. HTML/resource/facts/shared-component regression gates pass.

Remaining P3/differences: unchanged shared header has a smaller logo and height than the drawn reference; exact image crop differs because supplied standalone image and reference collage differ; existing icon geometry and browser font rendering are not pixel-identical; factual condition note adds a line group under address. No desktop fidelity percentage claimed. Safari/physical iPhone and Lighthouse/CWV not tested. Owner visual approval pending.
