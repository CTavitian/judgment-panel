import { createHash } from "node:crypto";
import { JUDGES } from "./judges.js";
import type {
  CaseInput,
  JudgeBallot,
  LedgerEntry,
  PanelConfig,
  PanelDecision,
  Vote,
} from "./types.js";

export function runPanel(
  c: CaseInput,
  config: PanelConfig,
  at = new Date().toISOString(),
): { decision: PanelDecision; ledger: LedgerEntry } {
  const ballots: JudgeBallot[] = config.judges.map((id) => JUDGES[id](c));
  const votes = ballots.map((b) => b.vote);
  const unique = new Set(votes);
  const disagreement = unique.size > 1;

  let outcome: PanelDecision["outcome"];
  let notes: string;

  if (config.rules.any_block_blocks && votes.includes("block")) {
    outcome = "block";
    notes = "Any block vetoes the panel.";
  } else if (
    config.rules.unanimous_commit_required &&
    votes.every((v) => v === "commit")
  ) {
    outcome = "commit";
    notes = "Unanimous commit.";
  } else if (unique.size === 1) {
    outcome = votes[0] as Vote;
    notes = `Unanimous ${outcome}.`;
  } else if (config.rules.split_holds_and_escalates) {
    outcome = "escalate";
    notes = "Judges disagree — hold path escalated to a human lead. Do not auto-merge votes.";
  } else {
    outcome = "hold";
    notes = "Disagreement without escalate rule — default hold.";
  }

  const ledger_entry_id = createHash("sha256")
    .update([c.id, at, outcome, JSON.stringify(ballots)].join("|"))
    .digest("hex")
    .slice(0, 16);

  const decision: PanelDecision = {
    case_id: c.id,
    outcome,
    ballots,
    disagreement,
    ledger_entry_id,
    notes,
  };

  const ledger: LedgerEntry = {
    id: ledger_entry_id,
    at,
    case_id: c.id,
    outcome,
    ballots,
    notes,
  };

  return { decision, ledger };
}
