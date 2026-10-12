import type { MetadataRoute } from "next";
import { LANDING_ORIGIN } from "@/lib/imeatsack-site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${LANDING_ORIGIN}/`,
      images: [
        `${LANDING_ORIGIN}/brand/hero.jpg`,
        `${LANDING_ORIGIN}/preview/imeatsack/ask-v2.png`,
        `${LANDING_ORIGIN}/preview/imeatsack/share-v2.png`,
      ],
    },
  ];
}
