import type { CaseInput, JudgeBallot, JudgeId, Vote } from "./types.js";

function planted(c: CaseInput, id: JudgeId): Vote | undefined {
  return c.planted?.[id];
}

export function policyJudge(c: CaseInput): JudgeBallot {
  const vote =
    planted(c, "policy") ??
    (c.statutory ? "block" : c.irreversible ? "hold" : "commit");
  return {
    judge: "policy",
    vote,
    rationale: c.statutory
      ? "Statutory action — policy judge blocks automation."
      : c.irreversible
        ? "Irreversible action — hold for explicit human authority."
        : "Within reversible policy envelope.",
    evidence_refs: c.evidence.filter((e) => e.startsWith("policy:")),
  };
}

export function safetyJudge(c: CaseInput): JudgeBallot {
  const unsafe = c.evidence.some((e) => e.includes("unsafe") || e.includes("skip-inspection"));
  const vote = planted(c, "safety") ?? (unsafe ? "block" : "commit");
  return {
    judge: "safety",
    vote,
    rationale: unsafe
      ? "Safety evidence indicates refuse-unsafe pattern."
      : "No hard safety refuse signal in evidence.",
    evidence_refs: c.evidence.filter((e) => e.startsWith("safety:")),
  };
}

export function costSlaJudge(c: CaseInput): JudgeBallot {
  let vote: Vote =
    planted(c, "cost_sla") ??
    (c.sla_risk === "high" || c.estimated_cost_aud >= 5000 ? "hold" : "commit");
  if (c.estimated_cost_aud >= 20000 && !planted(c, "cost_sla")) vote = "block";
  return {
    judge: "cost_sla",
    vote,
    rationale: `cost=${c.estimated_cost_aud} sla_risk=${c.sla_risk}`,
    evidence_refs: c.evidence.filter((e) => e.startsWith("cost:") || e.startsWith("sla:")),
  };
}

export const JUDGES: Record<JudgeId, (c: CaseInput) => JudgeBallot> = {
  policy: policyJudge,
  safety: safetyJudge,
  cost_sla: costSlaJudge,
};
