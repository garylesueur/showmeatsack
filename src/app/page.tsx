import { AGENT_SAMPLE, CHART_BARS, HERO, USE_CASES } from "@/app/home-content";
import { CurlBlock, HomeLanding } from "@/app/home-landing";
import { HeroScene, SectionLabel, Seam, Steps, UseCases } from "@/components/home-sections";
import { SiteShell } from "@/components/site-chrome";
import { SITE_DESCRIPTION, SITE_TAGLINE } from "@/lib/agent-docs";
import { CURSOR_PLUGIN_HREF, cursorInstallPageHref } from "@/lib/cursor-install";
import { publicOrigin } from "@/lib/public-origin";

const SIBLING = {
  name: "askmeatsack.com",
  href: "https://askmeatsack.com",
};

export default function Home() {
  const origin = publicOrigin();
  const mcpUrl = `${origin}/mcp`;
  const curl = `curl -sS ${origin}/api/v1/shares \\
  -H 'content-type: application/json' \\
  -d '{
    "html": "<h1>Q3 spend</h1><p>Up 12% on Q2.</p>",
    "expiresInSeconds": 2592000
  }'`;

  return (
    <SiteShell
      wordmark="showmeatsack.com"
      sibling={SIBLING}
      repoHref={CURSOR_PLUGIN_HREF}
      docs={[
        { label: "skill.md", href: `${origin}/skill.md` },
        { label: "mcp.md", href: `${origin}/mcp.md` },
        { label: "llms.txt", href: "/llms.txt" },
      ]}
    >
      <header className="pt-16 sm:pt-20">
        <HeroScene
          src="/brand/hero.jpg"
          alt="Silicon presents a finished page to three attentive meat sacks."
          eyebrow={HERO.eyebrow}
          title={SITE_TAGLINE}
          description={SITE_DESCRIPTION}
        >
          <HomeLanding
            mcpUrl={mcpUrl}
            cursorHref={cursorInstallPageHref(mcpUrl)}
            pluginHref={CURSOR_PLUGIN_HREF}
          />
        </HeroScene>

        <Seam
          wireLabel="one link"
          personLabel="s.showmeatsack.com"
          agent={AGENT_SAMPLE.map(([className, text], index) => (
            <span key={index} className={className}>
              {text}
            </span>
          ))}
          person={
            <>
              <div className="mb-4 h-3 w-[58%] rounded bg-muted-foreground/50" />
              <div className="mb-2.5 h-2 w-full rounded bg-muted" />
              <div className="mb-2.5 h-2 w-[88%] rounded bg-muted" />
              <div className="my-4 flex h-[74px] items-end gap-1.5" aria-hidden="true">
                {CHART_BARS.map((height, index) => (
                  <span
                    key={height}
                    className="meatsack-bar flex-1 rounded-t bg-primary/85"
                    style={{
                      height: `${height}%`,
                      animationDelay: `${0.05 + index * 0.06}s`,
                    }}
                  />
                ))}
              </div>
              <div className="h-2 w-[64%] rounded bg-muted" />
            </>
          }
        />
      </header>

      <section className="pt-20 sm:pt-24">
        <SectionLabel>How it goes</SectionLabel>
        <Steps steps={HERO.steps} />
      </section>

      <section className="pt-20 sm:pt-24">
        <SectionLabel>What people use it for</SectionLabel>
        <UseCases cases={USE_CASES} />
      </section>

      <section className="pt-20 sm:pt-24">
        <SectionLabel>Or just curl it</SectionLabel>
        <CurlBlock endpoint="POST /api/v1/shares" curl={curl} />
      </section>
    </SiteShell>
  );
}
