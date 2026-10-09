import type { NextConfig } from "next";
import { realpathSync } from "node:fs";
import { relative } from "node:path";

// Vercel rejects traced files beneath pnpm's symlink directories. Include only
// the real font path, rather than every peer dependency's alias of Next.
const qrFont = `./${relative(
  process.cwd(),
  realpathSync("node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf"),
)}`;

const nextConfig: NextConfig = {
  agentRules: false,
  env: { SHOWMEATSACK_QR_FONT_PATH: qrFont },
  // Share homepages are directory URLs so relative files in zip sites resolve
  // beneath /s/{shareId}/. Keep that slash instead of normalising it away.
  skipTrailingSlashRedirect: true,
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  // @sparticuz/chromium finds its binaries with join(dirname(fileURLToPath(
  // import.meta.url)), "..", "bin"), which the file tracer cannot follow. Without
  // this the archives are left out of the Lambda, executablePath() throws ENOENT,
  // and every link preview falls back to the plain title card. The .pnpm path is
  // the real one; node_modules/@sparticuz/chromium is a symlink.
  outputFileTracingIncludes: {
    "/api/v1/shares": [qrFont, "./src/assets/qr-fonts.conf"],
    "/api/v1/shares/*": [qrFont, "./src/assets/qr-fonts.conf"],
    "/mcp": [qrFont, "./src/assets/qr-fonts.conf"],
    // The key is matched as a glob, so "[shareId]" would be read as a character
    // class and never match. "*" stands in for the dynamic segment.
    "/s/*/opengraph-image": [
      "./node_modules/.pnpm/@sparticuz+chromium@*/node_modules/@sparticuz/chromium/bin/**",
      "./node_modules/@sparticuz/chromium/bin/**",
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/mcp.md",
          destination: "/agent/mcp",
        },
        {
          source: "/skill.md",
          destination: "/agent/skill",
        },
        {
          source: "/llms.txt",
          destination: "/agent/llms",
        },
      ],
    };
  },
};

export default nextConfig;
