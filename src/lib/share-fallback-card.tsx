import { ImageResponse } from "next/og";
import { SITE_TITLE } from "./agent-docs";
import { OPENGRAPH_SIZE } from "./share-open-graph";

/**
 * Shown when a page cannot be screenshotted — the capture failed, or too many
 * are already running. It is a link preview either way, so it has to look like
 * a deliberate card rather than a broken one. Deliberately a sibling of the
 * site card in src/app/opengraph-image.tsx.
 */
const INK = "#141820";
const PAPER = "#f4f1ea";
const MUTED = "#9aa3b2";
const ACCENT = "#5ecfbc";

const TITLE_LIMIT = 110;
const DESCRIPTION_LIMIT = 160;

export function shareFallbackCard(input: {
  title: string;
  description?: string;
}): ImageResponse {
  const title = clamp(input.title, TITLE_LIMIT);
  const description = input.description
    ? clamp(input.description, DESCRIPTION_LIMIT)
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: INK,
          color: PAPER,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              width: 14,
              height: 14,
              borderRadius: 7,
              background: ACCENT,
            }}
          />
          <div style={{ display: "flex", fontSize: 28, color: MUTED }}>
            {SITE_TITLE}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: title.length > 60 ? 56 : 68,
            fontWeight: 500,
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>

        {description ? (
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 30,
              lineHeight: 1.35,
              color: MUTED,
            }}
          >
            {description}
          </div>
        ) : null}
      </div>
    ),
    { width: OPENGRAPH_SIZE.width, height: OPENGRAPH_SIZE.height },
  );
}

function clamp(value: string, limit: number): string {
  const collapsed = value.replace(/\s+/g, " ").trim();
  if (collapsed.length <= limit) {
    return collapsed;
  }
  const cut = collapsed.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
