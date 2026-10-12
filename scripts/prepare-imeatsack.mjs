import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { resolve, dirname, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputIndex = process.argv.indexOf("--out");
const outputArgument = outputIndex >= 0 ? process.argv[outputIndex + 1] : undefined;
if (!outputArgument || !isAbsolute(outputArgument)) {
  throw new Error("Pass --out with an absolute directory for the standalone landing release.");
}
const output = resolve(outputArgument);
await mkdir(output, { recursive: true });
const marker = resolve(output, "imeatsack-source.json");
try {
  await access(resolve(output, "package.json"));
  const previous = JSON.parse(await readFile(marker, "utf8"));
  if (previous.project !== "imeatsack") throw new Error("Unexpected release project.");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  try {
    await access(resolve(output, "package.json"));
    throw new Error("Refusing to overwrite an existing project without an imeatsack marker.", {
      cause: error,
    });
  } catch (existing) {
    if (existing.code !== "ENOENT") throw existing;
  }
}

const inputs = {};
const write = async (path, contents) => {
  const target = resolve(output, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, contents);
};
const copy = async (source, destination) => {
  const contents = await readFile(resolve(root, source));
  inputs[source] = createHash("sha256").update(contents).digest("hex");
  await write(destination, contents);
};

await Promise.all(
  [
    ["src/app/preview/imeatsack/landing-page.tsx", "src/app/landing-page.tsx"],
    ["src/app/preview/imeatsack/hero-slideshow.tsx", "src/app/hero-slideshow.tsx"],
    ["src/app/preview/imeatsack/preview.module.css", "src/app/preview.module.css"],
    ["src/app/globals.css", "src/app/globals.css"],
    ["src/app/brand.generated.css", "src/app/brand.generated.css"],
    ["src/components/site-chrome.tsx", "src/components/site-chrome.tsx"],
    ["src/components/color-mode-picker.tsx", "src/components/color-mode-picker.tsx"],
    ["src/lib/color-mode.ts", "src/lib/color-mode.ts"],
    ["src/lib/imeatsack-site.ts", "src/lib/imeatsack-site.ts"],
    ["src/imeatsack/layout.tsx", "src/app/layout.tsx"],
    ["src/imeatsack/robots.ts", "src/app/robots.ts"],
    ["src/imeatsack/sitemap.ts", "src/app/sitemap.ts"],
    ["src/imeatsack/llms-route.ts", "src/app/llms.txt/route.ts"],
    ["src/imeatsack/llms-full-route.ts", "src/app/llms-full.txt/route.ts"],
    ["src/imeatsack/markdown-route.ts", "src/app/index.md/route.ts"],
    ["src/imeatsack/opengraph-image.tsx", "src/app/opengraph-image.tsx"],
    ["public/brand/hero.jpg", "public/brand/hero.jpg"],
    ["public/preview/imeatsack/ask-v2.png", "public/preview/imeatsack/ask-v2.png"],
    ["public/preview/imeatsack/share-v2.png", "public/preview/imeatsack/share-v2.png"],
    ["src/app/icon.png", "src/app/icon.png"],
    ["src/app/apple-icon.png", "src/app/apple-icon.png"],
    ["src/app/favicon.ico", "src/app/favicon.ico"],
    ["pnpm-lock.yaml", "pnpm-lock.yaml"],
  ].map(([source, destination]) => copy(source, destination)),
);

const indexNowSource = "src/imeatsack/indexnow-key.txt";
const indexNowKey = (await readFile(resolve(root, indexNowSource), "utf8")).trim();
if (!/^[a-f0-9]{32}$/.test(indexNowKey)) throw new Error("Invalid IndexNow ownership key.");
await copy(indexNowSource, `public/${indexNowKey}.txt`);

const version = (name) =>
  JSON.parse(readFileSync(resolve(root, "node_modules", name, "package.json"), "utf8")).version;
await write(
  "package.json",
  JSON.stringify(
    {
      name: "imeatsack-landing",
      version: "0.1.0",
      private: true,
      packageManager: JSON.parse(await readFile(resolve(root, "package.json"), "utf8"))
        .packageManager,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        typecheck: "tsc --noEmit",
      },
      dependencies: {
        next: version("next"),
        react: version("react"),
        "react-dom": version("react-dom"),
      },
      devDependencies: {
        "@tailwindcss/postcss": version("@tailwindcss/postcss"),
        tailwindcss: version("tailwindcss"),
        typescript: version("typescript"),
        "@types/node": version("@types/node"),
        "@types/react": version("@types/react"),
        "@types/react-dom": version("@types/react-dom"),
      },
    },
    null,
    2,
  ) + "\n",
);

await write(
  "next.config.ts",
  `import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  agentRules: false,
  outputFileTracingIncludes: { "/opengraph-image": ["./public/brand/hero.jpg"] },
  async headers() {
    return [{ source: "/", headers: [{ key: "Link", value: '</index.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"; type="text/plain"' }] }];
  },
};
export default nextConfig;
`,
);
await write("postcss.config.mjs", `export default { plugins: { "@tailwindcss/postcss": {} } };\n`);
await write(
  "tsconfig.json",
  JSON.stringify(
    {
      compilerOptions: {
        target: "ES2017",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "react-jsx",
        incremental: true,
        plugins: [{ name: "next" }],
        paths: { "@/*": ["./src/*"] },
      },
      include: [
        "next-env.d.ts",
        "**/*.ts",
        "**/*.tsx",
        ".next/types/**/*.ts",
        ".next/dev/types/**/*.ts",
      ],
      exclude: ["node_modules"],
    },
    null,
    2,
  ) + "\n",
);
await write(".gitignore", "node_modules/\n.next/\n.vercel/\n*.tsbuildinfo\n.env*\n");
await write(
  "src/app/page.tsx",
  `import { LandingPage } from "./landing-page";
export default function Home() { return <LandingPage />; }
`,
);
await write("vercel.json", JSON.stringify({ framework: "nextjs" }, null, 2) + "\n");
await write(
  "imeatsack-source.json",
  JSON.stringify({ project: "imeatsack", inputs }, null, 2) + "\n",
);
console.log(`Prepared standalone I, Meatsack release at ${output}`);
