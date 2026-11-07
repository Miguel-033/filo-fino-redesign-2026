# Unpublished source materials

These are deliberately outside `site/` and neither builder copies them.

`photos/`: unique original JPEG/PNG photographs from the former images directory; exact duplicate originals are consolidated by SHA-256 in manifest.json. Optimized variants are kept only where referenced by the current site. Originals are retained for future crops/exports, rather than deleted because their previous folder belonged to the old site.

`videos/`: the five original masters corresponding to the five active demonstrations. Browser-facing MP4 copies remain byte-identical under site/assets/videos. Unused videos and masters for retired content were removed from the current tree; they remain recoverable through Git history.

`approved-archive/`: owner media/provenance not referenced by current pages, kept as source material. Active menu photography remains under site/assets/images/drive. Manifest paths from older snapshots are historical, not publish dependencies.

manifest.json maps the old original-photo/master paths to their retained paths and content hashes. No private Drive links or credentials are included.
