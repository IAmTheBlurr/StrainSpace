---
project: Warhammer Generative Geometry
version: 0.1.0
created: 2026-07-14
status: research handoff
rules_scope: Warhammer 40,000 11th edition concepts, with rules verification required before implementation
license_note: Personal research notes. Warhammer terminology belongs to Games Workshop.
---

# Research Roadmap and Open Questions

## Phase 0: Preserve definitions

Deliverables:

- glossary with status labels
- notation file
- rules-version manifest
- claim ledger
- experiment registry

Exit criterion: every custom term has a definition and falsification path.

## Phase 1: Exact attack micro-model

Scope:

- one attacker
- one target
- one weapon
- no movement
- no special rules

Deliverables:

- exact dice engine
- Strength-Toughness pair-strain map
- wound quantizer visualization
- save and damage distributions
- breakpoint report

Exit criterion: exact agreement with hand calculations and rule examples.

## Phase 2: Coupling library

Add one mechanic at a time:

- rerolls
- critical hits
- extra hits
- automatic wounds
- critical wounds
- save changes
- damage reduction
- damage prevention

Deliverables:

- coupling graph
- exact distribution comparison
- rule provenance trace

Exit criterion: each mechanic compiles independently and composes correctly.

## Phase 3: Unit and target-class geometry

Create finite libraries of attacker and target profiles.

Deliverables:

- attack-effect surfaces
- threshold-region maps
- target-class clustering
- role coverage metrics

Exit criterion: clusters remain useful on held-out profiles.

## Phase 4: One-dimensional board

Add movement, range, one objective, and simple scoring.

Deliverables:

- exact reachable states
- reachable VP pairs
- action funnel
- deployment contraction measure

Exit criterion: exact search remains tractable and diagnostics are intelligible.

## Phase 5: Small two-dimensional board

Add obstacles, line of sight, and multiple units.

Deliverables:

- threat fields
- movement regions
- objective-control maps
- approximate VP envelopes

Exit criterion: approximate methods match exact small cases within tolerance.

## Phase 6: Force-Disposition mission model

Encode mission pairing and scoring logic.

Deliverables:

- mission operator library
- disposition-conditioned list-role map
- scoring route graph
- denial route graph

Exit criterion: model reproduces known scoring examples and generates valid legal plans.

## Phase 7: Full-list abstraction

Represent complete lists through relational features and operator graphs.

Deliverables:

- abstract list geometry
- matchup map
- hole report
- redundancy report

Exit criterion: features predict simulated or recorded mission outcomes better than baselines.

## Phase 8: Replay and post-game diagnosis

Deliverables:

- game log format
- deterministic replay
- counterfactual engine
- regret and variance report

Exit criterion: expert reviewers judge reports accurate and actionable on blinded games.

## Phase 9: Policy modeling

Add player behavior models.

Deliverables:

- heuristic policies
- search policies
- policy-strength parameter
- robust opponent response

Exit criterion: predictions remain calibrated across player-skill strata.

## Phase 10: Empirical validation

Use tournament and personal game data.

Deliverables:

- time-split benchmark
- held-out mission benchmark
- held-out faction benchmark
- calibration report
- ablation study

Exit criterion: structural model provides measurable gains.

## Open question 1: What is intrinsic geometry?

Possible answers:

- metric on capability vectors
- graph distance on rule operators
- edit distance between lists
- transport distance between outcome distributions
- reachability metric on states
- information geometry on policy-conditioned distributions

A single global metric may not exist.

## Open question 2: Which axes are truly separable?

The hit-wound-save sequence is factor-like only in a clean model. Abilities create coupling. Research should identify maximal separable subgraphs.

## Open question 3: What counts as dimension?

Possible meanings:

- independent scalar coordinate
- latent variable
- graph factor
- topological dimension
- manifold dimension
- number of degrees of freedom
- rank of a Jacobian in a relaxed model
- minimal sufficient feature count

The project should state which meaning applies in each claim.

## Open question 4: Can sparse coordinates remain stable?

A coordinate set may work for one faction or mission and fail elsewhere. Stability across contexts is essential for strong claims.

## Open question 5: How should rules semantics enter?

Purely numerical modeling cannot capture keyword permissions, timing, target eligibility, or replacement effects. A formal rule graph must preserve semantics while geometric role emerges from behavior.

## Open question 6: Is a fiber bundle the right object?

The indexed-family construction is valid. A true fiber bundle needs local triviality. A stratified fibration, dependent type, sheaf, or category of elements may fit better.

## Open question 7: How should uncertainty be represented?

Possible layers:

- dice randomness
- hidden opponent plan
- unknown policy quality
- incomplete rules encoding
- uncertain terrain measurement
- model approximation error

These uncertainties should not collapse into one confidence number.

## Open question 8: What is the correct VP value function?

Options:

- expected score difference
- probability of win
- robust score floor
- risk-sensitive utility
- lexicographic mission goals
- tournament score utility

Player preference and event scoring may select different functions.

## Open question 9: How can list holes be validated?

A hole requires context space, capability function, threshold, and empirical consequence. Persistent homology may become useful only after a meaningful metric and sampling method exist.

## Open question 10: What constitutes novelty?

Possible novelty classes:

- new application of stochastic-game geometry to Warhammer
- new relational feature system
- new sparse coordinate discovery method
- new counterfactual diagnostic interface
- new mission-conditioned list geometry
- new synthesis of formal rules, geometry, and player analysis

A literature review should compare wargame AI, stochastic games, operations research, combat modeling, game analytics, and formal rule engines.

## Study sequence

Recommended mathematical sequence:

1. Linear algebra and metric spaces
2. Probability on finite spaces
3. Graph theory and combinatorics
4. Optimization
5. Dynamical systems
6. Markov decision processes and stochastic games
7. Computational geometry
8. Control theory and reachability
9. Topology and fiber bundles
10. Differential and stratified geometry
11. Inverse problems and identifiability
12. Formal methods and model checking

## First concrete coding milestone

Create a command-line tool which accepts an attacker and target profile and returns:

- pair strain
- wound region
- hit, wound, save, and damage distributions
- model-removal distribution
- nearest breakpoints
- operator trace
- counterfactual comparison

## First concrete game milestone

Record one personal game with full deployment, moves, targets, dice totals, scoring, and rules use. Encode only the first battle round. Build a VP reachability model for one flank or one objective. Compare model findings with personal post-game judgment.
