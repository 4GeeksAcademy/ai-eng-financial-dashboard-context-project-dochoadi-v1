/// <reference types="node" />

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");

describe("frontend HTML document", () => {
  it("sets the dashboard title and preserves the existing document entries", () => {
    expect(html.match(/<title>[^<]*<\/title>/g)).toEqual([
      "<title>Financial Metrics Dashboard</title>",
    ]);
    expect(html).toContain('<html lang="en">');
    expect(html).toContain(
      '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />',
    );
    expect(html).toContain(
      '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    );
    expect(html).toContain('<div id="root"></div>');
    expect(html).toContain(
      '<script type="module" src="/src/main.tsx"></script>',
    );
  });
});
