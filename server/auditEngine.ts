import crypto from "node:crypto";

export const CRITERIA = ["backend", "frontend", "utility", "relevance", "potential", "identity"] as const;
export const LEVELS = ["integrity", "policy", "risk"] as const;
export const NODES = ["node-a", "node-b", "node-c"] as const;

export type Criterion = (typeof CRITERIA)[number];
export type Level = (typeof LEVELS)[number];
export type NodeId = (typeof NODES)[number];

type LevelResult = { level: Level; passed: boolean; score: number; evidence: string };
type CriterionResult = { criterion: Criterion; score: number; passed: boolean; nodes: Record<NodeId, LevelResult[]> };

export type AuditReport = {
  executionMode: "deterministic-local";
  payloadHash: string;
  globalScore: number;
  status: "approved" | "rejected";
  criteria: CriterionResult[];
  approverNodes: NodeId[];
  rejectionReason: string | null;
  createdAt: string;
};

const hashPayload = (payload: unknown) => crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
const blockedPatterns = /eval\s*\(|rm\s+-rf|drop\s+table|private[_ -]?key|api[_ -]?key|password\s*=/i;

function result(level: Level, passed: boolean, evidence: string): LevelResult {
  return { level, passed, score: passed ? 10 : 0, evidence };
}

function nodeLevelCheck(node: NodeId, level: Level, criterion: Criterion, input: { name: string; description: string; code: string; selectedCriteria: Criterion[] }, payloadHash: string): LevelResult {
  const code = input.code.trim();
  const description = input.description.trim();
  const criterionMentioned = new RegExp(`\\b${criterion}\\b`, "i").test(`${description} ${code}`);
  if (level === "integrity") {
    const passed = node === "node-a" ? input.name.trim().length >= 2 && payloadHash.length === 64 : node === "node-b" ? code.length > 0 && code.length <= 500000 : code.split("\n").length <= 5000;
    return result(level, passed, passed ? `${node} confirmó integridad: payload hash ${payloadHash.slice(0, 16)}…` : `${node} rechazó integridad: contenido, hash o volumen inválido`);
  }
  if (level === "policy") {
    const passed = node === "node-a" ? input.selectedCriteria.length === CRITERIA.length : node === "node-b" ? description.length >= 80 : criterionMentioned;
    return result(level, passed, passed ? `${node} confirmó política para ${criterion}` : `${node} rechazó política para ${criterion}: falta cobertura explícita`);
  }
  const safe = !blockedPatterns.test(input.code);
  const passed = node === "node-a" ? safe : node === "node-b" ? /riesgo|impacto|seguridad|risk/i.test(description) : safe && code.length <= 500000;
  return result(level, passed, passed ? `${node} confirmó riesgo controlado para ${criterion}` : `${node} rechazó riesgo para ${criterion}: evidencia insuficiente o patrón peligroso`);
}

export function evaluateAudit(input: { name: string; description: string; code: string; selectedCriteria: Criterion[] }): AuditReport {
  const payloadHash = hashPayload(input);
  const criteria = CRITERIA.map(criterion => {
    const nodes = Object.fromEntries(NODES.map(node => [node, LEVELS.map(level => nodeLevelCheck(node, level, criterion, input, payloadHash))])) as Record<NodeId, LevelResult[]>;
    const checks = NODES.flatMap(node => nodes[node]);
    const score = Math.round(checks.reduce((sum, check) => sum + check.score, 0) / checks.length);
    return { criterion, score, passed: checks.every(check => check.passed), nodes };
  });
  const allPassed = criteria.every(item => item.passed && item.score === 10);
  const globalScore = Math.round(criteria.reduce((sum, item) => sum + item.score, 0) / CRITERIA.length);
  const approverNodes = allPassed ? [...NODES] : [];
  return {
    executionMode: "deterministic-local",
    payloadHash,
    globalScore,
    status: allPassed ? "approved" : "rejected",
    criteria,
    approverNodes,
    rejectionReason: allPassed ? null : "El gate estricto exige 10/10 en los seis criterios, los tres niveles y los tres nodos.",
    createdAt: new Date().toISOString(),
  };
}
