import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  // @sparticuz/chromium finds its binaries with join(dirname(fileURLToPath(
  // import.meta.url)), "..", "bin"), which the file tracer cannot follow. Without
  // this the archives are left out of the Lambda, executablePath() throws ENOENT,
  // and every link preview falls back to the plain title card. The .pnpm path is
  // the real one; node_modules/@sparticuz/chromium is a symlink.
  outputFileTracingIncludes: {
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
