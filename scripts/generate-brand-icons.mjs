import { chromium } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";

// Keep every install icon derived from the same editable header mark.
const publicDir = new URL("../public/", import.meta.url);
const source = await readFile(new URL("brand-mark.svg", publicDir), "utf8");
const shapes = source.replace(/<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
const iconSvg = (padding = 44) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320">
  <rect width="320" height="320" fill="#41644d"/>
  <svg x="${padding}" y="${padding}" width="${320 - padding * 2}" height="${320 - padding * 2}" viewBox="0 0 320 320" fill="#f5f4ef">${shapes}</svg>
</svg>\n`;
const standard = iconSvg();
await writeFile(new URL("favicon.svg", publicDir), standard);

const browser = await chromium.launch();
try {
    const page = await browser.newPage({ deviceScaleFactor: 1 });
    const render = async (svg, size) => {
        await page.setViewportSize({ width: size, height: size });
        await page.setContent(`<style>html,body{margin:0;width:100%;height:100%}body>svg{display:block;width:100%;height:100%}</style>${svg}`);
        return page.screenshot({ type: "png" });
    };
    for (const [filename, size, svg] of [
        ["apple-touch-icon.png", 180, standard],
        ["logo192.png", 192, standard],
        ["logo512.png", 512, standard],
        ["icon-1024.png", 1024, standard],
        ["icon-maskable-512.png", 512, iconSvg(56)],
    ]) {
        await writeFile(new URL(filename, publicDir), await render(svg, size));
    }

    // ICO directory with PNG images at each browser fallback size.
    const sizes = [16, 32, 48];
    const images = [];
    for (const size of sizes) images.push(await render(standard, size));
    const header = Buffer.alloc(6 + sizes.length * 16);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(sizes.length, 4);
    let offset = header.length;
    images.forEach((png, index) => {
        const entry = 6 + index * 16;
        header[entry] = sizes[index];
        header[entry + 1] = sizes[index];
        header.writeUInt16LE(1, entry + 4);
        header.writeUInt16LE(32, entry + 6);
        header.writeUInt32LE(png.length, entry + 8);
        header.writeUInt32LE(offset, entry + 12);
        offset += png.length;
    });
    await writeFile(new URL("favicon.ico", publicDir), Buffer.concat([header, ...images]));
} finally {
    await browser.close();
}
console.log("Generated header-compatible install icons and favicons from public/brand-mark.svg.");
