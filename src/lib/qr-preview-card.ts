import { join } from "node:path";
import sharp from "sharp";
import { escapeHtml } from "./agent-docs";

// The product's cream, kelp and ink colours come from brand/assets/show/logo.svg.
export const QR_BRAND = { paper: "#f6f1e7", kelp: "#287566", ink: "#173f38", code: "#0b2923" };
const fontfile = join(
  process.cwd(),
  "node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf",
);
// A Lambda need not have system fonts/configuration. Sharp registers the bundled
// font itself; Fontconfig only needs a writable cache location.
process.env.FONTCONFIG_FILE ??= join(process.cwd(), "src/assets/qr-fonts.conf");

export async function qrPreviewCard(input: {
  png: Uint8Array;
  title: string;
  url: string;
  style: "brand" | "action";
}): Promise<Uint8Array> {
  const action = input.style === "action";
  const background = action ? QR_BRAND.ink : QR_BRAND.paper;
  const foreground = action ? QR_BRAND.paper : QR_BRAND.ink;
  const label = async (text: string, size: number, height?: number) =>
    sharp({
      text: {
        text: `<span foreground="${foreground}">${escapeHtml(text)}</span>`,
        font: `Geist ${size}`,
        fontfile,
        width: 500,
        ...(height ? { height } : {}),
        wrap: "word-char",
        rgba: true,
      },
    })
      .png()
      .toBuffer();
  const [wordmark, title, host, instruction, qr] = await Promise.all([
    label("showmeatsack.com", 24),
    label(shortLabel(input.title, 100), 52, 260),
    label(shortLabel(new URL(input.url).hostname, 40), 24),
    label("Scan to open", 30),
    sharp(input.png).resize(560, 560).png().toBuffer(),
  ]);
  return sharp({ create: { width: 1200, height: 630, channels: 4, background } })
    .composite([
      { input: wordmark, left: 48, top: 48 },
      { input: title, left: 48, top: 170 },
      { input: host, left: 48, top: 490 },
      ...(action ? [{ input: instruction, left: 48, top: 540 }] : []),
      { input: qr, left: 610, top: 35 },
    ])
    .png()
    .toBuffer();
}

function shortLabel(value: string, limit: number): string {
  const characters = Array.from(value.replace(/\s+/g, " "));
  return characters.length > limit
    ? `${characters.slice(0, limit - 1).join("")}…`
    : characters.join("");
}
