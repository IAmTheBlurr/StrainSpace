# AGENTS.md

## Mission

Build StrainSpace as a rigorous, visually clear, testable geometric reasoning engine for tabletop force analysis.

The immediate deliverable is a hackathon-grade vertical slice, not a complete tabletop simulator.

## Read order

Before modifying code, read:

1. `README.md`
2. `docs/product/PRODUCT_BRIEF.md`
3. `docs/product/MVP_SCOPE.md`
4. `docs/product/DEVELOPMENT_PATH.md`
5. `docs/data/FIXTURE_DATA_POLICY.md`
6. `docs/data/DATASET_SCHEMA.md`
7. `docs/handoff/00_README_AND_HANDOFF.md`
8. `docs/handoff/02_FORMAL_MATHEMATICAL_FRAMEWORK.md`
9. `docs/handoff/03_GLOSSARY_AND_TERM_STATUS.md`
10. `docs/handoff/04_PAIR_GEOMETRY_AND_DICE_PROJECTIONS.md`
11. `docs/handoff/06_FALSIFIABLE_HYPOTHESES_AND_TESTS.md`
12. `docs/handoff/07_COMPUTATIONAL_ARCHITECTURE.md`
13. `docs/handoff/10_LLM_CONTINUATION_CONTEXT.md`

## Archival rules

Treat `docs/handoff/` as immutable source research.

- Do not rename archival files.
- Do not rewrite archival files.
- Do not delete archival files.
- Preserve the included manifest and checksums.
- Create focused product documents elsewhere when implementation needs a narrower specification.

## Engineering rules

- Use strict TypeScript.
- Prefer pure functions in the deterministic core.
- Keep domain objects serializable.
- Represent probabilities exactly when practical.
- Keep model calls outside mathematical kernels.
- Validate every model-generated structure against a schema.
- Never trust model-generated arithmetic.
- Add tests before or beside each operator.
- Keep random behavior seeded and reproducible.
- Record assumptions near code and in architecture decisions.
- Avoid hidden global state.
- Avoid framework coupling inside `geometry-engine`.

## Mathematical discipline

Each geometric claim needs explicit definitions for:

- source space
- target space
- coordinates
- metric or similarity rule
- operator
- projection
- invariants
- uncertainty
- failure conditions

Use finite spaces, graphs, piecewise maps, and stochastic transitions first. Introduce smooth geometry only after defining a relaxation or regular stratum.

## Product discipline

Prioritize:

1. exact pair projection
2. threshold visualization
3. coverage matrix
4. absolute-hole detection
5. efficiency-hole detection
6. counterfactual comparison
7. grounded explanation
8. constrained natural-language rule compilation

Defer movement, terrain, deployment, full mission simulation, victory-point forecasting, self-play, and player-skill modeling.

## Intellectual-property discipline

- Use original project branding.
- Use original proxy faction, entity, weapon, and ability names.
- Store no copied rules prose.
- Store no official logos, artwork, scans, miniature photographs, or distinctive visual identity.
- Store only independently entered scalar facts needed for computation.
- Keep source provenance outside public fixtures when provenance includes protected names or source text.
- Do not rely on parody as the primary risk control.

## Model responsibilities

GPT-5.6 may:

- compile natural-language proxy rules into a constrained intermediate representation
- explain computed geometric findings
- narrate deterministic counterfactual search results
- assist interface design and implementation

GPT-5.6 may not:

- serve as probability calculator of record
- invent unsupported profile values
- silently alter rules
- produce unvalidated executable operators
- claim proof from visual resemblance

## Completion standard

A task is complete only when:

- code passes format, type, unit, and integration checks
- deterministic outputs have tests
- UI states include loading, empty, success, and error behavior
- new assumptions appear in documentation
- provenance log includes the milestone
- no protected names or copied prose appear in tracked fixtures

## Working style

Before coding, state a concise plan. Execute the plan without repeated confirmation unless a missing decision blocks correctness. Prefer small commits with one coherent purpose.
