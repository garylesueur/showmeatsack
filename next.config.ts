import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
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
