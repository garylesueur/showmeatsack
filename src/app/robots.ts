import type { MetadataRoute } from "next";
import { publicOrigin } from "@/lib/public-origin";

export default function robots(): MetadataRoute.Robots {
  const origin = publicOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Shares are kept out of search by the noindex header on every view
      // response, not by blocking the fetch. Disallowing /s/ here would also
      // stop an agent reading a link somebody deliberately handed it.
      disallow: ["/api/", "/agent/"],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
