# SEO tooling

Read [SEO_ARCHITECTURE_2026.md](../SEO_ARCHITECTURE_2026.md) before changing a page.

```sh
python seo/prepare_metadata.py --apply-preview
python seo/verify.py
node seo/verify-interactions.cjs
```

Python tools use only the standard library. Interaction tests require the existing QA environment's `jsdom` and `postcss`, not browser-facing dependencies. Configure normal Node module resolution or NODE_PATH for that environment; do not add them to the site's assets. The knife component's checks.json is refreshed by its test. No analytics SDK, installer, framework or network service is required by the website.

`routes.json` owns title/description, URL role, developed/planned state, required links and page asset lists. When replacing another existing service page, add its source/assets and required contextual links before switching status to developed; do not invent placeholder content or URLs to satisfy tests.

`prepare_metadata.py` generates inert production metadata and a candidate sitemap. `--check` detects drift; `--apply-preview` updates safe test metadata only. It has no production export or deploy command. The knife's older production-seo.json is generated from the central metadata for backward compatibility, not maintained separately. Resolve business facts and reconcile the shared entity ID before production.

`verify.py` checks HTML, unique metadata/H1, heading hierarchy, links, resources, preview isolation and prepared JSON graphs. It also protects the accepted PR9 asset/interaction baseline tree. Intentional future shared CSS/JS/media changes need an explicitly reviewed new baseline and meaningful regression tests; do not merely weaken the test until it passes. The preservation ledger currently has 42 identity mappings; an approved future consolidation needs reviewed migration logic rather than silently dropping old URLs.

`verify-interactions.cjs` tests home gallery/menu/stages and knife gallery/menu/WhatsApp using DOM test doubles. It does not certify rendered layout, native keyboard/focus/swipe, Safari or Lighthouse. Existing browser harnesses remain available in the page source; no new screenshots are claimed from them.

For a **local-only** publishing copy, create a separate `preview/*` worktree from the actual current publishing head, then:

```sh
python seo/export_preview.py --output /absolute/path/to/the/preview-worktree
```

The exporter validates repository/branch boundaries, preserves the existing .nojekyll, refuses CNAME/robots/sitemap, copies only static allowlisted page files plus existing assets, and adapts links for the project path. It does not copy source-only metadata, checks or the production directory. It never pushes or updates a remote ref. The current owner task must separately authorize a test publication; the publish operation must use the latest expected head without force. After deployment, verify both HTML responses and resource hashes. Never export this copy to production.

Reports: `checks.json` and `regression.json` record the actual offline checks. Deployment HTTP checks and the source/publishing SHAs are recorded in the Draft PR. Full raw GSC query exports are not published; the specification includes only relevant aggregates and interpretation limits.
