import type { Step, UseCase } from "@/components/home-sections";

/** The words. Everything structural lives in the shared components. */

export const HERO = {
  eyebrow: "MCP · Skill · HTTP",
  steps: [
    {
      n: "Step 1",
      heading: "The agent publishes",
      body: "Post the HTML, or a zip of a small static site. One call, one view link, and a manage token kept out of the URL.",
    },
    {
      n: "Step 2",
      heading: "You open the link",
      body: "It is the page itself, not a preview of it. Layout, charts, interaction — all of it, on a phone or a laptop.",
    },
    {
      n: "Step 3",
      heading: "Replace it or bin it",
      body: "The manage token swaps the content in place or deletes it. Otherwise the share expires on its own.",
    },
  ] satisfies Step[],
};

export const USE_CASES: UseCase[] = [
  {
    tag: "Long output",
    heading: "Read it as a page",
    body: "Four thousand words of research is unreadable in a chat pane. It is fine as a page with headings.",
    quote: "“Here is the write-up →”",
  },
  {
    tag: "Review",
    heading: "Look at the build",
    body: "The agent posts the built static site so you can open it on your phone before anything deploys.",
  },
  {
    tag: "Incident",
    heading: "Share the postmortem",
    body: "A formatted timeline with a link you can drop straight into the channel, no repo access needed.",
  },
  {
    tag: "Data",
    heading: "Show the chart",
    body: "The agent drew a graph. Describing it in tokens is worse than sending it, so send it.",
  },
  {
    tag: "Options",
    heading: "Three directions, three links",
    body: "Generate the landing page variants, publish all three, and let a person pick by looking.",
  },
  {
    tag: "Disposable",
    heading: "A tool that expires",
    body: "A one-off calculator or log viewer that does its job and disappears in thirty days.",
  },
];

/** A sample tool call, tagged rather than interpolated so it cannot be markup. */
export const AGENT_SAMPLE: [string, string][] = [
  ["text-machine-muted", "// the agent has something to show\n"],
  ["text-machine-muted", "{\n  "],
  ["text-sky-300", '"html"'],
  ["text-machine-muted", ": "],
  ["text-emerald-300", '"<h1>Q3 spend</h1>…"'],
  ["text-machine-muted", ",\n  "],
  ["text-sky-300", '"expiresInSeconds"'],
  ["text-machine-muted", ": "],
  ["text-emerald-300", "2592000"],
  ["text-machine-muted", "\n}\n\n"],
  ["text-machine-muted", "// → "],
  ["text-emerald-300", '"https://s.showmeatsack.com/s/…"'],
];

/** Bar heights for the mock page in the person panel. */
export const CHART_BARS = [44, 68, 52, 88, 71, 100];
