# Morfi Splitter logo

The approved mark is a plate split into two portions by a fork-shaped gap. The header uses the green mark and a lowercase wordmark; install icons reverse the mark in cream on green.

`public/brand-mark.svg` is the editable vector source. Run `node scripts/generate-brand-icons.mjs` to regenerate the SVG favicon, ICO fallback, 180px Apple touch icon, 192px and 512px manifest icons, 512px maskable icon, and 1024px master. This uses the existing Playwright dependency; install its Chromium browser with `npx playwright install chromium` if needed.

Install icons have an opaque square background so the device can apply its own corner mask. The maskable variant has extra padding. All icons use forest green `#41644d` and cream `#f5f4ef`.
