import { describe, expect, it } from "vitest";
import { CRITERIA, evaluateAudit } from "./auditEngine";

const description = "Backend frontend utility relevance potential identity. Security risk impact has explicit enough details for policy evaluation and captures expected changes.";

describe("audit criteria selection", () => {
  it("rejects a repeated criterion even when the list has six entries", () => {
    const report = evaluateAudit({
      name: "Test change",
      description,
      code: "function safe() { return 1; }",
      selectedCriteria: Array(6).fill("backend") as Array<(typeof CRITERIA)[number]>,
    });
    expect(report.status).toBe("rejected");
    for (const criterion of report.criteria) {
      expect(criterion.nodes["node-a"].find(check => check.level === "policy")?.passed).toBe(false);
    }
  });

  it("accepts complete, unique criteria as a policy prerequisite", () => {
    const report = evaluateAudit({
      name: "Test change",
      description,
      code: "function safe() { return 1; }",
      selectedCriteria: [...CRITERIA],
    });
    for (const criterion of report.criteria) {
      expect(criterion.nodes["node-a"].find(check => check.level === "policy")?.passed).toBe(true);
    }
  });
});
