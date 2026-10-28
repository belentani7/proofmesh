import { describe, expect, it } from "vitest";
import { buildReport } from "./proofmesh-pr-gate.mjs";

const evidence = "backend frontend utility relevance potential identity security risk impact controls";
const diffWith = (...lines) => [
  "diff --git a/src/app.ts b/src/app.ts",
  "--- a/src/app.ts",
  "+++ b/src/app.ts",
  "@@ -1 +1 @@",
  ...lines,
].join("\n");

describe("ProofMesh PR gate", () => {
  it("approves additions with explicit coverage under the deterministic local contract", () => {
    const report = buildReport(diffWith(`+${evidence}`, `+${evidence}`), "fixture-approved");
    expect(report.executionMode).toBe("deterministic-local");
    expect(report.status).toBe("approved");
    expect(report.globalScore).toBe(10);
    expect(report.approverNodes).toEqual(["node-a", "node-b", "node-c"]);
  });

  it("rejects an unrelated non-empty diff instead of inventing evidence", () => {
    const report = buildReport(diffWith("+const x = 1;"), "fixture-unrelated");
    expect(report.status).toBe("rejected");
    expect(report.approverNodes).toEqual([]);
  });

  it("does not treat deleted criteria as evidence for the new change", () => {
    const report = buildReport(diffWith(`-${evidence}`, "+fix typo"), "fixture-deletion");
    expect(report.status).toBe("rejected");
    expect(report.approverNodes).toEqual([]);
  });

  it("rejects risky additions despite complete criterion coverage", () => {
    const dangerous = "+e" + "val(";
    const report = buildReport(diffWith(`+${evidence}`, dangerous), "fixture-risk");
    expect(report.status).toBe("rejected");
    expect(report.approverNodes).toEqual([]);
  });

  it("rejects an empty diff instead of fabricating a passing result", () => {
    const report = buildReport("", "fixture-rejected");
    expect(report.status).toBe("rejected");
    expect(report.globalScore).toBeLessThan(10);
    expect(report.approverNodes).toEqual([]);
  });
});
