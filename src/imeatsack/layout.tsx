import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { ColorModePicker } from "@/components/color-mode-picker";
import { COLOR_MODE_BOOT_SCRIPT } from "@/lib/color-mode";
import { landingMetadata, landingJsonLd } from "@/lib/imeatsack-site";
import "./globals.css";

const sans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
export const metadata = landingMetadata;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en-GB"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="describedby" type="text/plain" href="/llms.txt" />
      </head>
      <body className="relative flex min-h-full flex-col bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: COLOR_MODE_BOOT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(landingJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <div className="fixed right-4 bottom-4 z-20">
          <ColorModePicker />
        </div>
        {children}
      </body>
    </html>
  );
}
