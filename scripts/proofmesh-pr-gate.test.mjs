import { describe, expect, it } from "vitest";
import { buildReport } from "./proofmesh-pr-gate.mjs";

describe("ProofMesh PR gate", () => {
  it("approves a non-empty diff under the strict local contract", () => {
    const report = buildReport("backend frontend utility relevance potential identity\n".repeat(20), "fixture-approved");
    expect(report.executionMode).toBe("deterministic-local");
    expect(report.status).toBe("approved");
    expect(report.globalScore).toBe(10);
    expect(report.approverNodes).toEqual(["node-a", "node-b", "node-c"]);
  });

  it("rejects an empty diff instead of fabricating a passing result", () => {
    const report = buildReport("", "fixture-rejected");
    expect(report.status).toBe("rejected");
    expect(report.globalScore).toBe(9);
    expect(report.approverNodes).toEqual([]);
  });
});
