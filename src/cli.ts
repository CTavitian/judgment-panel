#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { runPanel } from "./router.js";
import type { CaseInput, PanelConfig } from "./types.js";

function usage(): never {
  console.log(`Usage: judgment-panel --case <file.json> [--panel panels/default.yaml] [--out report.json]`);
  process.exit(1);
}

function argValue(args: string[], flag: string): string | undefined {
  const i = args.indexOf(flag);
  return i === -1 ? undefined : args[i + 1];
}

async function main() {
  const args = process.argv.slice(2);
  const casePath = argValue(args, "--case");
  if (!casePath) usage();
  const panelPath = argValue(args, "--panel") ?? "panels/default.yaml";
  const out = argValue(args, "--out") ?? "reports/panel-latest.json";

  const c = JSON.parse(await readFile(path.resolve(casePath!), "utf8")) as CaseInput;
  const config = parseYaml(await readFile(path.resolve(panelPath), "utf8")) as PanelConfig;
  const { decision, ledger } = runPanel(c, config, "2026-10-07T01:00:00+11:00");

  await mkdir(path.dirname(path.resolve(out)), { recursive: true });
  await writeFile(path.resolve(out), JSON.stringify({ decision, ledger }, null, 2) + "\n");

  console.log(`${decision.outcome.toUpperCase()}\t${decision.case_id}\tdisagreement=${decision.disagreement}`);
  for (const b of decision.ballots) {
    console.log(`  ${b.judge}\t${b.vote}\t${b.rationale}`);
  }
  console.log(`ledger=${decision.ledger_entry_id}`);
  console.log(`Report: ${path.resolve(out)}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
