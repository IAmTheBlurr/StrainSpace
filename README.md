# StrainSpace

StrainSpace is an experimental geometric reasoning engine for tabletop force analysis.

The project models scalar profile values as inputs to relational constraint spaces. Deterministic operators project those relations into finite outcome spaces, effect distributions, and structural coverage maps. The first product goal is an interactive list-hole finder with exact calculations and grounded explanations.

## Build Week objective

Produce one polished vertical slice:

1. Load two proxy force lists.
2. Construct pairwise relational coordinates.
3. Project selected pairs through threshold and D6 spaces.
4. Display a coverage matrix.
5. Identify absolute and efficiency holes.
6. Show one counterfactual change which closes a hole.
7. Reserve constrained rule compilation and evidence-grounded explanation for a later milestone; no model integration is part of the mathematical type-system milestone.

## Repository status

This repository contains pre-hackathon conceptual research under `docs/handoff/` and the deterministic Build Week implementation elsewhere. The previous web application and Codex Sites integration were removed on 2026-07-18; the repository no longer contains a product-facing UI or hosting integration.

`docs/handoff/` remains an archival source. Preserve file names, checksums, and internal references. New product documents live under `docs/product/`, data governance under `docs/data/`, and hackathon records under `docs/hackathon/`.

## Core principles

- Deterministic code owns arithmetic, probability, validation, and graph analysis.
- Model output must cite computed evidence.
- Raw labels remain generic and original.
- Research claims remain falsifiable.
- High-dimensional language must map to explicit spaces, operators, metrics, or projections.
- Scope favors a working demonstration over full game coverage.

## Current architecture

```text
packages/
  geometry-engine/
  rule-schema/
  explanation-engine/
fixtures/
  proxy-faction-alpha/
  proxy-faction-beta/
tests/
docs/
  handoff/
  product/
  research/
  data/
  hackathon/
```

## Source material

Start with:

- `docs/handoff/00_README_AND_HANDOFF.md`
- `docs/handoff/02_FORMAL_MATHEMATICAL_FRAMEWORK.md`
- `docs/handoff/03_GLOSSARY_AND_TERM_STATUS.md`
- `docs/handoff/04_PAIR_GEOMETRY_AND_DICE_PROJECTIONS.md`
- `docs/handoff/06_FALSIFIABLE_HYPOTHESES_AND_TESTS.md`
- `docs/handoff/07_COMPUTATIONAL_ARCHITECTURE.md`
- `docs/handoff/08_POST_GAME_DIAGNOSIS_AND_LIST_HOLES.md`
- `docs/handoff/10_LLM_CONTINUATION_CONTEXT.md`

## Build provenance

Record every meaningful Build Week change in Git. Keep conceptual research and implementation commits separate. Update `docs/hackathon/PROVENANCE_LOG.md` after each milestone.

## Local verification

Requirements: Node.js 24 or later and Corepack. The workspace pins pnpm 11.13.0; do not install pnpm globally.

```bash
corepack pnpm@11.13.0 install --frozen-lockfile
corepack pnpm@11.13.0 check
```

## Quality commands

```bash
corepack pnpm@11.13.0 format
corepack pnpm@11.13.0 lint
corepack pnpm@11.13.0 typecheck
corepack pnpm@11.13.0 test:unit
corepack pnpm@11.13.0 build
corepack pnpm@11.13.0 fixtures:scan
corepack pnpm@11.13.0 check
```

`corepack pnpm@11.13.0 check` runs the complete milestone gate. `corepack pnpm@11.13.0 schema:export` regenerates the tracked JSON Schema bundle at `packages/rule-schema/schema/strainspace.schema.json`.

## Implemented workspace

- `packages/rule-schema`: strict versioned wire schemas, semantic quantity brands, and JSON Schema export
- `packages/geometry-engine`: pure relation-specific pair, exact D6, effect, coverage, hole, and narrow counterfactual operators
- `packages/explanation-engine`: reserved model boundary with no integration yet
- `fixtures`: independently authored generic force data and one counter-profile

The implemented mathematical contract and assumptions live in `docs/product/IMPLEMENTED_MATHEMATICS.md`; the type-system decision record is `docs/product/MATHEMATICAL_TYPE_SYSTEM.md`.

## License status

No open-source license has been selected. See `LICENSE` before reuse or distribution.
