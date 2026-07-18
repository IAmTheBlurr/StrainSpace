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

## ADR-009: Relation-specific mathematical type system

**Status:** Accepted
**Date:** 2026-07-15

**Decision:** Use compact field-specific schema-v1 fixtures and distinct branded runtime quantity types. Separate intrinsic domains from fixture ranges and operator-support ranges. Keep exact canonical rationals authoritative. Model D6 requirements as `2..6 | "impossible"` on the wire and a tagged runtime union. Implement only the static `power-resilience-v1` relation, with exact ratio as its authoritative coordinate, indexed difference as a diagnostic, and logarithmic ratio as an approximate display view.

**Reason:** Shared JavaScript representation does not imply shared mathematics. Relation-specific signatures prevent invalid arithmetic while preserving the research premise that quantities may acquire multiple future roles through explicit operators.

**Alternatives:** Fully tagged JSON quantities, a universal scalar wrapper, generic pair arithmetic, a runtime relation plugin system, or keeping unbranded numbers throughout the engine.

**Consequences:** Valid values outside a clean operator's supported range fail as unsupported computations rather than invalid domain values. Power and resilience retain fixed roles. Exact efficiency replaces floating comparison. Unsupported rule-operator contexts fail explicitly. A temporary legacy fixture adapter is removed before milestone closure.

**Evidence:** `docs/product/MATHEMATICAL_TYPE_SYSTEM.md`, compile-time type tests, exact migration-equivalence oracles, and the geometry-engine property suite.

## ADR-010: SvelteKit three-dimensional analysis space

**Status:** Accepted
**Date:** 2026-07-17

**Decision:** Supersede the React/Vite presentation choice in ADR-008 with a SvelteKit static application whose primary analysis surface is rendered with Three.js. Represent the coverage matrix as selectable towers and place pair detail, threshold regions, the exact D6 outcome space, effect distributions, and structural-hole markers within the same navigable scene. Keep native HTML force selectors, counterfactual controls, loading/empty/error states, and a screen-reader coverage table as a small semantic companion.

**Reason:** StrainSpace's central product claim is relational and geometric. A single spatial field makes the path from pair capability to threshold, finite outcomes, and holes directly inspectable while the semantic companion preserves keyboard and assistive-technology access.

**Alternatives:** Preserve the two-dimensional React dashboard, use plain Svelte without application routing, or render every control and label into WebGL textures.

**Consequences:** `apps/web` now depends on SvelteKit and Three.js and ships a larger client bundle. CSS2D labels are positioned by the Three.js scene but remain real text. WebGL is never authoritative: validated fixtures and deterministic package outputs are transformed into a serializable scene model, and counterfactual recomputation still runs through `geometry-engine`. No mathematical type-system, model, database, authentication, deployment, or persistence work is introduced.

**Evidence:** `apps/web/src/presentation.ts`, `apps/web/src/lib/StrainSpaceScene.svelte`, the Svelte integration suite, and a local browser pass covering WebGL startup and seeded-hole closure.

## ADR-011: Static SvelteKit artifact behind a Sites asset worker

**Status:** Accepted
**Date:** 2026-07-17

**Decision:** Publish the prerendered SvelteKit application through Codex Sites. Stage the static application under `dist/client` and use a minimal Cloudflare-compatible worker at `dist/server/index.js` to serve the Sites asset binding and replace the social-image origin placeholder with the incoming request origin.

**Reason:** The current product is a deterministic, single-route, client-side Three.js application. Static output preserves its existing architecture and requires no server state, while the thin worker satisfies the Sites deployment contract and produces correct absolute social-preview URLs without hard-coding an environment hostname.

**Alternatives:** Migrate the application to the vinext starter, add a SvelteKit server adapter, or hard-code the first Sites hostname in generated HTML.

**Consequences:** Sites hosting remains a presentation concern with no effect on fixture validation or mathematical operators. The worker depends only on the platform-provided `ASSETS` binding. `.openai/hosting.json` stores only the opaque Sites project identifier; source credentials and deployment artifacts remain untracked.

**Evidence:** `.openai/hosting.json`, `apps/web/sites-worker.mjs`, `scripts/prepare-sites-build.ts`, the Sites artifact smoke test, and the generated Open Graph card.
