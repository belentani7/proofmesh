import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const dbMock = vi.hoisted(() => ({
  createAudit: vi.fn().mockResolvedValue(42),
  listAudits: vi.fn().mockResolvedValue([]),
  getAuditById: vi.fn(),
}));

vi.mock("./db", () => dbMock);

function context(): TrpcContext {
  return {
    user: { id: 7, openId: "proofmesh-user", name: "ProofMesh User", email: "user@example.com", loginMethod: "test", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("audits router", () => {
  it("persists a strict rejection and returns its full report", async () => {
    const caller = appRouter.createCaller(context());
    const result = await caller.audits.create({ name: "Small change", description: "A concise change with risk context.", code: "const x = 1;", selectedCriteria: ["backend"] });
    expect(result.id).toBe(42);
    expect(result.report.status).toBe("rejected");
    expect(result.report.rejectionReason).toContain("10/10");
    expect(dbMock.createAudit).toHaveBeenCalledOnce();
  });

  it("returns a JSON object for pipeline consumers", async () => {
    dbMock.getAuditById.mockResolvedValueOnce({ reportJson: JSON.stringify({ status: "approved", globalScore: 10, criteria: [] }), userId: 7 });
    const caller = appRouter.createCaller(context());
    const result = await caller.audits.exportJson({ id: 42 });
    expect(result).toEqual({ status: "approved", globalScore: 10, criteria: [] });
    expect(typeof result).toBe("object");
  });
});
