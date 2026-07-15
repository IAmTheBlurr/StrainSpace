# Architecture Decision Log

Use append-only entries. Never silently rewrite a settled decision. Mark superseded entries and link replacements.

## ADR-001: Deterministic mathematical core

**Status:** Accepted

**Decision:** Arithmetic, probability, threshold mapping, enumeration, coverage, and hole detection live in deterministic code.

**Reason:** Exactness, reproducibility, testability, and explanation grounding.

**Consequence:** Model output cannot serve as calculator of record.

## ADR-002: Immutable research handoff

**Status:** Accepted

**Decision:** Preserve `docs/handoff/` as an archive with original names and checksums.

**Reason:** Provenance and stable context for future models.

**Consequence:** Product documents link to archival sources instead of moving or renaming them.

## ADR-003: Generic proxy domain

**Status:** Accepted

**Decision:** Use original branding and generic proxy identifiers across tracked code, fixtures, UI, and demonstration media.

**Reason:** Product independence and reduced intellectual-property risk.

**Consequence:** Private provenance maps remain excluded from Git.

## ADR-004: Finite and piecewise mathematics first

**Status:** Accepted

**Decision:** Use finite sample spaces, graphs, threshold partitions, piecewise maps, and exact stochastic operators before smooth geometric abstractions.

**Reason:** The implemented domain is discrete and rule-governed.

**Consequence:** Differential geometry remains a later relaxation or local analysis tool.

## ADR template

```text
## ADR-NNN: Title

Status: Proposed | Accepted | Rejected | Superseded
Date: YYYY-MM-DD

Decision:

Reason:

Alternatives:

Consequences:

Evidence:
```

## ADR-005: pnpm strict TypeScript workspace

**Status:** Accepted
**Date:** 2026-07-14

**Decision:** Use pnpm 11.13.0 workspaces with strict shared TypeScript configuration. Keep `geometry-engine` free of UI-framework dependencies and reserve `explanation-engine` without premature model interfaces.

**Reason:** Workspace dependency boundaries keep the mathematical kernel reusable while one lockfile and one command surface support hackathon iteration.

**Alternatives:** npm workspaces, Turborepo orchestration, or a single application package.

**Consequences:** Packages compile independently; web code consumes public package exports; model integration remains deferred.

**Evidence:** `pnpm-workspace.yaml`, `tsconfig.base.json`, package manifests, and root quality scripts.

## ADR-006: Exact rational finite projection domain

**Status:** Accepted
**Date:** 2026-07-14

**Decision:** Represent probabilities as safe-integer rational pairs and bound an MVP attack profile to at most six attacks. Enumerate every D6 face at each gate, compose clean independent gates exactly, and derive repeated-attack distributions with exact binomial convolution.

**Reason:** Exact rational output is auditable and matches the finite sample-space research model. The six-attack bound keeps every serialized numerator and denominator inside JavaScript's safe-integer domain.

**Alternatives:** Floating-point probabilities, string-encoded arbitrary precision, or unrestricted attack counts.

**Consequences:** Probabilities remain exact inside the declared MVP domain. Larger counts or coupled operators require an arbitrary-precision serialization decision.

**Evidence:** `packages/geometry-engine/src/rational.ts`, `dice.ts`, `projection.ts`, exhaustive enumeration tests, and [Pair Geometry and Dice Projections](../handoff/04_PAIR_GEOMETRY_AND_DICE_PROJECTIONS.md).

## ADR-007: Explicit coverage and efficiency criteria

**Status:** Accepted
**Date:** 2026-07-14

**Decision:** Define default coverage as at least a one-half exact probability of removing one target model in one clean activation. Define initial efficiency as expected applied damage per 100 source cost. Detect an absolute hole when no source entity covers a target region; detect an efficiency hole only when a viable response exists but every response misses the selected efficiency floor.

**Reason:** Both labels need observable capability functions, thresholds, and assumptions. The selected measures support the vertical slice without implying a complete strategic value model.

**Alternatives:** Expected damage alone, target-health fraction, or points-trade simulation.

**Consequences:** Range, mobility, control, opportunity cost, and downstream state effects are excluded and must not be inferred from the result.

**Evidence:** `fixtures/coverage-criterion.json`, `packages/geometry-engine/src/coverage.ts`, and `docs/product/IMPLEMENTED_MATHEMATICS.md`.

## ADR-008: Synthetic fixtures and local interactive slice

**Status:** Accepted
**Date:** 2026-07-14

**Decision:** Use two independently authored four-entity proxy forces and one explicit replacement profile. Ship the first product as a local React/Vite application with loading, empty, success, and error states.

**Reason:** A small deterministic fixture is sufficient to seed, expose, and close a known structural hole without importing protected expression or a complete commercial rules system.

**Alternatives:** A live data service, a larger fixture library, or model-generated profiles.

**Consequences:** The demonstration is deliberately synthetic and not a balance claim about any external game.

**Evidence:** `fixtures/`, `apps/web/`, integration tests, and the automated fixture/IP scan.
