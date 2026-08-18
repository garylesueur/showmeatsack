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

/**
 * @sparticuz/chromium ships Lambda flags — `--single-process` and `--no-zygote`
 * above all — that a desktop Chrome cannot honour: it accepts the launch and
 * then never produces a target, so `newPage()` hangs until the timeout. Local
 * runs get their own minimal set instead.
 */
const LOCAL_CHROME_ARGS = [
  "--no-sandbox",
  "--disable-dev-shm-usage",
  "--disable-gpu",
  "--hide-scrollbars",
  "--font-render-hinting=none",
];

const LAUNCH_TIMEOUT_MS = 15_000;
const PROTOCOL_TIMEOUT_MS = 20_000;
const CONTENT_TIMEOUT_MS = 8_000;

type LaunchTarget = {
  executablePath: string;
  args: string[];
};

export async function screenshotHtmlPreview(html: string): Promise<Uint8Array> {
  const target = await launchTarget();
  const browser = await puppeteer.launch({
    args: target.args,
    defaultViewport: {
      width: OPENGRAPH_SIZE.width,
      height: OPENGRAPH_SIZE.height,
      deviceScaleFactor: 1,
    },
    executablePath: target.executablePath,
    headless: true,
    timeout: LAUNCH_TIMEOUT_MS,
    protocolTimeout: PROTOCOL_TIMEOUT_MS,
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
    await page.setContent(html, { waitUntil: "load", timeout: CONTENT_TIMEOUT_MS });
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

async function launchTarget(): Promise<LaunchTarget> {
  // Vercel runs the Lambda build of Chromium, which needs the flags that ship
  // with it. Anywhere else means a desktop Chrome, which does not.
  if (process.env.VERCEL) {
    return {
      executablePath: process.env.CHROME_PATH ?? (await chromium.executablePath()),
      args: chromium.args,
    };
  }
  return {
    executablePath: process.env.CHROME_PATH ?? desktopChromePath(),
    args: LOCAL_CHROME_ARGS,
  };
}

function desktopChromePath(): string {
  for (const chromePath of LOCAL_CHROME_PATHS) {
    if (existsSync(/* turbopackIgnore: true */ chromePath)) {
      return chromePath;
    }
  }
  throw new Error(
    "No local Chrome found. Install Chrome or set CHROME_PATH to capture previews.",
  );
}
