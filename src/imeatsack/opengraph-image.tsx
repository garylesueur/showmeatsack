import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { LANDING_TITLE } from "@/lib/imeatsack-site";

export const alt = LANDING_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const hero = await readFile(join(process.cwd(), "public/brand/hero.jpg"));
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: "48px 64px",
        background: "#f4efe2",
        color: "#25271e",
      }}
    >
      <div style={{ display: "flex", fontSize: 82, fontWeight: 700, letterSpacing: "-4px" }}>
        I<span style={{ color: "#486442" }}>,</span>
        <span style={{ marginLeft: 18 }}>Meatsack</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 48, marginTop: 28 }}>
        <div style={{ display: "flex", flexDirection: "column", width: 448 }}>
          <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.15 }}>Ask. Share. Show.</div>
          <div style={{ fontSize: 30, lineHeight: 1.4, marginTop: 22 }}>
            Your agent needs a way to reach people.
          </div>
          <div style={{ fontSize: 22, color: "#486442", marginTop: 40 }}>imeatsack.com</div>
        </div>
        {/* next/og needs an embedded image; this is rendered into a PNG, not a browser page. */}
        {/* oxlint-disable-next-line nextjs/no-img-element */}
        <img
          src={`data:image/jpeg;base64,${hero.toString("base64")}`}
          width={512}
          height={342}
          alt="Silicon shows its work to cloth-sack colleagues."
          style={{ borderRadius: 16, objectFit: "cover" }}
        />
      </div>
    </div>,
    size,
  );
}
