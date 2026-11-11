# Git consolidation proposal — no ref or PR changes

Snapshot: 2 November 2026. Source: b2cf0a7, PR #15. All original branches and PR states are preserved.

| PR | State | Head → base | Relation to current result |
|---|---|---|---|
| #1 | merged | `codex/install-professional-skills` → `main` | included ancestor |
| #2 | open | `codex/design-research-2026` → `main` | alternative/historical; review separately |
| #3 | open | `codex/three-homepage-prototypes` → `main` | alternative/historical; review separately |
| #4 | open | `codex/premium-homepage-preview` → `main` | included ancestor |
| #5 | open | `codex/refine-premium-preview` → `codex/premium-homepage-preview` | alternative/historical; review separately |
| #6 | open | `codex/premium-media-refinement` → `codex/premium-homepage-preview` | included ancestor |
| #7 | merged | `preview/pr6-premium-media` → `gh-pages-preview` | alternative/historical; review separately |
| #8 | open | `codex/premium-owner-corrections` → `codex/premium-media-refinement` | included ancestor |
| #9 | open | `codex/knives-service-premium` → `codex/premium-owner-corrections` | included ancestor |
| #10 | open | `codex/seo-architecture-2026` → `codex/knives-service-premium` | included ancestor |
| #11 | open | `codex/knives-mobile-ux` → `codex/seo-architecture-2026` | included ancestor |
| #12 | open | `codex/unified-design-system` → `codex/knives-mobile-ux` | included ancestor |
| #13 | open | `codex/navigation-touch-polish` → `codex/unified-design-system` | included ancestor |
| #14 | open | `codex/service-pages-facts-2026` → `codex/navigation-touch-polish` | included ancestor |
| #15 | open | `codex/ux-hosteleria-reference` → `codex/service-pages-facts-2026` | current working result |

## Branch snapshot

| Branch | SHA |
|---|---|
| `codex/design-research-2026` | `0b89b97a311a0af26d92d39dbfce9f1df076cb64` |
| `codex/install-professional-skills` | `33886f866d99d2555f88a40e7913f4a6774f72ec` |
| `codex/knives-mobile-ux` | `8f65eb19900f1b83b3dc836d1d719edd35367762` |
| `codex/knives-service-premium` | `61425d8c3996caf531085ed203ac0ffe1d8ebba4` |
| `codex/navigation-touch-polish` | `2aaefb3b5965ef66a8bec314cf59a23c6df84201` |
| `codex/premium-homepage-preview` | `68d2d83dddce5a24810e580b4daa946c65ebc078` |
| `codex/premium-media-refinement` | `27b6aa4212d658e3c16b01d5c8deb46ee66e1e1e` |
| `codex/premium-owner-corrections` | `179a24edc3b3958c9eb44612f22db7466c3700c8` |
| `codex/refine-premium-preview` | `15132355709d068c14ff4527ce8ad604afeca7e9` |
| `codex/seo-architecture-2026` | `a4dd93b519242d65d4372a15d85902613f47a523` |
| `codex/service-pages-facts-2026` | `3d2811db01c37d1d3879e75a83d39dc994248332` |
| `codex/three-homepage-prototypes` | `2a42aafd707fa659609837634b5171211a8d86f4` |
| `codex/unified-design-system` | `c92be69d756c5440966992c4a5d14ae30afcab2e` |
| `codex/ux-hosteleria-reference` | `b2cf0a7b0cd5f7772a58730ce6e0e338be5c1aee` |
| `gh-pages-preview` | `44a4159f58d353fd4176805fac0f78e2c64d9700` |
| `main` | `4117219f9c833862421790875fbfce7604690897` |
| `preview/pr6-premium-media` | `0e1821271f4dad7866b863a3562a3cd6d99090b3` |

## Proposed next review, only after owner acceptance

Continue on PR #15 until this cleanup is accepted. It currently targets `codex/service-pages-facts-2026`, not main. Most earlier feature PRs form a stacked chain; merging them independently is unnecessary and risks publishing old intermediate states. PR #3 and #5 are alternative prototype paths and need separate assessment, not automatic merging.

A possible later simplification is to retarget PR #15 to this redesign repository’s main for one complete final-tree review, keeping all commits and protected branch history. Inspect that diff and hosting workflow before any change; do not do this during cleanup. Only after owner approval may earlier open PRs be annotated/closed as superseded and obsolete branches reviewed individually. No force push, history rewrite, mass branch deletion, PR closure or merge has been performed. Main/original production repository and live hosting are not changed.

The `gh-pages-preview` branch is the existing preview publishing branch. Source-only docs, originals, migration ledgers and offline candidate must never be copied there. The older preview/pr6-premium-media branch is historical.
