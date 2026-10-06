import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { describe, expect, it } from "vitest";
import { runPanel } from "../src/router.js";
import type { CaseInput, PanelConfig } from "../src/types.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

async function loadCase(name: string): Promise<CaseInput> {
  return JSON.parse(await readFile(path.join(root, "fixtures", name), "utf8")) as CaseInput;
}

async function loadPanel(): Promise<PanelConfig> {
  return parseYaml(await readFile(path.join(root, "panels/default.yaml"), "utf8")) as PanelConfig;
}

describe("judgment-panel", () => {
  it("unanimous commit", async () => {
    const { decision } = runPanel(await loadCase("unanimous-commit.json"), await loadPanel());
    expect(decision.outcome).toBe("commit");
    expect(decision.disagreement).toBe(false);
  });

  it("any block wins", async () => {
    const { decision } = runPanel(await loadCase("any-block.json"), await loadPanel());
    expect(decision.outcome).toBe("block");
  });

  it("split votes escalate", async () => {
    const { decision } = runPanel(await loadCase("split-vote.json"), await loadPanel());
    expect(decision.outcome).toBe("escalate");
    expect(decision.disagreement).toBe(true);
    expect(decision.notes.toLowerCase()).toContain("disagree");
  });

  it("safety refuse evidence blocks", async () => {
    const { decision } = runPanel(await loadCase("safety-block.json"), await loadPanel());
    expect(decision.outcome).toBe("block");
    expect(decision.ballots.find((b) => b.judge === "safety")?.vote).toBe("block");
  });

  it("writes evidence ledger id", async () => {
    const { decision, ledger } = runPanel(
      await loadCase("split-vote.json"),
      await loadPanel(),
      "2026-10-07T01:00:00+11:00",
    );
    expect(ledger.id).toBe(decision.ledger_entry_id);
    expect(ledger.ballots).toHaveLength(3);
  });
});
