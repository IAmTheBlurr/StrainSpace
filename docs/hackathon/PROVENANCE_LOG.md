# Provenance Log

## Pre-Build Week research

**Date:** Before implementation start

**Material:** Conceptual handoff under `docs/handoff/`

**Status:** Pre-existing research and theory notes

**Implementation:** None represented by the handoff archive

## Build Week bootstrap

**Date:** 2026-07-14

**Material:** Repository README, agent instructions, product scope, development path, data policy, hackathon checklist, and initial Codex instruction

**Status:** New project planning and governance material

## Milestone entry template

```text
## Milestone: Name

Date:
Commit:
Primary Codex thread:

Human contribution:

Codex contribution:

GPT-5.6 runtime contribution:

Files changed:

Tests and evidence:

Known limitations:
```

## Milestone: Deterministic foundation and visible vertical slice

**Date:** 2026-07-14

**Commit:** `7af1ec0406a6a8c70f920f1c18ab5034b9f194f1` (`feat: deliver deterministic analysis vertical slice`)

**Primary Codex thread:** Current Build Week implementation thread

**Human contribution:** Product goal, research handoff, bootstrap governance, milestone scope, and quality requirements.

**Codex contribution:** Normalized and checksum-verified the immutable handoff; established the pnpm TypeScript workspace; implemented schemas, exact finite operators, fixtures, coverage, hole detection, counterfactual replacement, tests, and the local web interface; documented implementation assumptions.

**GPT-5.6 runtime contribution:** None. Model integration is intentionally deferred; deterministic code owns all arithmetic and saved structures.

**Files changed:** Root workspace configuration; `packages/rule-schema`; `packages/geometry-engine`; reserved `packages/explanation-engine`; `fixtures`; `apps/web`; product mathematics and architecture decisions; this provenance entry.

**Tests and evidence:** 15 archive payload hashes match `docs/handoff/manifest.json`; 22 unit/property tests pass; 3 web integration tests pass; all 216 clean single-attack D6 paths match exact factorization; threshold boundaries and monotonicity pass; the Phase Lance replacement closes the seeded Bastion Prism absolute hole; format, lint, typecheck, build, schema export, and fixture/IP scan pass.

**Known limitations:** Clean independent fixed-damage sequence only; attack count capped at six; no special operators, movement, terrain, mission, deployment, policy, model integration, or external data; efficiency excludes opportunity cost and non-damage value; fixtures are synthetic demonstration data.
