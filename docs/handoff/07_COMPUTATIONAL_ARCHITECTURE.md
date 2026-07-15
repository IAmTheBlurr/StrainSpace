---
project: Warhammer Generative Geometry
version: 0.1.0
created: 2026-07-14
status: research handoff
rules_scope: Warhammer 40,000 11th edition concepts, with rules verification required before implementation
license_note: Personal research notes. Warhammer terminology belongs to Games Workshop.
---

# Computational Architecture

## 1. Design goals

The system should be:

- rules-versioned
- exact on small cases
- compositional
- auditable
- testable against hand examples
- able to expose probability distributions
- able to distinguish factors from couplings
- capable of spatial reachability
- capable of counterfactual replay
- able to produce LLM-readable explanations

## 2. Layered architecture

### Layer 1: Rules ingestion

Inputs:

- core rules
- faction packs or codex data
- points and detachment data
- FAQs and commentary
- mission and Force Disposition data
- event constraints

Outputs:

- normalized entities
- versioned rule clauses
- provenance links
- rule priority and exception metadata

Manual encoding is preferable for the first prototype. Automated parsing can come later.

### Layer 2: Canonical ontology

Core entity types:

- RulesetVersion
- Army
- Detachment
- ForceDisposition
- UnitDefinition
- UnitInstance
- ModelInstance
- WeaponProfile
- Ability
- Modifier
- Mission
- Objective
- TerrainFeature
- Deployment
- Action
- DiceEvent
- State
- Transition
- History
- Outcome

### Layer 3: Typed value system

Each value record should include:

- identifier
- source entity
- raw value
- unit or dimension label
- domain
- legal range
- modifier rules
- context dependencies
- operator dependencies
- version provenance

Values begin semantically typed for rules correctness. Geometric role remains relational and can be inferred separately.

### Layer 4: Operator compiler

Compile rules into composable operators.

Operator interface:

```text
inputs: typed state fields and values
preconditions: legality predicates
random_inputs: dice variables or none
outputs: state changes or intermediate values
priority: rule ordering and exception scope
provenance: source rule identifier
```

Operator categories:

- comparison
- threshold
- quantizer
- modifier
- clamp
- reroll
- branch
- repeat
- allocate
- movement
- visibility
- resource transfer
- score
- termination

### Layer 5: Dependency and coupling graph

Build directed graph:

\[
G=(V,E)
\]

Nodes contain values, events, and state fields. Edges contain operators.

Analysis tasks:

- topological ordering when acyclic
- strongly connected components for rerolls or loops
- cross-stage coupling detection
- provenance tracing
- sensitivity paths
- dead-rule detection

### Layer 6: Exact probability engine

For small cases, support:

- finite sample-space enumeration
- dynamic programming
- probability generating functions
- convolution
- absorbing Markov chains
- symbolic rational probabilities

Outputs should include full distributions, not only means.

### Layer 7: State-transition engine

Represent:

\[
x_{t+1}=F_R(x_t,a_t,\omega_t;b)
\]

Requirements:

- deterministic replay from action and dice log
- legality checking
- trigger stack
- replacement effects
- phase and timing control
- undo or persistent state snapshots

### Layer 8: Spatial geometry engine

Capabilities:

- 2D positions and footprints
- collision and coherency
- distance queries
- line of sight
- terrain intersection
- reachable regions
- threat regions
- objective-control regions
- path planning

Start with simplified disks or polygons before exact miniature bases and terrain volumes.

### Layer 9: Policy and search engine

Policy interfaces:

- heuristic scoring
- beam search
- Monte Carlo tree search
- minimax approximation
- stochastic policy
- human action replay

Separate list geometry from player policy. Every projection should state its policy assumptions.

### Layer 10: Projection engine

Projection targets:

- dice threshold
- probability distribution
- expected damage
- model-removal distribution
- control map
- reachable-state set
- VP envelope
- score-strain value
- list-role coverage
- counterfactual attribution

### Layer 11: Diagnostics

Diagnostics should answer:

- Which boundary caused the result?
- Which rule coupled two stages?
- Which action changed reachable VP support?
- Which list capability was absent?
- Which assumptions dominate uncertainty?
- Which alternative action had the largest robust VP gain?

## 3. Recommended data representation

Use a graph-based core plus immutable state snapshots.

Possible technology choices:

- Python for prototype and exact probability work
- Rust or C++ for later high-performance search
- NetworkX or custom graph structures for rule dependencies
- SymPy for symbolic checks
- Shapely or CGAL bindings for geometry
- Pydantic or dataclasses for schema validation
- DuckDB or SQLite for experiments
- JSON Lines for replay logs

## 4. Versioning

Every artifact should carry:

- rules edition
- core rules revision
- faction pack or codex revision
- points revision
- FAQ or commentary revision
- mission deck season
- event pack
- model assumptions

A computed result without version provenance is unsafe.

## 5. Minimal schema

```text
RulesetVersion
  id
  edition
  effective_date
  sources[]

Value
  id
  entity_id
  name
  raw
  domain
  modifiers[]

Operator
  id
  kind
  inputs[]
  outputs[]
  preconditions[]
  random_variables[]
  source_rule

State
  id
  context_id
  turn
  phase
  active_player
  entities{}
  resources{}
  score{}
  pending_effects[]

Transition
  state_before
  action
  random_event
  operators_applied[]
  state_after

Projection
  id
  source_space
  target_space
  method
  assumptions[]
  uncertainty
```

## 6. First prototype modules

1. `rules_core.py`
2. `dice_space.py`
3. `wound_quantizer.py`
4. `attack_pipeline.py`
5. `distribution.py`
6. `operator_graph.py`
7. `counterfactuals.py`
8. `tests/`

## 7. Example API

```python
context = AttackContext(
    attacks=6,
    hit_threshold=3,
    strength=13,
    target_toughness=8,
    armour_penetration=2,
    target_save=3,
    damage=2,
    target_wounds=3,
    target_models=5,
)

result = engine.resolve_exact(context)

print(result.wound_strain)
print(result.models_destroyed_distribution)
print(result.breakpoints)
print(result.coupling_graph)
```

## 8. Breakpoint engine

For each input value, search smallest legal perturbation which changes selected output.

Examples:

- next Strength value which changes wound threshold
- next AP value which changes save threshold
- movement increase which reaches an objective
- OC increase which flips control
- command-point increase which enables a scoring sequence

Output:

```text
Variable: Strength
Current: 13
Target Toughness: 8
Current wound threshold: 3+
Next favorable threshold: 2+
Required Strength: 16
Distance to breakpoint: +3
```

## 9. Counterfactual engine

Given replay \(h\), define intervention set \(I\). For each intervention \(i\in I\), recompute continuation under chosen opponent policy class.

Report:

- VP effect distribution
- action cost
- robustness across opponent responses
- dependency assumptions
- downstream rules paths

## 10. Geometry engine stages

### Stage A

No board. Exact attack resolution.

### Stage B

One-dimensional board with intervals.

### Stage C

Grid board with simple obstacles.

### Stage D

Continuous 2D board with circular bases.

### Stage E

Exact terrain footprints, visibility, and mission maps.

## 11. Computational complexity

Full game search suffers combinatorial explosion from:

- movement choices
- target allocations
- dice branches
- trigger choices
- opponent actions
- multi-turn planning

Required methods may include:

- state abstraction
- symmetry reduction
- dominance pruning
- memoization
- approximate dynamic programming
- Monte Carlo search
- policy restriction
- hierarchical planning
- reachable-set overapproximation

## 12. LLM integration

An LLM should explain outputs and help encode rules. It should not serve as the source of truth for exact rule execution.

Safe roles:

- translate formal diagnostics into player language
- generate test cases from encoded rules
- identify missing provenance
- propose hypotheses
- compare counterfactual narratives

Unsafe roles:

- silently invent rules
- resolve timing conflicts without source provenance
- produce exact probabilities from intuition
- merge rules versions

## 13. Audit trail

Every result should support a trace:

```text
source values
-> operators
-> dice events
-> state changes
-> projection
-> recommendation
```

The trace is essential for trust, debugging, and falsification.
