import { zipSync, strToU8 } from "fflate";
import { describe, expect, it } from "vitest";
import { SHARE_MAX_BYTES } from "./schema";
import { createCapFilter, htmlAsSite, unpackZipSite } from "./zip-site";

function zipBytes(files: Record<string, string | Uint8Array>): Uint8Array {
  const encoded: Record<string, Uint8Array> = {};
  for (const [path, content] of Object.entries(files)) {
    encoded[path] = typeof content === "string" ? strToU8(content) : content;
  }
  return zipSync(encoded);
}

describe("htmlAsSite", () => {
  it("wraps a single HTML body as index.html", () => {
    const result = htmlAsSite("<p>Hi</p>");
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.path).toBe("index.html");
    expect(new TextDecoder().decode(result.files[0]?.bytes)).toBe("<p>Hi</p>");
  });

  it("refuses empty HTML", () => {
    expect(htmlAsSite("")).toEqual({ ok: false, message: "HTML is empty." });
  });

  it("keeps script tags in the uploaded HTML", () => {
    const html = `<script src="https://evil.example/x.js"></script>`;
    const result = htmlAsSite(html);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(new TextDecoder().decode(result.files[0]?.bytes)).toBe(html);
  });
});

describe("unpackZipSite", () => {
  it("accepts a root index.html and sibling files", () => {
    const result = unpackZipSite(
      zipBytes({
        "index.html": "<p>Home</p>",
        "app.js": "console.log(1)",
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.files.map((file) => file.path).sort()).toEqual([
      "app.js",
      "index.html",
    ]);
  });

  it("accepts index.html inside a single wrapping folder", () => {
    const result = unpackZipSite(
      zipBytes({
        "site/index.html": "<p>Wrapped</p>",
        "site/style.css": "p{}",
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.files.map((file) => file.path).sort()).toEqual([
      "index.html",
      "style.css",
    ]);
  });

  it("refuses a zip with no index.html", () => {
    const result = unpackZipSite(zipBytes({ "readme.txt": "hi" }));
    expect(result).toEqual({
      ok: false,
      message: "Zip must include index.html.",
    });
  });

  it("refuses a zip whose only index is inside two folders", () => {
    const result = unpackZipSite(
      zipBytes({
        "a/b/index.html": "<p>Too deep</p>",
        "a/c/note.txt": "no",
      }),
    );
    expect(result.ok).toBe(false);
  });

  it("refuses a path that leaves the site", () => {
    const result = unpackZipSite(
      zipBytes({
        "index.html": "<p>Home</p>",
        "../secret.txt": "nope",
      }),
    );
    expect(result).toEqual({
      ok: false,
      message: "Zip contains a path that leaves the site.",
    });
  });

  it("refuses a nested parent-segment path", () => {
    const result = unpackZipSite(
      zipBytes({
        "index.html": "<p>Home</p>",
        "css/../../outside.css": "p{}",
      }),
    );
    expect(result).toEqual({
      ok: false,
      message: "Zip contains a path that leaves the site.",
    });
  });

  it("refuses a NUL in a zip path", () => {
    const result = unpackZipSite(
      zipBytes({
        "index.html": "<p>Home</p>",
        "ok\0.js": "alert(1)",
      }),
    );
    expect(result).toEqual({
      ok: false,
      message: "Zip contains a path that leaves the site.",
    });
  });

  it("refuses an empty zip", () => {
    expect(unpackZipSite(new Uint8Array())).toEqual({
      ok: false,
      message: "Zip is empty.",
    });
  });

  it("refuses bytes that are not a zip", () => {
    expect(unpackZipSite(strToU8("not a zip"))).toEqual({
      ok: false,
      message: "That is not a usable zip.",
    });
  });

  it("refuses a zip that expands past 5 MB", () => {
    const result = unpackZipSite(
      zipBytes({
        "index.html": "<p>ok</p>",
        "blob.bin": new Uint8Array(SHARE_MAX_BYTES + 1),
      }),
    );
    expect(result).toEqual({
      ok: false,
      message: "Share is larger than 5 MB.",
    });
  });

  it("skips macOS junk and still accepts the real index", () => {
    const result = unpackZipSite(
      zipBytes({
        "index.html": "<p>Real</p>",
        ".DS_Store": "junk",
        "__MACOSX/._index.html": "junk",
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.files.map((file) => file.path)).toEqual(["index.html"]);
  });

  it("refuses a zip that is only skipped junk", () => {
    const result = unpackZipSite(
      zipBytes({
        ".DS_Store": "junk",
        "__MACOSX/index.html": "<p>No</p>",
      }),
    );
    expect(result).toEqual({ ok: false, message: "Zip has no files." });
  });

  it("keeps script files next to the page", () => {
    const result = unpackZipSite(
      zipBytes({
        "index.html": `<script src="app.js"></script>`,
        "app.js": "document.cookie",
      }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    const script = result.files.find((file) => file.path === "app.js");
    expect(script).toBeDefined();
    expect(new TextDecoder().decode(script?.bytes)).toBe("document.cookie");
  });
});

describe("A zip bomb is refused before it is expanded", () => {
  it("refuses an archive that would expand past the cap", () => {
    // Highly compressible: ~40 MB of zeroes packs down to a few kilobytes, so
    // the archive itself passes the byte-length check and only the declared
    // size gives it away.
    const bomb = zipBytes({
      "index.html": "<h1>Hi</h1>",
      "payload.bin": new Uint8Array(SHARE_MAX_BYTES * 8),
    });
    expect(bomb.byteLength).toBeLessThan(SHARE_MAX_BYTES);

    const result = unpackZipSite(bomb);
    expect(result).toEqual({
      ok: false,
      message: "Share is larger than 5 MB.",
    });
  });

  it("refuses when many small entries add up past the cap", () => {
    const files: Record<string, Uint8Array | string> = {
      "index.html": "<h1>Hi</h1>",
    };
    for (let n = 0; n < 12; n += 1) {
      files[`chunk-${n}.bin`] = new Uint8Array(SHARE_MAX_BYTES / 2);
    }
    expect(unpackZipSite(zipBytes(files))).toEqual({
      ok: false,
      message: "Share is larger than 5 MB.",
    });
  });

  it("still accepts a site that fits", () => {
    const result = unpackZipSite(
      zipBytes({
        "index.html": "<h1>Hi</h1>",
        "style.css": "body{color:red}",
      }),
    );
    expect(result.ok).toBe(true);
  });
});

describe("The cap is applied before anything is decompressed", () => {
  function entry(name: string, originalSize: number) {
    return { name, size: 1, originalSize, compression: 8 } as Parameters<
      ReturnType<typeof createCapFilter>["filter"]
    >[0];
  }

  it("lets entries through while they fit", () => {
    const cap = createCapFilter(1000);
    expect(cap.filter(entry("a.bin", 400))).toBe(true);
    expect(cap.filter(entry("b.bin", 400))).toBe(true);
    expect(cap.exceeded()).toBe(false);
  });

  it("refuses the entry that crosses the cap, and every one after it", () => {
    const cap = createCapFilter(1000);
    expect(cap.filter(entry("a.bin", 900))).toBe(true);
    expect(cap.filter(entry("b.bin", 200))).toBe(false);
    expect(cap.exceeded()).toBe(true);
    // Nothing more is decompressed once the archive is known to be over.
    expect(cap.filter(entry("c.bin", 1))).toBe(false);
  });

  it("refuses a single entry that is over the cap on its own", () => {
    const cap = createCapFilter(1000);
    expect(cap.filter(entry("bomb.bin", 5_000_000_000))).toBe(false);
    expect(cap.exceeded()).toBe(true);
  });

  it("does not count entries it would skip anyway", () => {
    const cap = createCapFilter(1000);
    expect(cap.filter(entry("__MACOSX/junk", 5000))).toBe(false);
    expect(cap.filter(entry(".DS_Store", 5000))).toBe(false);
    expect(cap.exceeded()).toBe(false);
    expect(cap.declared()).toBe(0);
  });
});
