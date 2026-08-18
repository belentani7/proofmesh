import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const ci = readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
const prGate = readFileSync(new URL("../.github/workflows/pr-gate.yml", import.meta.url), "utf8");

describe("GitHub workflow configuration", () => {
  it("uses the packageManager field as the single pnpm version source", () => {
    expect(ci).toContain("pnpm/action-setup@v4");
    expect(ci).not.toContain("version: 10");
    expect(prGate).toContain("pnpm/action-setup@v4");
    expect(prGate).not.toContain("version: 10");
  });
});
