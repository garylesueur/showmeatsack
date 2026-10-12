import type { MetadataRoute } from "next";
import { LANDING_ORIGIN } from "@/lib/imeatsack-site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${LANDING_ORIGIN}/sitemap.xml`,
    host: LANDING_ORIGIN,
  };
}
