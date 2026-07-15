# Implemented Mathematics

This document narrows the archival research into the exact contract implemented by the first StrainSpace vertical slice. It does not change the archive.

## Pair representations

- **Source space:** ordered positive scalar pairs `(left, right)`.
- **Target spaces:** real difference, positive ratio, or real logarithmic ratio.
- **Coordinates:** `left - right`, `left / right`, and `ln(left / right)`.
- **Metric or similarity rule:** no general metric is asserted. Difference is additive separation; ratio and log ratio are multiplicative relations.
- **Operator:** `representPair`.
- **Projection:** a selected representation produces one scalar strain coordinate.
- **Invariants:** difference and log ratio are antisymmetric under swapping; ratio becomes its reciprocal; equal positive values map to `0`, `1`, and `0` respectively.
- **Uncertainty:** none for finite positive inputs.
- **Failure conditions:** zero or negative values; interpretation of fields whose rule is not additive or multiplicative.

## Basic power-resilience threshold map

- **Source space:** positive integer `(power, resilience)` pairs.
- **Target space:** ordinary D6 thresholds `{2, 3, 4, 5, 6}`.
- **Coordinate:** ratio `power / resilience`; log ratio is an equivalent display coordinate.
- **Similarity rule:** ordered multiplicative comparison, not Euclidean distance.
- **Operator:** the data-defined `BASIC_POWER_RESILIENCE_THRESHOLD_MAP` plus `powerResilienceThreshold`.
- **Projection:** at least double → `2+`; greater → `3+`; equal → `4+`; less but above half → `5+`; at most half → `6+`.
- **Invariants:** common positive scaling preserves a region; increasing power cannot worsen a threshold; increasing resilience cannot improve one.
- **Uncertainty:** none inside the clean map.
- **Failure conditions:** modifiers, replacements, bypasses, or cross-stage operators.

## Clean attack sequence

- **Source space:** one validated attack profile and one validated defense profile.
- **Target space:** exact finite effect distribution over damaging hits, applied damage, and models removed.
- **Coordinates:** accuracy threshold, power-resilience threshold, penetration-adjusted protection threshold, fixed damage, target health, and model count.
- **Measure:** independent uniform measure over each D6 sample space.
- **Operators:** accuracy selection, power-resilience quantization, protection failure selection, exact gate composition, binomial convolution, and sequential damage allocation.
- **Projection:** scalar profiles → three D6 events → single-attack effect probability → repeated-attack effect distribution.
- **Invariants:** probabilities sum to one; exhaustive single-attack enumeration matches the product form; improved clean thresholds are monotone.
- **Uncertainty:** none under the declared clean assumptions.
- **Failure conditions:** rerolls, modifiers, extra events, automatic effects, damage prevention or reduction, alternate damage channels, non-fixed dice expressions, or more than six attacks.

Damage is allocated sequentially to one model at a time. Excess damage is discarded. The engine models no movement, range, terrain, target allocation choice, or downstream board effect.

## Coverage, holes, and efficiency

- **Source space:** all source-entity/target-entity relations for two validated forces.
- **Target spaces:** exact capability rationals, Boolean coverage, resource-normalized efficiency, and finite hole reports.
- **Capability coordinate:** probability of removing at least the criterion's declared model count in one clean activation.
- **Threshold:** fixture data; the default is exactly `1/2` for at least one model.
- **Operator:** choose the source entity's profile with greatest capability, breaking exact ties by efficiency.
- **Projection:** pair results → coverage matrix → per-target response set → hole report.
- **Invariants:** a target is covered if any source response meets the threshold; adding a stronger response cannot create an absolute hole.
- **Uncertainty:** strategic value outside the clean activation is unmodeled.
- **Failure conditions:** interpreting coverage as overall game value, or efficiency as including range, mobility, control, opportunity cost, redundancy, or policy.

Initial efficiency is `expected applied damage × 100 / source entity cost`. An absolute hole has no response meeting the capability threshold. An efficiency hole has at least one viable response, but every viable response falls below a separately selected efficiency floor.
