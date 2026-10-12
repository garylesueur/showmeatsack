// Share routes return standalone HTML, outside the React layout and its CSS.
// Keep these recovery screens in the existing cream / charcoal / kelp brand.
export function unavailableSharePage(kind: "expired" | "not_found"): string {
  const expired = kind === "expired";
  const title = expired ? "This share has expired." : "This page has wandered off.";
  const explanation = expired
    ? "Shared pages have a shelf life. This one has reached the end of its stay."
    : "We can’t find a page at this link. It may have reached the end of its shelf life, been removed, or the link may be incomplete.";

  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <meta name="theme-color" content="#f8f4e9">
  <title>${title} · show.imeatsack.com</title>
  <style>
    :root {
      color-scheme: light dark;
      font-family: "Geist", ui-sans-serif, system-ui, sans-serif;
      --paper: oklch(0.975 0.01 90);
      --ink: oklch(0.22 0.02 55);
      --quiet: oklch(0.48 0.02 55);
      --rule: oklch(0.88 0.02 80);
      --kelp: oklch(0.44 0.09 175);
      --on-kelp: oklch(0.98 0.01 90);
    }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--paper); color: var(--ink); }
    ::selection { background: var(--kelp); color: var(--on-kelp); }
    a { color: inherit; text-underline-offset: .25em; }
    a:focus-visible { outline: 3px solid var(--kelp); outline-offset: 5px; }
    .shell { max-width: 68rem; margin: 0 auto; padding: 0 2rem; }
    .skip { position: absolute; top: -5rem; left: 1rem; padding: .8rem; background: var(--paper); }
    .skip:focus { top: 1rem; }
    .site-nav { display: flex; align-items: center; min-height: 5.25rem; border-bottom: 1px solid var(--rule); }
    .wordmark { display: inline-flex; align-items: center; gap: .6rem; font-size: .9rem; font-weight: 650; text-decoration: none; letter-spacing: -.02em; }
    .wordmark::before { content: ""; width: .45rem; height: .45rem; border-radius: 50%; background: var(--kelp); }
    .recovery { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 2rem; padding: 4.5rem 0; }
    h1 { max-width: 12ch; margin: 0; font-size: clamp(2.5rem, 5vw, 4rem); font-weight: 650; line-height: 1.06; letter-spacing: -.035em; text-wrap: balance; }
    .explanation { max-width: 38ch; margin: 1.5rem 0 0; color: var(--quiet); font-size: 1.05rem; line-height: 1.65; }
    .next-step { max-width: 38ch; margin: 1rem 0 0; font-size: 1rem; line-height: 1.65; }
    .home { display: inline-flex; align-items: center; gap: .75rem; min-height: 3rem; margin-top: 1.75rem; padding: .8rem 1.1rem; border-radius: .75rem; background: var(--kelp); color: var(--on-kelp); font-size: .9rem; font-weight: 650; text-decoration: none; }
    .home:hover { text-decoration: underline; }
    .arrow { width: 1.1rem; height: 1.1rem; flex: none; }
    .scene { display: block; width: 100%; height: auto; border-radius: 1rem; }
    .discover { border-top: 1px solid var(--rule); padding: 2rem 0 3rem; }
    h2 { margin: 0; font-size: 1.25rem; font-weight: 600; letter-spacing: -.02em; }
    .intro { margin: .5rem 0 1.5rem; color: var(--quiet); font-size: .95rem; line-height: 1.6; }
    .products { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 2rem; }
    .product { display: block; padding: .5rem 0; text-decoration: none; }
    .product-name { display: flex; align-items: center; justify-content: space-between; gap: .5rem; font-size: 1rem; font-weight: 650; letter-spacing: -.02em; }
    .product .arrow { color: var(--kelp); }
    .product p { max-width: 28ch; margin: .6rem 0 0; color: var(--quiet); font-size: .9rem; line-height: 1.6; }
    .product:hover .product-name { color: var(--kelp); text-decoration: underline; }
    @media (max-width: 700px) {
      .shell { padding: 0 1.5rem; }
      .site-nav { min-height: 4.5rem; }
      .recovery { grid-template-columns: 1fr; gap: 2rem; padding: 2.75rem 0 2rem; }
      h1 { font-size: clamp(2.5rem, 10vw, 3.5rem); }
      .scene { width: min(26rem, 100%); margin: 0 auto; }
      .products { grid-template-columns: 1fr; gap: 0; }
      .product { padding: 1.25rem 0; }
      .product + .product { border-top: 1px solid var(--rule); }
      .product p { max-width: 40ch; }
      .discover { padding-bottom: 1.5rem; }
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --paper: oklch(0.2 0.012 80);
        --ink: oklch(0.96 0.01 90);
        --quiet: oklch(0.74 0.02 80);
        --rule: oklch(1 0 0 / 12%);
        --kelp: oklch(0.78 0.11 172);
        --on-kelp: oklch(0.2 0.012 80);
      }
    }
  </style>
</head>
<body>
  <a class="skip" href="#recovery">Skip to page message</a>
  <div class="shell">
    <nav class="site-nav" aria-label="Main navigation">
      <a class="wordmark" href="https://show.imeatsack.com">show.imeatsack.com</a>
    </nav>
    <main id="recovery" tabindex="-1">
      <section class="recovery" aria-labelledby="page-title">
        <div>
          <h1 id="page-title">${title}</h1>
          <p class="explanation">${explanation}</p>
          <p class="next-step">Still need it? Ask whoever sent you this link to publish it again and send you the new one.</p>
          <a class="home" href="https://show.imeatsack.com">Back to show.imeatsack.com ${arrow()}</a>
        </div>
        <img class="scene" src="/lost-meatsack.webp" width="1200" height="800" alt="A puzzled meat sack checks a map beside a signpost pointing in two directions.">
      </section>
      <section class="discover" aria-labelledby="discover-title">
        <h2 id="discover-title">More useful things for meat sacks.</h2>
        <p class="intro">A few ways to work with your agent.</p>
        <nav class="products" aria-label="Meatsack products">
          <a class="product" href="https://show.imeatsack.com">
            <span class="product-name">show.imeatsack.com ${arrow()}</span>
            <p>Give your agent’s pages, reports and ideas a link you can open.</p>
          </a>
          <a class="product" href="https://ask.imeatsack.com">
            <span class="product-name">ask.imeatsack.com ${arrow()}</span>
            <p>Your agent asks the questions. You supply the missing pieces.</p>
          </a>
          <a class="product" href="https://share.imeatsack.com">
            <span class="product-name">share.imeatsack.com ${arrow()}</span>
            <p>Send and collect files with your agent, all through one link.</p>
          </a>
        </nav>
      </section>
    </main>
  </div>
</body>
</html>`;
}

function arrow(): string {
  return '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>';
}
