import { existsSync } from "node:fs";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { OPENGRAPH_SIZE } from "./share-open-graph";

const LOCAL_CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

export async function screenshotHtmlPreview(html: string): Promise<Uint8Array> {
  const executablePath = await chromeExecutablePath();
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: OPENGRAPH_SIZE.width,
      height: OPENGRAPH_SIZE.height,
      deviceScaleFactor: 1,
    },
    executablePath,
    headless: true,
    timeout: 10_000,
    protocolTimeout: 15_000,
  });
  try {
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(false);
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const url = request.url();
      if (url.startsWith("data:") || url === "about:blank" || url.startsWith("about:")) {
        void request.continue();
        return;
      }
      void request.abort();
    });
    await page.setContent(html, { waitUntil: "load", timeout: 8_000 });
    const png = await page.screenshot({
      type: "png",
      clip: {
        x: 0,
        y: 0,
        width: OPENGRAPH_SIZE.width,
        height: OPENGRAPH_SIZE.height,
      },
    });
    return Uint8Array.from(png);
  } finally {
    await browser.close();
  }
}

async function chromeExecutablePath(): Promise<string> {
  if (process.env.CHROME_PATH) {
    return process.env.CHROME_PATH;
  }
  if (!process.env.VERCEL) {
    for (const chromePath of LOCAL_CHROME_PATHS) {
      if (existsSync(/* turbopackIgnore: true */ chromePath)) {
        return chromePath;
      }
    }
  }
  return chromium.executablePath();
}
