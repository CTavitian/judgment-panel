# judgment-panel

Route irreversible field-ops actions through a small panel of deterministic judges (policy, safety, cost/SLA). Votes are `commit`, `hold`, or `block`. Disagreement escalates — votes are never auto-merged into a silent yes.

## Why

A single LLM-as-judge is a single point of failure. Regulated ops needs disagreement visible, with an evidence ledger you can audit later.

## Router rules (default panel)

1. Any `block` → `block`
2. Unanimous `commit` → `commit`
3. Otherwise split → `escalate` (human lead)

## Setup

```bash
npm install
npm test
npm run decide -- --case fixtures/split-vote.json
```

## When not to auto-merge

If judges disagree on an irreversible or statutory action, stop. Average scores and majority-of-three hacks hide the conflict the panel exists to surface.

## Non-goals

- Not a live multi-model debate product
- Default judges are deterministic mocks for CI; swap adapters later if needed

## Licence

MIT
