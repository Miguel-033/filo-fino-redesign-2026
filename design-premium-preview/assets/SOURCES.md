# Asset provenance

Captured 14 October 2026. No reference-site photographs, templates or JavaScript were imported.

## Existing Filo Fino files

Copied byte-for-byte from the working repository, under the owner's instruction to use its available photographs. These copies do not modify the originals and do not grant a public stock-photo licence. Confirm the archive's ownership/consents for any future production use.

| Prototype asset | Existing source |
|---|---|
| `images/afilado.webp` | `images/hero.webp` |
| `images/cuchillos.webp` | `images/Cuchillos.webp` |
| `images/manicura.webp` | `images/Heramientas-manicura.webp` |
| `images/tijeras.webp` | `images/tijeras_tiran.webp` |
| `images/prueba-tijeras.webp` | `images/tijeras_tiran_despues_afilado.webp` |
| `images/revision.webp` | `images/afilado-profesional-cuchillos-valencia.webp` |
| `images/taller.webp` | `images/filo-fino-interior-taller-afilado-valencia.webp` |

Cropping, monochrome treatment and lighting are CSS presentation only. No fake restoration, portrait, before/after pair or customer outcome has been generated. The sequence mixes archive photographs of different tools to explain the general process; it is not a documented single commission.

## Locally hosted fonts

Google Fonts repository, [Barlow Condensed](https://github.com/google/fonts/tree/main/ofl/barlowcondensed) and [Manrope](https://github.com/google/fonts/tree/main/ofl/manrope). Unmodified TTF files; no installer, network font calls, subsetting or new dependency. Full SIL Open Font License 1.1 notices accompany the files.

| Local file | Source file | Immutable Git blob SHA |
|---|---|---|
| `fonts/display.ttf` | `ofl/barlowcondensed/BarlowCondensed-SemiBold.ttf` | `9df66576492bee4bd0559066825472808fa98adc` |
| `fonts/body.ttf` | `ofl/manrope/Manrope[wght].ttf` | `75274da58537d6123b14f2cd0c355ad4681fc2b3` |
| `fonts/Barlow-Condensed-OFL.txt` | `ofl/barlowcondensed/OFL.txt` | `2f22ba6ca4dbc12145ae40b14c3368f387cba0e2` |
| `fonts/Manrope-OFL.txt` | `ofl/manrope/OFL.txt` | `e271172a9ed0cddc895aabb6509f1c7d880b492d` |

Display font: 109,428 bytes. Variable body font: 164,700 bytes. Both use `font-display: swap`; the display font is preloaded.

## Own resources

The blade wordmark treatment, simple inline SVG icons (including the new instrument selectors and Japanese-knife mark), layouts, CSS and native JavaScript were written for this isolated prototype. The refinement adds only native media-manifest and motion files; no image or font was replaced. Screenshot files are browser captures of this implementation. No GSAP, Motion, React, Tailwind, WebGL, paid API, analytics or external account is used. Python 3 is optional for a local static server; Chromium/Playwright were existing environment tools used for verification, not website dependencies.
