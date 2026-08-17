import { HomeLanding } from "@/app/home-landing";
import { SITE_DESCRIPTION, SITE_TAGLINE } from "@/lib/agent-docs";
import {
  CURSOR_PLUGIN_HREF,
  cursorInstallPageHref,
} from "@/lib/cursor-install";
import { publicOrigin } from "@/lib/public-origin";

export default function Home() {
  const origin = publicOrigin();
  const mcpUrl = `${origin}/mcp`;
  const createUrl = `${origin}/api/v1/shares`;
  const cursorHref = cursorInstallPageHref(mcpUrl);
  const curl = `curl -sS ${createUrl} \\
  -H 'content-type: application/json' \\
  -d '{ "html": "<p>Hello</p>" }'`;

  return (
    <div className="flex flex-1 flex-col px-6 py-16 sm:px-10 sm:py-24">
      <main className="mx-auto flex w-full max-w-xl flex-col gap-8">
        <header className="flex flex-col gap-4">
          <p className="text-sm text-zinc-500">showmeatsack.com</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {SITE_TAGLINE}
          </h1>
          <p className="max-w-md text-base leading-7 text-zinc-600 dark:text-zinc-400">
            {SITE_DESCRIPTION}
          </p>
        </header>

        <HomeLanding
          mcpUrl={mcpUrl}
          cursorHref={cursorHref}
          pluginHref={CURSOR_PLUGIN_HREF}
          curl={curl}
          skillHref={`${origin}/skill.md`}
          guideHref={`${origin}/mcp.md`}
        />
      </main>
    </div>
  );
}
