"use client";

import { useState } from "react";

/**
 * The interactive parts of the hero, and the curl block at the foot.
 *
 * Deliberately dependency-free: askmeatsack reaches for shadcn because it has a
 * whole answering UI to build, and this product's home page needs two buttons.
 * The tokens are shared, so they look the same either way.
 */

const BUTTON =
  "inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-[background,border-color,transform] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

type HomeLandingProps = {
  mcpUrl: string;
  cursorHref: string;
  pluginHref: string;
};

export function HomeLanding({ mcpUrl, cursorHref, pluginHref }: HomeLandingProps) {
  const [copied, setCopied] = useState(false);

  async function copyMcp() {
    try {
      await navigator.clipboard.writeText(mcpUrl);
    } catch {
      // Clipboard access can be refused. The URL is on the page either way.
      return;
    }
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a
          href={cursorHref}
          className={`${BUTTON} bg-primary text-primary-foreground hover:brightness-110`}
        >
          Add to Cursor
        </a>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <code className="rounded-md bg-muted px-2 py-1 font-mono text-sm text-foreground">
          {mcpUrl}
        </code>
        <button
          type="button"
          onClick={() => {
            void copyMcp();
          }}
          className="rounded-md border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {copied ? "Copied" : "Copy MCP URL"}
        </button>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        Paste that into any MCP client.{" "}
        <a href={pluginHref} className="underline underline-offset-4 hover:text-foreground">
          Cursor plugin
        </a>
        {" · "}
        <a
          href="https://grok.com/connectors"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Grok connectors
        </a>
      </p>
    </>
  );
}

/** The raw API, for anyone who would rather not connect an agent at all. */
export function CurlBlock({ endpoint, curl }: { endpoint: string; curl: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(curl);
    } catch {
      return;
    }
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-machine-rule bg-machine shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-machine-rule bg-machine-raised px-4 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.13em] text-machine-muted">
          {endpoint}
        </span>
        <button
          type="button"
          onClick={() => {
            void copy();
          }}
          className="rounded-md border border-machine-rule px-3 py-1 font-mono text-xs text-machine-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-5 font-mono text-[12.5px] leading-[1.75] text-machine-foreground">
        {curl}
      </pre>
    </div>
  );
}
