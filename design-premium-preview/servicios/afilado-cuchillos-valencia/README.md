# Afilado de cuchillos — premium service page

15 October 2026. One new service page in the existing La línea del filo visual system. Source base: PR8 `179a24edc3b3958c9eb44612f22db7466c3700c8`. Its local equivalent has the same tree, `6dd3db5791fcb2c4013249102a8bd30a2f9ad86f`. Current test publishing base: `5ccde2ddd0272f5b508e88a15e1204efc8d2ac82`.

## Page and visual decisions

The intended existing production route remains `/servicios/afilado-cuchillos-valencia/`. No parallel keyword landing pages, invented localities or new Japanese-knife service URLs were created. Homepage links to knives now lead to this one developed page. Other undeveloped services retain their existing destinations.

Shared fonts, palette, buttons, header, navigation dialog and footer come from the premium homepage. The page has a different composition: specific service heading with a large workshop image; light catalogue of three blade types; inspection and decision sequence with an original edge diagram; a Japanese-knife panel; a photo with two graphic studies; safe-transport guidance; seven native FAQ disclosures; route/WhatsApp/contact block. This is HTML implementation, not a static mockup.

All substantive copy is accessible HTML. Plain Spanish, first-person master voice, no keyword lists or repeated near-me variants. Price and completion time are explained as subject to inspection. No new guarantees, reviews, certificates, precise blade angles, steel hardness claims, shipping conditions or acceptance of all knife models.

## Search intent and current Google guidance

Research performed before implementation, 15 October 2026. Sample searches: `afilado cuchillos Valencia servicio taller afilador cerca de mi` and `afilado cuchillos Valencia taller servicio`. These samples indicate mixed local-service and equipment intent; they are not a Valencia-geolocated SERP study, keyword-volume dataset or GSC performance analysis. This page targets the local service task. Product-buying phrases and electric sharpener comparisons are excluded. Address, service explanation, inspection and a route are more useful than inserting “cerca de mí” verbatim.

Google Search Central sources read:

- [Helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content): answer the actual visitor's service questions; no target word count or search-engine-first padding.
- [Title links](https://developers.google.com/search/docs/appearance/title-link): a concise, distinct Spanish title aligned with the main heading; no keyword repetition. No fixed character count guarantees display.
- [Crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable): genuine href links with meaningful text; the homepage links to the service in one action.
- [Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls): keep a single future production route and consistent signals; this preview does not publish a production canonical.
- [Noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing): test HTML uses `noindex, nofollow`; not a robots.txt-only blocking scheme.
- [Structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies), [LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business) and [supported feature gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery): truthful, matching data; no invented review stars or offers. Service is semantic Schema.org data, not a promised Google rich-result feature. FAQ is useful visible content, with no promise of FAQ rich results.

No claims about rankings, demand volumes, TOP3 or cannibalization performance are made. No production SEO data, sitemap, analytics or GSC settings were modified.

## Preview versus future production

The HTML intentionally has no canonical, production og:url or active production JSON-LD. `production-seo.json` is an inert reviewed handoff, not imported by the page. It prepares the existing production canonical, title/description and a WebPage/Service/LocalBusiness/BreadcrumbList graph. It has no price, review, unsupported opening hours or shipping offers. JSON syntax, entity references and alignment with visible copy are tested; Google Rich Results Test/Schema.org Validator were not run in a real browser.

Before any separately authorized production deployment: confirm hours and accepted knife types; reconcile the proposed business entity ID with the site's final shared graph; inject the production canonical and JSON-LD; replace preview noindex; verify redirects/canonical/sitemap, existing internal links and rendered markup. Do not create a second indexable commercial page with synonymous copy. Broad homepage service summaries remain navigation; this page provides knife-specific details. The existing professional/restaurant page, if retained, should focus on that distinct need rather than duplicate this page wholesale.

## Verified facts and remaining confirmations

Address, phone and Maps link checked against the live site and [live site-config.js](https://filofino.es/js/site-config.js): Calle Maestro Guerrero, 4, Valencia; +34 614 00 50 53; `https://maps.app.goo.gl/Z4WQeCUKKeDbx8Qt7`.

Visible schedule in that config: Monday–Friday 10:00–14:00 and 17:00–20:00; Saturday by appointment; Sunday closed. It matches the premium homepage. Historical static homepage JSON-LD instead says Monday–Friday 10:00–17:30. This discrepancy requires owner confirmation before production; it was not silently normalized in production. The new preview uses the current customer-facing schedule, and future JSON-LD omits hours until reconciled. The owner's latest instruction confirms walk-in visits during normal hours.

Live knife-page metadata/copy disagree on price and timing (including 15 minutes versus one working day); these values and guarantees were intentionally not copied. The owner explicitly permits a consultation about manual Japanese waterstone sharpening; the page does not invent specific techniques or acceptance of ceramic, serrated or single-bevel models. Exact accepted models and types require the owner's confirmation. Where uncertain, the FAQ asks for photos/model rather than asserting acceptance.

## Media and temporary slots

Only the already approved PR4 `assets/images/afilado.webp` is used as photography, byte-identical to the premium homepage. It depicts work on a blade, not a verified finished-result photograph. No damaged/rusty knife is presented as an exemplary result. No random Drive photos, third-party photos, generated work photos or video were added.

The gallery has one real workshop image and two clearly labelled graphic studies. The graphic-study figures in `.knife-gallery-studies` are designed as replacement slots for owner-selected photographs. Replace only after provenance, tool condition and before/after context are checked. Update markup and `images` in knives.js together. No technical “temporary media” notices appear in the customer presentation, and drawings are not described as actual finished work. Original blade silhouettes, a schematic edge cross-section and a waterstone drawing are illustrative, not a universal sharpening method or angle.

## Interaction, accessibility and verification

Native links work without JavaScript; gallery anchors open the actual photo/SVG files. FAQs use details/summary. Native dialogs enhance the gallery and menu where supported. Gallery supports previous/next, wrap, zoom, keyboard arrows and swipe. Native Escape/focus behavior requires actual browser verification. Reduced motion disables script animations; CSS provides the same preference. No continuous scroll handler, hidden-until-JS content, video, framework, CDN dependency or third-party requests.

Layout CSS includes 320px, mobile, tablet and desktop breakpoints, flexible columns and 44–52px interactions. Core content is identical across viewports. Local DOM/resource/CSS/metadata and interaction-state checks are recorded with the PR. Current environment's Chromium fails before rendering (SIGTRAP); the cloud browser previously hung for an extended period, so it is not retried. Consequently visual rendering, actual viewport overflow, native gestures/focus and iPhone Safari are not claimed to have passed. Static CSS review is not a substitute for Safari, a rendered accessibility audit or measured Core Web Vitals.

## Publishing and rollback

The owner explicitly authorizes publishing only to the existing test gh-pages-preview. Export this folder at `servicios/afilado-cuchillos-valencia/`; shared assets remain at the preview root. Adapt the homepage knife href to this relative route; leave other not-yet-built services linked to production. Keep noindex, .nojekyll, font licences and media provenance. Do not change CNAME, DNS, domain, workflows, Pages settings, main or the original repository. Source Draft PR stays unmerged. Rollback uses a new revert commit of only the test publication.
