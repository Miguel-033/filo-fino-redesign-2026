# Filo Fino — isolated GitHub Pages preview

Prepared from Draft PR #4, source commit 68d2d83dddce5a24810e580b4daa946c65ebc078.
Only the premium prototype and its required assets are present. Design, CSS, JavaScript, images and fonts are unchanged. Nine service links use the full existing https://filofino.es/servicios/... addresses so they do not resolve to missing pages on github.io. This does not modify the production website.

## Enable manually

1. Open this repository's Settings → Pages.
2. Under Build and deployment, select Source: Deploy from a branch.
3. Select Branch: gh-pages-preview; folder: / (root). Click Save.
4. Leave Custom domain empty; do not enter filofino.es or upload CNAME. Do not change DNS.
5. Wait for GitHub's Pages build/deployment and use Visit site. Expected address: https://miguel-033.github.io/filo-fino-redesign-2026/.
6. Keep Enforce HTTPS enabled when available.

The preparation itself does not enable Pages, start deployment, merge PR #4 or change main. The branch contains no CNAME and no workflows. .nojekyll serves this static prototype without Jekyll processing. The existing noindex, nofollow meta remains. No analytics is included; fonts and photographs are hosted locally. Noindex is not access control: the preview becomes publicly accessible once you enable Pages.

## Verify after enabling

Check the three services, menu/Escape, photo gallery/zoom/arrows and the four process stages. WhatsApp and directions keep their real external destinations. Service links open existing production service pages. No messages or calls are sent automatically.

## Disable

Settings → Pages → Unpublish site. To prevent a later branch push from publishing again, set the publishing branch to None (if available) and Save. This preview is not intended to be merged into main.

## Local preparation checks

390 px and 1440 px Chromium, served under /filo-fino-redesign-2026/: all images, CSS, JavaScript and both fonts loaded; no 404, JS errors or external resource requests. Menu, gallery and process tested. No live GitHub Pages verification has been performed because deployment was intentionally left to the owner.

Font licences and asset provenance are retained in assets/.
