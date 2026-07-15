# Implemented Mathematics

This document records the exact contract implemented by the StrainSpace mathematical type-system milestone. It narrows the archival research without changing `docs/handoff/`.

## Quantity domains and engine support

Intrinsic mathematical validity is separate from fixture ranges and operator support. Positive safe-integer brands represent attack count, model count, power, resilience, fixed damage, model health, and resource cost; mobility and control are nonnegative safe integers.

The clean repeated-attack engine accepts a `SupportedCleanAttackCount` proof for counts one through six. `AttackCount(7)` is therefore valid domain data but returns `unsupported-computation-range` from that operator. Allocation support is based on checked integer products, not fixture maxima. Unsupported operator references return `unsupported-rule-context`.

## The `power-resilience-v1` relation

- **Source space:** ordered, semantically typed pairs `Power × Resilience` over positive safe integers.
- **Authoritative coordinate:** the canonical exact ratio `Power / Resilience`.
- **Diagnostic coordinate:** signed indexed difference `Power - Resilience`; it is neither scale invariant nor rule sufficient.
- **Display coordinate:** `ln(Power / Resilience)`, computed approximately from the exact ratio, visibly marked `≈`, and never used in a decision.
- **Projection:** at least double maps to `2+`; greater maps to `3+`; equal maps to `4+`; less but above half maps to `5+`; at most half maps to `6+`.
- **Invariants:** common positive scaling preserves the projection; increasing power cannot worsen it; increasing resilience cannot improve it.
- **Failure condition:** a relation result outside the v1 exact representation range returns an explicit unsupported result.

Power and resilience are distinct quantity kinds. The numerical dual theorem reconstructs a new `Power` from the old resilience magnitude and a new `Resilience` from the old power magnitude. Only then are difference antisymmetry, ratio reciprocity, approximate-log antisymmetry, and the `2↔6`, `3↔5`, `4↔4` requirement mapping asserted. There is no heterogeneous swap operation and no universal pair-coordinate API.

The relation catalog is closed metadata for the current relation. It contains identifiers, descriptions, authorized views, exact visualization boundaries, invariant IDs, and an operator version. All executable arithmetic remains static deterministic TypeScript.

## D6 requirements and finite events

The wire catalog is `2 | 3 | 4 | 5 | 6 | "impossible"`. Runtime code uses an ordinary/impossible tagged union. An ordinary requirement maps losslessly to its upper-closed successful face set; impossible maps to the empty set. Event probability is the exact measure of that set under a uniform D6.

Requirement order runs opposite successful-event inclusion. D6 requirements do not support generic subtraction, ratio, or logarithmic operations.

## Exact carriers

Canonical rationals are authoritative. Version 1 records reduced safe-integer numerators and positive denominators, normalizes zero to `0/1`, and refines probabilities to `[0,1]`. BigInt intermediates protect reduction, algebra, and cross-product comparisons. Representation overflow is an unsupported-computation result; invalid denominators and invalid probabilities are mathematical-domain errors. No exact operator falls back to floating point.

Signed subtraction and nonnegative deficit are distinct named operations. Damage-per-cost is an exact rate; multiplication by one hundred is presentation scaling only.

## Clean attack sequence

- **Source space:** one intrinsically valid attack profile and defense profile that pass the clean support guard.
- **Target space:** an exact finite distribution over damaging hits, raw damage, applied damage, discarded damage, and models removed.
- **Measure:** independent uniform measure over accuracy, power-resilience, and failed-protection D6 events.
- **Projection:** three exact events → single-attack effect probability → supported binomial repetition → sequential fixed-damage allocation.
- **Invariants:** all 216 single-attack paths match exact factorization; repeated probabilities normalize; expectations equal weighted sums; `rawDamage = appliedDamage + discardedDamage`; applied damage and removals are monotone and bounded.
- **Failure conditions:** attack counts above six, unsafe required products, nonempty operator lists, or any unsupported reroll, modifier, branch, repeat, replacement effect, prevention, reduction, alternate channel, or non-fixed damage context.

Excess fixed damage is discarded and never spills. The engine models no movement, range, terrain, target allocation choice, or downstream board state.

## Coverage, holes, and efficiency

Capability is the exact probability of removing at least the criterion's model count in one clean activation. Exact equality meets the criterion. Each matrix cell chooses greatest exact capability and breaks exact ties with greatest exact damage-per-cost.

An absolute hole exists when no response covers a target. Its gap is a `Probability`. An efficiency hole requires at least one covered response but no covered response meeting the selected exact efficiency floor. Its gap is a `DamagePerCost`. These dimensions are distinct in both TypeScript and runtime result unions.

The committed migration oracle covers all 16 baseline matrix cells and all 16 Phase Lance cells: 12 proven unchanged and four explicit replacements. Bastion Prism remains the sole baseline absolute hole; its best capability is `139/2187` and its criterion gap is `1909/4374`. Phase Lance reaches `133075/157464`, closes that hole, and leaves no replacement holes.

Counterfactual support is limited to validating one replacement selector, immutably replacing one profile, independently recomputing the same matrix, and comparing the before/after hole set.

## Determinism and uncertainty

Deterministic values, exact finite stochastic distributions, and epistemic estimates are distinct. The reserved `EpistemicEstimate<Q>` contract is rejected by deterministic operators and numeric fixture fields. There is no uncertainty propagation, interval arithmetic, Bayesian structure, registry, or generalized lifting machinery.

## Runtime-only derivations

Relations, events, distributions, expectations, matrices, holes, and counterfactual comparisons are recomputed typed runtime structures. Current provenance is limited to operator ID/version, relation ID, assumption IDs, and source/target identifiers. No persistence format, input digest, canonical JSON hash, cache, generalized analysis envelope, or derivation graph is implemented for these intermediates.
