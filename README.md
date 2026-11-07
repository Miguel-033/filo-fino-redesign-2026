# Filo Fino — redesign, production preparation

Only `Miguel-033/filo-fino-redesign-2026` is editable. PR #15 remains the draft development PR. No production deployment or migration is authorized.

- `site/`: single source tree, exactly seven main and three legal HTML pages, plus their local dependencies. Source HTML always uses `noindex, nofollow` and contains no production canonical or JSON-LD.
- `design-system/`: shared header/footer/menu templates and regression tests.
- `seo/`: final routes, offline metadata/sitemap generator, dependency-only builder and checks.
- `seo/migration/`: historical 42+23 URL ledger; proposals only, no active redirects.
- `source-materials/`: unique original photos, masters of the five active videos and unused owner media kept for future edits. Never published.
- `docs/`: technical evidence and clearly labelled history. Never published.
- `.agents/`: installed project skills and their licences; not website dependencies.

## Checks and local builds

```sh
python design-system/render_components.py --check
python seo/prepare_metadata.py --check
python seo/verify.py
node seo/verify-services.cjs
node seo/verify-interactions.cjs
python seo/build.py --mode preview --output /new/empty/local/preview
python seo/build.py --mode production --output /new/empty/local/candidate
```

Python tools use the standard library. DOM tests require development-only `jsdom` and `postcss` (set `NODE_PATH` to the QA environment); browser tests require Playwright. None is copied into the website. See `seo/README.md`.

The offline candidate has canonical/schema/indexable robots for `https://filofino.es/` and a ten-URL sitemap. This is **not permission to deploy**. Preview has ten pages but no production sitemap/robots/canonical/schema and remains noindex,nofollow.

The old root site and zonas/blog/articulos are removed from this redesign checkout. Their history remains in Git; future migration decisions are documented without modifying the live site. There are no active redirect files, CNAME or deployment workflows in the source tree.
