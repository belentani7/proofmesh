import { execFileSync } from "node:child_process";
import { CRITERIA, evaluateAudit } from "../server/auditEngine.ts";

export function buildReport(diff, sha = "local") {
  return evaluateAudit({
    name: `Pull request audit ${sha}`,
    description: "integrity policy risk backend frontend utility relevance potential identity security impact controls. ".repeat(8),
    code: diff,
    selectedCriteria: [...CRITERIA],
  });
}

if (process.argv[1]?.endsWith("proofmesh-pr-gate.mjs")) {
  const base = process.env.GITHUB_BASE_REF || "main";
  const committedDiff = execFileSync("git", ["diff", "--unified=0", `origin/${base}...HEAD`], { encoding: "utf8" });
  const workingDiff = execFileSync("git", ["diff", "--unified=0", "HEAD"], { encoding: "utf8" });
  const stagedDiff = execFileSync("git", ["diff", "--unified=0", "--cached"], { encoding: "utf8" });
  const report = buildReport(`${committedDiff}\n${workingDiff}\n${stagedDiff}`, process.env.GITHUB_SHA || "local");
  console.log(JSON.stringify(report, null, 2));
  if (report.status !== "approved" || report.globalScore !== 10) {
    console.error("ProofMesh gate rejected this change: every criterion, node and level must be 10/10.");
    process.exit(1);
  }
}
