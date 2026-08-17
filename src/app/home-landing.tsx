"use client";

import { useState } from "react";

type HomeLandingProps = {
  mcpUrl: string;
  cursorHref: string;
  pluginHref: string;
  curl: string;
  skillHref: string;
  guideHref: string;
};

export function HomeLanding({
  mcpUrl,
  cursorHref,
  pluginHref,
  curl,
  skillHref,
  guideHref,
}: HomeLandingProps) {
  const [copied, setCopied] = useState<"mcp" | "curl" | null>(null);

  async function copy(kind: "mcp" | "curl", value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    window.setTimeout(() => {
      setCopied(null);
    }, 1500);
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <code className="rounded-md bg-zinc-100 px-2 py-1 font-mono text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
          {mcpUrl}
        </code>
        <button
          type="button"
          className="rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700"
          onClick={() => {
            void copy("mcp", mcpUrl);
          }}
        >
          {copied === "mcp" ? "Copied" : "Copy"}
        </button>
      </div>

      <p className="text-sm text-zinc-500">
        For agents:{" "}
        <a href={guideHref} className="underline underline-offset-4">
          API guide
        </a>
        {" · "}
        <a href={skillHref} className="underline underline-offset-4">
          skill
        </a>
        {" · "}
        <a href="/llms.txt" className="underline underline-offset-4">
          llms.txt
        </a>
      </p>

      <div className="flex flex-col gap-2">
        <a href={cursorHref} className="inline-flex w-fit">
          <img
            src="/mcp-install-light.svg"
            alt="Add showmeatsack.com to Cursor"
            width={126}
            height={28}
          />
        </a>
        <a
          href={pluginHref}
          className="w-fit text-sm underline underline-offset-4"
        >
          Cursor plugin
        </a>
        <p className="text-sm text-zinc-500">
          The plugin is the MCP server plus the skill. Install it from GitHub.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <a
          href="https://grok.com/connectors"
          target="_blank"
          rel="noreferrer"
          className="w-fit rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700"
        >
          Add in Grok
        </a>
        <p className="text-sm text-zinc-500">
          Grok has no one-click badge yet. Open connectors, choose Custom, paste
          the MCP URL above.
        </p>
      </div>

      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-500">Or curl</h2>
          <button
            type="button"
            className="rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700"
            onClick={() => {
              void copy("curl", curl);
            }}
          >
            {copied === "curl" ? "Copied" : "Copy"}
          </button>
        </div>
        <pre className="overflow-x-auto font-mono text-[13px] leading-6">
          {curl}
        </pre>
      </section>
    </>
  );
}
