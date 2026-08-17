import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import {
  SITE_DESCRIPTION,
  SITE_TAGLINE,
  SITE_TITLE,
  siteJsonLd,
} from "@/lib/agent-docs";
import { publicOrigin } from "@/lib/public-origin";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const origin = publicOrigin();

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_TITLE}`,
  },
  description: `${SITE_TAGLINE} ${SITE_DESCRIPTION}`,
  applicationName: SITE_TITLE,
  keywords: ["showmeatsack.com", "MCP", "HTML", "share", "agent"],
  authors: [{ name: SITE_TITLE, url: origin }],
  alternates: {
    canonical: "/",
    types: {
      "text/markdown": "/mcp.md",
      "text/plain": "/llms.txt",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: origin,
    siteName: SITE_TITLE,
    title: SITE_TITLE,
    description: `${SITE_TAGLINE} ${SITE_DESCRIPTION}`,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: `${SITE_TAGLINE} ${SITE_DESCRIPTION}`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const jsonLd = siteJsonLd(origin);
  return (
    <html
      lang="en-GB"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
