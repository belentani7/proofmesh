import { describe, expect, it } from "vitest";
import { CRITERIA, evaluateAudit } from "./auditEngine";

describe("evaluateAudit", () => {
  it("rejects a short or incomplete change with an explicit reason", () => {
    const report = evaluateAudit({
      name: "Tiny change",
      description: "A short change submitted for review.",
      code: "const x = 1;",
      selectedCriteria: ["backend"],
    });
    expect(report.status).toBe("rejected");
    expect(report.globalScore).toBeLessThan(10);
    expect(report.rejectionReason).toContain("10/10");
    expect(report.approverNodes).toEqual([]);
  });

  it("is deterministic for the same payload and evaluates all six criteria", () => {
    const input = {
      name: "Complete backend frontend utility relevance potential identity change",
      description: "A detailed change with evidence for backend frontend utility relevance potential and identity criteria. ".repeat(8),
      code: ("backend frontend utility relevance potential identity ").repeat(80),
      selectedCriteria: [...CRITERIA],
    } as const;
    const first = evaluateAudit(input);
    const second = evaluateAudit(input);
    expect(first.payloadHash).toBe(second.payloadHash);
    expect(first.criteria).toHaveLength(6);
    expect(first.criteria.every(item => item.nodes["node-a"].length === 3)).toBe(true);
  });
});


it("approves only a fully evidenced change at 10/10", () => {
  const report = evaluateAudit({
    name: "Backend frontend utility relevance potential identity release",
    description: "A long release with explicit backend frontend utility relevance potential identity coverage, security impact and risk controls. ".repeat(8),
    code: ("backend frontend utility relevance potential identity ").repeat(80),
    selectedCriteria: [...CRITERIA],
  });
  expect(report.status).toBe("approved");
  expect(report.globalScore).toBe(10);
  expect(report.approverNodes).toEqual(["node-a", "node-b", "node-c"]);
  expect(report.criteria.every(item => item.passed && item.score === 10)).toBe(true);
  expect(report.criteria.every(item => Object.values(item.nodes).every(levels => levels.every(level => level.passed && level.score === 10)))).toBe(true);
});
