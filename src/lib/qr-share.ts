import QRCode from "qrcode";
import { escapeHtml } from "./agent-docs";
import type { QrShareInput } from "./schema";
import type { SharePreview } from "./share-store";
import type { SiteFile } from "./zip-site";
import { QR_BRAND, qrPreviewCard } from "./qr-preview-card";

export async function qrAsSite(
  input: QrShareInput,
): Promise<{ files: SiteFile[]; preview: SharePreview }> {
  const title = input.title ?? `QR code for ${new URL(input.url).hostname}`;
  const style = input.style ?? "classic";
  const margin = style === "brand" ? 5 : 4;
  const color = {
    dark: style === "brand" ? `${QR_BRAND.code}ff` : "#000000ff",
    light: "#ffffffff",
  };
  const png = await QRCode.toBuffer(input.url, {
    type: "png",
    width: 1024,
    margin,
    errorCorrectionLevel: "M",
    color,
  });
  const encodedSvg = await QRCode.toString(input.url, {
    type: "svg",
    width: 1024,
    margin,
    errorCorrectionLevel: "M",
    color,
  });
  // Preserve fractional module edges when a dense code is rasterised small.
  // The encoder's crispEdges hint can drop thin rows at those sizes.
  const svg = encodedSvg.replace(
    'shape-rendering="crispEdges"',
    'shape-rendering="geometricPrecision"',
  );
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(input.url)}">
  <style>
    :root {
      --paper: oklch(0.975 0.01 90);
      --ink: oklch(0.22 0.02 55);
      --muted: oklch(0.48 0.02 55);
      --rule: oklch(0.88 0.02 80);
      --kelp: oklch(0.44 0.09 175);
      --kelp-hover: oklch(0.37 0.08 175);
      color-scheme: light;
      scrollbar-color: var(--rule) var(--paper);
    }
    body[data-style="action"] { --paper: ${QR_BRAND.ink}; --ink: ${QR_BRAND.paper}; --muted: #ded8ca; --rule: #52716a; --kelp: ${QR_BRAND.paper}; --kelp-hover: #ded8ca; }
    body[data-style="brand"] { --paper: ${QR_BRAND.paper}; --ink: ${QR_BRAND.ink}; --kelp: ${QR_BRAND.kelp}; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.5 system-ui, sans-serif; }
    ::selection { background: var(--kelp); color: var(--paper); }
    a { color: inherit; text-underline-offset: 4px; }
    a:focus-visible { outline: 3px solid var(--kelp); outline-offset: 5px; }
    .origin { max-width: 68rem; margin: 0 auto; padding: 2rem 2.5rem; }
    .origin a { color: var(--kelp); font-size: .875rem; font-weight: 650; letter-spacing: -.02em; text-decoration: none; }
    .origin a:hover { text-decoration: underline; }
    main { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: 4rem; row-gap: 1.75rem; align-content: center; max-width: 68rem; min-height: min(42rem, calc(100svh - 6rem)); margin: 0 auto; padding: 3rem 2.5rem 5rem; }
    .heading { align-self: end; }
    h1 { margin: 0; font-size: clamp(2rem, 4.5vw, 3.75rem); font-weight: 600; line-height: 1.06; letter-spacing: -.04em; text-wrap: balance; overflow-wrap: anywhere; }
    .instruction { max-width: 28ch; margin: 1.25rem 0 0; color: var(--muted); font-size: 1.0625rem; line-height: 1.6; }
    figure { grid-column: 2; grid-row: 1 / 4; align-self: center; margin: 0; }
    .qr { padding: 1rem; border: 1px solid var(--rule); border-radius: 16px; background: white; }
    img { display: block; width: 100%; height: auto; background: white; }
    figcaption { margin-top: 1rem; color: var(--muted); font-size: .8125rem; text-align: center; }
    .details { align-self: center; padding-top: 1.5rem; border-top: 1px solid var(--rule); }
    .destination { margin: 0; color: var(--muted); font-size: .875rem; line-height: 1.65; overflow-wrap: anywhere; }
    nav { display: flex; flex-wrap: wrap; gap: .75rem; align-self: start; }
    nav a { display: inline-flex; align-items: center; justify-content: center; min-height: 3rem; padding: .75rem 1.25rem; border: 1px solid var(--rule); border-radius: .75rem; font-size: .875rem; font-weight: 600; text-decoration: none; }
    nav a:first-child { border-color: var(--kelp); background: var(--kelp); color: var(--paper); }
    nav a:first-child:hover { border-color: var(--kelp-hover); background: var(--kelp-hover); }
    nav a:not(:first-child):hover { border-color: var(--kelp); color: var(--kelp); }
    nav a:active { transform: translateY(1px); }
    @media (max-width: 47.99rem) {
      .origin { padding: 1.5rem; text-align: center; }
      main { grid-template-columns: minmax(0, 1fr); gap: 1.5rem; min-height: 0; max-width: 30rem; padding: 1.5rem 1.5rem 3rem; text-align: center; }
      h1 { font-size: clamp(2rem, 8vw, 2.75rem); }
      .instruction { max-width: 30ch; margin: 1rem auto 0; font-size: 1rem; }
      figure { grid-column: 1; grid-row: auto; width: 100%; max-width: 22rem; justify-self: center; }
      .qr { padding: .75rem; }
      figcaption { margin-top: .75rem; }
      .details { padding-top: 1.25rem; }
      nav { justify-content: center; }
      nav a { flex: 1 1 9rem; }
      nav a:first-child { flex-basis: 100%; }
    }
  </style>
</head>
<body data-style="${style}">
  <header class="origin"><a href="https://showmeatsack.com">showmeatsack.com</a></header>
  <main>
    <div class="heading">
      <h1>${escapeHtml(title)}</h1>
      <p class="instruction">Scan the code with your camera, or open the link below.</p>
    </div>
    <figure>
      <div class="qr"><img src="qr.png" width="1024" height="1024" alt="QR code for ${escapeHtml(input.url)}"></div>
      <figcaption>Scan to open</figcaption>
    </figure>
    <div class="details"><p class="destination">${escapeHtml(input.url)}</p></div>
    <nav aria-label="QR code actions">
      <a href="${escapeHtml(input.url)}" rel="noreferrer">Open link</a>
      <a href="qr.png" download="qr-code.png">Download PNG</a>
      <a href="qr.svg" download="qr-code.svg">Download SVG</a>
    </nav>
  </main>
</body>
</html>`;
  const card =
    style === "classic" ? undefined : await qrPreviewCard({ png, title, url: input.url, style });
  return {
    files: [
      { path: "index.html", bytes: new TextEncoder().encode(html) },
      { path: "qr.png", bytes: png },
      { path: "qr.svg", bytes: new TextEncoder().encode(svg) },
      ...(card ? [{ path: "preview.png", bytes: card }] : []),
    ],
    preview: {
      path: card ? "preview.png" : "qr.png",
      width: card ? 1200 : 1024,
      height: card ? 630 : 1024,
      title,
      description: input.url,
    },
  };
}
