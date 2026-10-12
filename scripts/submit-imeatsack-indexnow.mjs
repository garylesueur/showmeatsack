import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const origin = "https://imeatsack.com";
const key = (
  await readFile(
    fileURLToPath(new URL("../src/imeatsack/indexnow-key.txt", import.meta.url)),
    "utf8",
  )
).trim();
if (!/^[a-f0-9]{32}$/.test(key)) throw new Error("Invalid IndexNow ownership key.");
const keyLocation = `${origin}/${key}.txt`;

// Refuse to notify crawlers until the canonical HTTPS site and ownership proof are live.
const [home, proof] = await Promise.all([
  fetch(`${origin}/`, { redirect: "error", signal: AbortSignal.timeout(20000) }),
  fetch(keyLocation, { redirect: "error", signal: AbortSignal.timeout(20000) }),
]);
if (!home.ok || !proof.ok || (await proof.text()).trim() !== key) {
  throw new Error("Canonical site or IndexNow ownership proof is not publicly available.");
}
const html = await home.text();
if (!html.includes("I, Meatsack") || /name="robots"[^>]+content="[^"]*noindex/.test(html)) {
  throw new Error("The canonical site is not the indexable I, Meatsack landing page.");
}
const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: "imeatsack.com", key, keyLocation, urlList: [`${origin}/`] }),
  signal: AbortSignal.timeout(20000),
});
if (![200, 202].includes(response.status)) {
  throw new Error(`IndexNow submission failed: HTTP ${response.status}.`);
}
console.log(
  response.status === 200
    ? "IndexNow received the homepage submission (HTTP 200). Indexing is not guaranteed."
    : "IndexNow received the homepage submission; ownership validation is pending (HTTP 202).",
);
