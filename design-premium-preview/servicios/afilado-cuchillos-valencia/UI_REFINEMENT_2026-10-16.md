# Knife service — mobile UX refinement, 16 October 2026

Scope: only the knife page. Homepage HTML, shared CSS/JS, photos, fonts, routes,
metadata registry, production metadata and migration ledger are unchanged.

- Keep breadcrumbs and remove the redundant workshop eyebrow. Reduce mobile
  header/hero spacing and heading display size without changing the H1 text.
- Place the existing authorized workshop photo directly after the hero heading.
  Use a compact 140–220 px mobile crop, not a second large photo section.
- Keep WhatsApp and Maps in a two-column mobile action row, including 320 px.
  Text may wrap inside each button when required; never truncate the label.
- Make all three jump links full-width, explicit tap targets with label and SVG
  on the same flex row. They remain real anchor links, not fake accordions.
- Delete the decorative detail section, duplicate workshop image, graphic
  studies, carousel/dialog and gallery-only JavaScript. Remove the redundant
  edge cross-section diagram. Useful review, geometry, method, Japanese knife,
  safe transport and FAQ text remains in the existing semantic HTML sections.
- Reuse the homepage's address-study presentation as a clickable Google Maps
  link within contacts. Preserve the address, hours, telephone and WhatsApp.

Checks: central SEO verifier, CSS parser, page DOM/menu/FAQ/WhatsApp and shared
interaction regression tests. Tests assert the new hero/navigation/map contracts.
The verifier pins the reviewed knife CSS/JS hashes while preserving the original
shared/home/media baselines. Metadata/H1/useful paragraphs and non-gallery links
were compared with the SEO PR baseline; homepage HTML is byte-identical.

Rendering limitation: local Chromium fails before opening a page. No visual
mobile/Safari, native focus/scroll, screenshot or Lighthouse pass is claimed.
CSS/DOM checks are not rendered-layout checks. Production remains untouched.
