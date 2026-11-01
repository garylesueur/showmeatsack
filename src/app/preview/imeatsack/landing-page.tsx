import Image from "next/image";
import { SiteFooter, SiteNav } from "@/components/site-chrome";
import { HeroSlideshow } from "./hero-slideshow";
import { LANDING_SIGN_IN_HREF } from "@/lib/imeatsack-site";
import styles from "./preview.module.css";

// Ask and Share are generated for this preview; their prompts live in image-prompts.json.
// Show keeps the existing artwork at public/brand/hero.jpg.
const tools = [
  {
    name: "Ask",
    heading: "A little human input. A lot more progress.",
    description:
      "When your agent needs context, a choice, or a missing detail, it sends a questionnaire. Someone opens the link, answers, and the work can move on.",
    image: "/preview/imeatsack/ask-v2.png",
    alt: "Silicon offers a questionnaire while two cloth-sack colleagues consider components for a rocket build.",
    href: "https://ask.imeatsack.com",
    domain: "ask.imeatsack.com",
    example: "Which direction should we take?",
    handoff: "The agent asks. A person answers.",
  },
  {
    name: "Share",
    heading: "The files go where they need to go.",
    description:
      "Send the finished files, or ask someone for the originals. They open a link to download or upload; your agent gets on with the work.",
    image: "/preview/imeatsack/share-v2.png",
    alt: "Two chip agents and two cloth-sack colleagues exchange folders of documents and photos across a table.",
    href: "https://share.imeatsack.com",
    domain: "share.imeatsack.com",
    example: "Send me the photos and the brief.",
    handoff: "Files out. Files back. One handoff.",
  },
  {
    name: "Show",
    heading: "Good work deserves more than a chat bubble.",
    description:
      "Give a report, chart, presentation, or small interactive site a page of its own. Your agent publishes it; someone opens the link and sees the work.",
    image: "/brand/hero.jpg",
    alt: "Silicon presents a finished page on a projection screen to three attentive cloth-sack colleagues.",
    href: "https://show.imeatsack.com",
    domain: "show.imeatsack.com",
    example: "Here’s the work. Have a look.",
    handoff: "The agent publishes. A person sees it.",
  },
];

function Arrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function LandingPage({ preview = false }: { preview?: boolean }) {
  return (
    <div className={`mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 sm:px-8 ${styles.page}`}>
      <SiteNav
        homeHref={preview ? "/preview/imeatsack" : "/"}
        installHref="#connect"
        accountHref={LANDING_SIGN_IN_HREF}
      />
      <main className="flex flex-1 flex-col">
        <header className={styles.hero}>
          <h1 className={styles.wordmark}>
            I<span className={styles.comma}>,</span> Meatsack
          </h1>
          <div className={styles.introduction}>
            <div className={styles.heroCopy}>
              <h2>Your agent needs a way to reach people.</h2>
              <p>
                Ask questions. Exchange files. Show the work. Three tools for the moments when
                software needs someone on the other end.
              </p>
              <p className={styles.signature}>Built by silicon. For the rest of us.</p>
            </div>
            <HeroSlideshow
              scenes={tools.map(({ name, image, alt, handoff }) => ({ name, image, alt, handoff }))}
            />
          </div>
          <div className={styles.manifesto}>
            <p>
              People bring the context.
              <br />
              Agents do the legwork.
            </p>
            <p>A link is where they meet.</p>
          </div>
        </header>

        <section className={styles.tools} aria-labelledby="tools-heading">
          <h2 id="tools-heading" className={styles.sectionHeading}>
            Three ways to keep
            <br />
            the work moving.
          </h2>
          {tools.map((tool) => (
            <article
              key={tool.name}
              className={styles.tool}
              aria-labelledby={`${tool.name.toLowerCase()}-heading`}
            >
              <figure className={styles.toolArt}>
                <Image
                  src={tool.image}
                  alt={tool.alt}
                  fill
                  sizes="(min-width: 1024px) 480px, (min-width: 768px) 50vw, calc(100vw - 48px)"
                />
                <figcaption>{tool.handoff}</figcaption>
              </figure>
              <div className={styles.toolCopy}>
                <h3 id={`${tool.name.toLowerCase()}-heading`}>
                  {tool.name}
                  <span className={styles.fullStop}>.</span>
                </h3>
                <p className={styles.toolHeading}>{tool.heading}</p>
                <p className={styles.description}>{tool.description}</p>
                <blockquote>
                  <span className={styles.exampleLabel}>Example handoff</span>“{tool.example}”
                </blockquote>
                <a className={styles.textLink} href={tool.href}>
                  Explore {tool.name}
                  <Arrow />
                </a>
              </div>
            </article>
          ))}
        </section>

        <section id="connect" className={styles.connect} aria-labelledby="connect-heading">
          <div className={styles.connectCopy}>
            <h2 id="connect-heading">
              Put your agent
              <br />
              in touch.
            </h2>
            <p>
              Pick the tool your agent needs. Each installation guide has the plugin and connection
              instructions.
            </p>
          </div>
          <div className={styles.installLinks}>
            {tools.map((tool) => (
              <a key={tool.name} href={`${tool.href}/install`}>
                <span>
                  <strong>Install {tool.name}</strong>
                  <small>{tool.domain}</small>
                </span>
                <Arrow />
              </a>
            ))}
          </div>
        </section>
        {preview ? (
          <p className={styles.previewNote}>
            Landing-page preview · Tool links open the existing sites.
          </p>
        ) : null}
      </main>
      <SiteFooter repoHref="https://github.com/garylesueur/meatsack-marketplace" docs={[]} />
    </div>
  );
}
