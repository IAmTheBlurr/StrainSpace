---
project: Warhammer Generative Geometry
version: 0.1.0
created: 2026-07-14
status: research handoff
rules_scope: Warhammer 40,000 11th edition concepts, with rules verification required before implementation
license_note: Personal research notes. Warhammer terminology belongs to Games Workshop.
---

# Falsifiable Hypotheses and Tests

## 1. Research standard

The project should produce claims which can fail. A geometric vocabulary earns value only through compression, prediction, diagnosis, or control.

Each hypothesis below includes a test, expected observation, and failure criterion.

## H1. Pair-strain simplification

**Claim:** Log-ratio strain provides a compact coordinate for Strength-Toughness wound regions.

**Test:** Enumerate all legal Strength and Toughness values. Map each pair through \(\sigma=\log(S/T)\) and the wound quantizer. Verify region boundaries at \(-\log2\), \(0\), and \(\log2\).

**Expected observation:** All basic wound thresholds depend only on strain region.

**Failure criterion:** Official rule exceptions require additional state for the basic unmodified comparison. Exceptions from abilities do not falsify the base map; they define coupling operators.

## H2. Delta insufficiency

**Claim:** Raw difference \(S-T\) cannot fully identify wound threshold.

**Test:** Find pairs with equal delta and different wound result.

**Expected observation:** Examples exist, such as \((4,2)\) and \((12,10)\).

**Failure criterion:** None under the standard comparison rule. This serves as a sanity test.

## H3. Factorization of clean attack resolution

**Claim:** A basic attack without cross-stage rules factorizes into attack count, hit, wound, save, and damage components.

**Test:** Compare exact enumeration of dice outcomes with product-form probability calculations.

**Expected observation:** Exact agreement for clean profiles.

**Failure criterion:** Disagreement after all allocation and damage assumptions are matched.

## H4. Coupling detection

**Claim:** Special rules can be identified as edges which break clean factorization.

**Test:** Add one special rule at a time. Compare exact distribution with the uncoupled baseline. Compute interaction residual or conditional mutual information.

**Expected observation:** Rules such as automatic wounds, extra hits, rerolls, and save bypass produce localized graph couplings.

**Failure criterion:** No representation can distinguish cross-stage dependencies from ordinary factor changes.

## H5. Piecewise geometric structure

**Claim:** Many rule maps form piecewise-constant or piecewise-defined regions separated by explicit boundaries.

**Test:** Enumerate characteristic pairs and modifiers. Cluster inputs by exact output distribution.

**Expected observation:** Stable regions with sharp boundaries.

**Failure criterion:** Outputs vary irregularly without rule-explainable partitions.

## H6. Sparse identifiable list coordinates

**Claim:** A compact relational feature set predicts mission-conditioned list behavior within useful error.

**Test:** Build full feature model and sparse feature models. Evaluate held-out matchup, mission, and terrain contexts.

**Metrics:**

- log loss
- Brier score
- calibration error
- mean absolute VP error
- reachable-envelope coverage
- ranking correlation for candidate actions

**Expected observation:** A small subset retains most predictive power and remains stable across resamples.

**Failure criterion:** Feature subsets are unstable, context-specific, or no better than simple baselines.

## H7. Structural model beats aggregate win rate

**Claim:** A rule-aware context model predicts unseen outcomes better than faction-level win rate.

**Test:** Compare:

- faction win-rate baseline
- list archetype baseline
- rules and geometry model

Use time-split and event-split validation.

**Expected observation:** Better calibration and lower predictive loss, especially early in an edition.

**Failure criterion:** No meaningful gain after controlling for sample size and leakage.

## H8. Deployment narrows outcome space

**Claim:** Fixing deployment substantially reduces reachable board and VP sets.

**Test:** Compute or approximate VP envelopes before and after deployment across sample matchups.

**Expected observation:** Envelope width contracts after deployment.

**Failure criterion:** Little or no contraction across contexts, after accounting for policy assumptions.

## H9. Turn progression contracts VP support

**Claim:** Reachable terminal VP support generally contracts as actions and dice outcomes become fixed.

**Test:** Recompute support after each phase or turn.

**Expected observation:** Set inclusion often holds:

\[
\mathcal{R}_{VP}(x_{t+1})\subseteq\mathcal{R}_{VP}(x_t)
\]

**Caveat:** Newly revealed information or conditional mission activation may change modeled support if the earlier model omitted latent state.

**Failure criterion:** Persistent expansion under a complete state model.

## H10. Geometric hole predicts failure modes

**Claim:** Low-capability regions in context space predict recurring scoring or interaction failures.

**Test:** Define capability threshold and identify hole regions. Play or simulate matched contexts. Compare predicted failures with observed failures.

**Expected observation:** Higher loss or VP deficit frequency inside identified holes.

**Failure criterion:** Hole labels fail to predict any meaningful deficit.

## H11. Counterfactual post-game diagnosis is stable

**Claim:** A minimal-action counterfactual can identify decisions with high VP leverage.

**Test:** Replay a recorded game. Replace one decision at a time while preserving later policy assumptions. Rank interventions by VP impact. Compare with expert review and repeated policy models.

**Expected observation:** A small set of interventions remains high-leverage across reasonable opponent responses.

**Failure criterion:** Rankings change radically under minor modeling choices.

## H12. Fiber regularity exists on restricted strata

**Claim:** Within a fixed rules subset, unit-count pattern, and mission class, nearby contexts have history spaces with stable combinatorial type.

**Test:** Build state-transition graphs for neighboring contexts. Compare graph invariants, branching signatures, and homology if useful.

**Expected observation:** Local regularity within restricted strata.

**Failure criterion:** Every small parameter change alters the history-space type beyond any useful equivalence.

## H13. Geometry adds interpretability beyond a generic simulator

**Claim:** Geometric coordinates and envelopes produce explanations a black-box simulator cannot provide as clearly.

**Test:** Compare user performance on list revision and post-game diagnosis using:

- raw simulation output
- aggregate averages
- geometric breakpoint and envelope output

**Expected observation:** Faster correct diagnosis and better transfer to new matchups.

**Failure criterion:** No usability or decision-quality gain.

## 2. Minimum viable experiment

### Rules subset

Use one shooting weapon, one attacker unit, one target unit, and no spatial movement.

Include:

- attacks
- hit threshold
- Strength
- Toughness
- armour penetration
- save
- damage
- wounds per model
- model count

### Phase A: exact enumeration

Enumerate all dice outcomes for a small attack count. Produce exact distributions for:

- hits
- wounds
- failed saves
- damage
- models destroyed

### Phase B: pair geometry

Enumerate \((S,T)\) pairs. Plot threshold regions and pair strain.

### Phase C: coupling

Add one rule from each class:

- reroll
- extra hit
- automatic wound
- save bypass or alternative damage path
- damage reduction

### Phase D: counterfactuals

Ask which one-point stat change, rule addition, or target change produces the largest outcome shift.

### Phase E: validation

Compare engine output with hand calculation and official examples.

## 3. Second experiment: one-dimensional board

Use a line with objectives and terrain intervals.

Add:

- movement
- weapon range
- engagement restriction
- objective control
- two turns
- one scoring rule

Compute exact reachable states and terminal VP pairs.

This experiment isolates reachability and VP projection without full 2D spatial complexity.

## 4. Third experiment: small 2D board

Use a grid or continuous rectangle with a few obstacles. Add line of sight, one objective, and two units per side.

Compare:

- exact search where feasible
- Monte Carlo simulation
- geometric reachability approximation

Measure envelope accuracy and action-ranking agreement.

## 5. Statistical validation design

The structural model still needs statistics for calibration and external validation.

Use:

- held-out missions
- held-out factions
- time-split validation across rules updates
- player-skill stratification
- event-level grouping
- uncertainty intervals
- sensitivity analysis for missing data

Avoid random train-test splits which leak repeated players, lists, or event conditions.

## 6. Null models

Every experiment needs simple comparison models:

- equal chance baseline
- faction win rate
- unit points efficiency
- expected damage only
- random legal action policy
- heuristic objective policy
- generic Monte Carlo without geometric features

## 7. Expected broad findings

Likely observations include:

- discrete thresholds dominate local sensitivity
- special rules create sparse but strong couplings
- global space is stratified rather than smooth
- pregame VP predictions remain broad without policy assumptions
- deployment produces large information gain
- list holes depend on mission and opponent
- exact geometry becomes computationally expensive as actions expand
- useful abstractions require state compression and equivalence tests

## 8. Strong disconfirmation signals

Pause or redesign the theory if:

- no stable metric or adjacency relation emerges
- geometry changes under arbitrary feature rescaling
- sparse coordinates fail outside one narrow matchup
- a generic simulator matches every claimed benefit
- post-game counterfactuals lack policy robustness
- list-only predictions remain too broad for action
- formal structure adds vocabulary without measurable decision gain
