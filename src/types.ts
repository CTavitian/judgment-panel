export type Vote = "commit" | "hold" | "block";

export interface CaseInput {
  id: string;
  action: string;
  irreversible: boolean;
  statutory: boolean;
  estimated_cost_aud: number;
  sla_risk: "low" | "medium" | "high";
  evidence: string[];
  /** Optional planted votes for fixture control; omit for rule judges */
  planted?: Partial<Record<JudgeId, Vote>>;
}

export type JudgeId = "policy" | "safety" | "cost_sla";

export interface JudgeBallot {
  judge: JudgeId;
  vote: Vote;
  rationale: string;
  evidence_refs: string[];
}

export interface PanelDecision {
  case_id: string;
  outcome: Vote | "escalate";
  ballots: JudgeBallot[];
  disagreement: boolean;
  ledger_entry_id: string;
  notes: string;
}

export interface PanelConfig {
  name: string;
  judges: JudgeId[];
  rules: {
    any_block_blocks: boolean;
    unanimous_commit_required: boolean;
    split_holds_and_escalates: boolean;
  };
}

export interface LedgerEntry {
  id: string;
  at: string;
  case_id: string;
  outcome: PanelDecision["outcome"];
  ballots: JudgeBallot[];
  notes: string;
}
