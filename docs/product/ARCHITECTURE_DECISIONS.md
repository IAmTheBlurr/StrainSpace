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
