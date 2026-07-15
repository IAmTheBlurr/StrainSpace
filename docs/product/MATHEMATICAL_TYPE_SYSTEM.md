# Mathematical Type System

## Status

This document defines the implementation contract for the StrainSpace mathematical type-system milestone. It narrows the archival research without modifying `docs/handoff/`.

## Domain, fixture, and operator ranges

Three ranges are always distinct:

1. The intrinsic mathematical domain defines which values are meaningful.
2. The fixture range records values present in the current synthetic data.
3. The operator range defines values supported by one implementation.

An attack count is any positive safe integer. The clean repeated-attack operator currently supports counts from one through six. Therefore seven is a valid `AttackCount` but is outside the clean operator's supported range. It is not an invalid attack count.

The same discipline applies to model count, mobility, cost, damage, health, power, resilience, and exact rational serialization. Property-test generator bounds and current fixture ranges are not domain constraints.

| Quantity              | Intrinsic mathematical domain         | Current fixture range          | Current operator or representation support                       |
| --------------------- | ------------------------------------- | ------------------------------ | ---------------------------------------------------------------- |
| `AttackCount`         | positive safe integer                 | `3..6`                         | clean repetition `1..6`                                          |
| `ModelCount`          | positive safe integer                 | `1..3`                         | checked allocation products must remain safe                     |
| `MobilityDistance`    | nonnegative safe integer              | `4..10`                        | no current operator                                              |
| `ResourceCost`        | positive safe integer                 | `70..195`                      | exact rate must fit v1 rational representation                   |
| `FixedDamage`         | positive safe integer                 | `2..5`                         | checked allocation products must remain safe                     |
| `ModelHealth`         | positive safe integer                 | `2..6`                         | checked allocation products must remain safe                     |
| `Power`               | positive safe integer                 | `5..20` including Phase Lance  | exact relation construction and comparison must be representable |
| `Resilience`          | positive safe integer                 | `4..10`                        | exact relation construction and comparison must be representable |
| `ControlContribution` | nonnegative safe integer              | `2..5`                         | no current operator                                              |
| Exact rational        | any rational with nonzero denominator | current results fit safe pairs | canonical safe-integer numerator/denominator v1 record           |
| D6 requirement        | `2..6` plus impossibility             | `2..5`                         | complete compact catalog                                         |

Generated damage and health ranges such as `1..10` are test-sampling choices only.

## Quantity kinds

The deterministic core uses distinct branded runtime types for:

- attack and model counts
- power and resilience
- penetration modifiers
- fixed damage and model health
- mobility distance
- resource cost
- control contribution
- exact probabilities, expectations, and damage-per-cost rates

Wire fixtures remain compact field-specific JSON. Runtime schemas and factories reconstruct brands after validation. No universal scalar wrapper or universal arithmetic API is introduced.

Damage and health share an abstract integrity compatibility dimension but remain distinct effect and capacity kinds. Power and resilience remain distinct kinds joined only by the named `power-resilience-v1` relation.

## Power-resilience relation

`power-resilience-v1` is statically implemented in deterministic TypeScript. Its metadata exposes its ID, input kinds, coordinate views, exact boundaries, invariant identifiers, and operator version. It is not a runtime plugin system.

The relation exposes:

- an authoritative exact ratio
- a diagnostic indexed difference
- an approximate natural-log ratio display view
- a piecewise D6 requirement

The indexed difference is neither scale invariant nor rule sufficient. The logarithmic coordinate is never authoritative and never participates in a threshold decision.

Power and resilience have fixed semantic roles. Numerical reciprocal, antisymmetry, and mirrored-threshold properties are tested only after explicitly constructing a new role-reassigned relation. No ordinary swap operation converts a `Power` into a `Resilience`.

## D6 requirements

Human-authored schema-v1 JSON uses `2`, `3`, `4`, `5`, `6`, or `"impossible"`. Runtime code reconstructs:

```ts
type D6Requirement =
  | { kind: "ordinary"; minimumSuccessfulFace: 2 | 3 | 4 | 5 | 6 }
  | { kind: "impossible" };
```

An ordinary requirement maps to its upper-closed successful-face set. `"impossible"` maps to the empty set. Requirements are ordinal boundaries, not ratio-scale magnitudes.

The legacy numeric sentinel `7` and every unversioned fixture document are rejected. The one-milestone migration adapter was removed before closure.

## Exactness

Canonical rational values are authoritative. Version 1 serializes reduced safe-integer numerator and positive denominator pairs, with zero normalized to `0/1`. Probabilities additionally lie in `[0, 1]`.

BigInt intermediates protect exact arithmetic. A mathematically valid result whose canonical terms exceed the version-1 representation range produces an explicit unsupported-computation result; it does not fall back to floating point and is not classified as mathematically invalid.

Efficiency is an exact damage-per-cost rate. Multiplication by one hundred is presentation scaling only.

## Determinism, stochastic outcomes, and uncertainty

Intrinsic values and computed measures are deterministic. An exact finite distribution is a deterministic mathematical object describing stochastic game outcomes. Epistemic uncertainty about an input or model is a separate reserved contract.

No deterministic operator accepts epistemic estimates. This milestone implements no interval arithmetic, Bayesian structure, or uncertainty propagation.

## Runtime-only derivations

Pair coordinates, D6 events, probabilities, effect distributions, expectations, coverage, efficiency, holes, and the Phase Lance comparison are recomputed runtime values. The milestone adds no analysis cache, input digest, generalized analysis envelope, or derivation graph.

Minimal calculation provenance may record operator ID/version, relation ID, assumption IDs, and source/target identifiers.

## Public serialization boundaries

Schema versioning applies to faction, counter-profile, coverage-criterion, and threshold-map documents. Intermediate runtime objects are not promoted to persistence formats. Wire schemas remain separate from transformed runtime types.

## Non-goals

- no generic dimensional-analysis framework
- no user-defined executable quantities
- no user-defined executable relations
- no generalized symbolic algebra
- no generalized unit-conversion engine
- no analysis-cache or digest system
- no generalized analysis envelope or derivation graph
- no epistemic uncertainty propagation
- no interval or Bayesian uncertainty machinery
- no visualization redesign or Three.js Projection Chamber
- no GPT integration
- no deployment work
- no database or authentication
- no movement, terrain, deployment, or victory-point modeling
- no generalized counterfactual framework or search language
- no persistence format for intermediate runtime calculations
