# Filo Fino — development preview, 27 October 2026

Source branch: `codex/service-pages-facts-2026`.
Source commit: `3d2811db01c37d1d3879e75a83d39dc994248332`.
Source tree: `6d065ec67f15a9c70804ed72af1cc7857a980bc9` (identical to local reviewed commit 6f78e09).
Publishing parent: `2da4723ba99974bb3de7d09b2999a4a2f93b09cc`.
Owner authorized updates to this redesign repository and its preview on 27 October 2026.

Seven pages: workshop home, service directory and five existing service routes (knives, hair scissors, manicure/pedicure instruments, clipper blocks, hospitality).
Confirmed SERVICE_FACTS pricing, conditional deadlines, acceptance/exclusions and hospitality logistics are reflected in static Spanish HTML. Existing photographic design and common components retained. All service links resolve inside this project base. Legacy blog/legal remain explicit links to filofino.es.

Real repository photos/videos are copied byte-for-byte; video uses controls, playsinline, preload=none and no autoplay. Provenance: assets/service-media.json. Existing font licenses and photo archive retained.

All seven preview pages remain noindex,nofollow with no canonical, og:url or active production JSON-LD. No CNAME, production sitemap/robots, analytics, new workflow or production deployment. Original Miguel-033/filo-fino is outside the work scope.

Source validation: HTML/metadata/facts/route graph/assets/component/DOM menu-gallery-process regression checks pass. Real device Safari and Lighthouse/CWV are not certified by these tests. Source post-page checklist is in docs/development on the source branch.

Rollback: create a new revert commit of this preview update; retain publishing history.

---

Historical notes below describe earlier versions and are superseded by this update.

## SEO architecture update — 15 October 2026

Source `8440792040128df7cea547f6bc59057f95e5db91`, Draft PR10. Updated safe metadata on home and knife service, visible home H1 context with preserved brand display, contextual blog/article links, async below-fold decoding and seo.css. All photography, existing core CSS/JS, routes and interactions are retained. Source specification, route registry and checks remain in the source PR, not this static export.

Both pages remain noindex, nofollow. No canonical, production JSON-LD, production sitemap or robots template is exported. No CNAME/DNS/Pages settings/workflows/main/production changes. Static checks and DOM-state regression tests passed; rendered mobile/Safari, Lighthouse/CWV and Google Rich Results remain unverified. Publication HTTP/hash results are recorded in PR10.

## Knife service page — 15 October 2026

Source `61425d8c3996caf531085ed203ac0ffe1d8ebba4`, Draft PR9. New route `servicios/afilado-cuchillos-valencia/`; all homepage knife service links lead here. Other undeveloped services retain existing production destinations.

Only index.html, knives.css and knives.js are exported for the service page, using existing shared assets. No production-seo.json, canonical or production JSON-LD is published. Both preview pages remain noindex, nofollow. Shared homepage style and its other interactions are unchanged. No DNS/CNAME/Pages settings/workflows/main/production changes.

Local DOM/resource/CSS/metadata and interaction-state checks PASS. Actual Chromium cannot start and iPhone Safari is unverified. HTTP deployment checks are recorded in PR9. Old publication details below refer to the prior homepage update.

# Filo Fino — La línea del filo, test preview

Updated 15 October 2026 with explicit owner authorization for the existing test Pages only.

Source: `179a24edc3b3958c9eb44612f22db7466c3700c8`, branch `codex/premium-owner-corrections`, Draft PR #8. Publishing parent: `d1d7f8b35f08592eafe21a390a92f497bdb0454f`.

Only static prototype HTML, CSS, JS and required SVG/PR4 photos updated. Existing noindex and .nojekyll retained. Service and legal URLs point to their existing filofino.es destinations; this does not modify production. No CNAME, settings, workflows, analytics or video added.

Photos and graphic provenance: assets/SOURCES.md. Knife-study.svg is an owner-selection slot, not a photographic after result. Existing assets/images/drive and media-manifest.json remain an inactive archive of PR6; no client element references them.

Local checks: CSS/JS/resources/links and interaction state tests passed. Local Chromium cannot start (SIGTRAP); do not claim local mobile/render checks passed. Published browser checks are recorded on Draft PR #8. Physical iPhone Safari testing remains separate.

Rollback using a new revert commit of this preview update; do not reset or force-push the publishing branch.
