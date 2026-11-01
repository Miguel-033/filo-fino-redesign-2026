# SEO and local release tools

`routes.json` is the final registry: seven developed main pages and three legal pages. `site/` is the only web source root. Production facts are taken from current accepted pages, not legacy HTML.

`prepare_metadata.py` generates offline `production/metadata.json` (main 7/7; all 10/10), `sitemap.candidate.xml` (exactly ten final filofino.es URLs) and the compatible knife handoff. `--check` detects drift. `--apply-preview` updates only safe title/description/OG fields, preserving noindex and absent canonical/schema. Normal cleanup does not need to rewrite accepted page metadata.

`build.py --mode preview|production --output /new/empty/path` follows dependencies from exactly ten registered pages: HTML resources, CSS URLs, JS illustration paths, video posters/sources/downloads and font licence notices. No source-only document, report, test, source master or migration file is published. It refuses a nonempty output directory and never pushes/deploys.

Preview: noindex,nofollow in all ten HTML files; no canonical, og:url, JSON-LD, production robots/sitemap or CNAME. Production: offline only, index,follow and self-canonical/schema; ten-URL sitemap and separate robots template. It is never copied to Pages.

`verify.py` checks metadata, H1, hierarchy, links/anchors, resource dependencies, common component parity, JSON graphs, exact sitemap contents, migration counts and both real local output trees. `release_checks.py` compares all seven Hero and main HTML regions to accepted b2cf0a7, allowing only the requested article-link removal, and compares all active CSS/JS/media bytes. These are offline checks, not Google indexing or Safari claims.

`verify-services.cjs`: route/fact/video/media and service-menu DOM regression. `verify-interactions.cjs`: home/menu/shipping/process/WhatsApp and knife/design-system checks. QA dependencies jsdom/postcss must be available via normal Node resolution or NODE_PATH; they do not ship. Historical browser/viewport tests remain available and are updated to `site/`.

`export_preview.py --output /separate/preview-worktree` validates repository and preview/* local branch, runs release checks, builds preview only, removes stale publishing files and copies its dependency closure. It never pushes. An existing `.nojekyll` and absence of CNAME are required. Changing remote refs or publishing requires the owner's task authorization; production is prohibited.

Do not derive sitemap from migration rows. Nonidentity redirect proposals in `migration/url-map.csv` require owner approval. Historical HTTP statuses there were not re-fetched during cleanup.
