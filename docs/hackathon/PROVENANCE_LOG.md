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

## Milestone: Mathematical type system and schema v1

**Date:** 2026-07-15

**Commits:** `a2bde77` decisions and equivalence oracles; `a856676` semantic schemas and exact carriers; `0463c0d` relation and finite-dice operators; `c30639a` typed clean analysis and exact efficiency; `047aabd` fixture/web migration; `d2e4988` compatibility removal; closure evidence in the commit containing this entry.

**Primary Codex thread:** Current mathematical type-system implementation thread

**Human contribution:** Approved the mathematical direction; required separation of intrinsic domains, fixture ranges, and implementation support; narrowed the relation, serialization, provenance, uncertainty, UI, hole, and counterfactual scope; specified migration, testing, commit, clean-clone, and remote-parity acceptance criteria.

**Codex contribution:** Implemented distinct branded quantities, explicit support refinements and errors, canonical exact rational arithmetic, compact/tagged D6 requirements, the static `power-resilience-v1` relation, exact finite clean analysis, conservation, exact efficiency and dimensioned hole gaps, schema-v1 public fixtures, narrow typed web consumption, committed per-cell equivalence oracles, strict legacy rejection, and closure documentation.

**GPT-5.6 runtime contribution:** None. Model integration remains outside this milestone; deterministic TypeScript owns all arithmetic and executable operators.

**Files changed:** Focused product/data documents; `packages/rule-schema`; `packages/geometry-engine`; all four public fixture-document kinds; narrow `apps/web` consumers; tests and equivalence data. The archival handoff remains unchanged.

**Tests and evidence:** Compile-time brand rejection; exhaustive D6 catalog and 216-path checks; canonical rational and representation-bound tests; power-resilience boundaries, monotonicity, scaling, explicit duality, exact ratio, and approximate log tests; support/rule-context distinction; distribution normalization, expectation, allocation, conservation, coverage, exact efficiency, hole, and Phase Lance tests; strict version/field/legacy rejection; all baseline and replacement cells match the committed oracle; full local, clean-clone, and remote-parity gates are required before push.

**Known limitations:** Only `power-resilience-v1`; clean independent fixed-damage profiles with at most six attacks; no executable rule operators; no uncertainty propagation; no generalized relation, dimensional, algebra, conversion, counterfactual, provenance, digest, cache, or persistence framework; no movement, terrain, deployment, victory-point, model, database, authentication, or visualization redesign work.
