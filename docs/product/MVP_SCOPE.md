# MVP Scope

## Demo thesis

A force can possess high aggregate power while retaining a structural hole. Relational geometry exposes the hole and identifies a minimal corrective change.

## Included

### Data

- two proxy factions
- a small set of proxy entities per faction
- one or more attack profiles per entity
- defense profiles
- generic special-rule fixtures only after deterministic core completion

### Deterministic engine

- scalar domains
- pair relations
- difference, ratio, and log-ratio strain
- threshold maps
- exact D6 sample-space projections
- clean attack-sequence composition
- effect distributions
- coverage criteria
- absolute-hole detection
- efficiency-hole detection
- counterfactual recomputation

### Interface

- force selectors
- profile table
- coverage matrix
- pair-detail inspector
- threshold-region visualization
- six-cell dice-space visualization
- effect readout
- hole report
- one-click counterfactual comparison

### Model features

- explanation from computed evidence
- constrained natural-language proxy-rule compilation after core stability

## Excluded

- official names, prose, logos, art, or scans
- full game rules
- full faction databases
- terrain and line of sight
- movement and deployment
- mission scoring
- victory-point prediction
- player policy or skill
- self-play
- live game integration
- image recognition

## Minimum fixture size

Begin with four to eight entities per proxy faction. Include enough range to create low, medium, and high defensive clusters plus at least one intentional coverage hole.

## Definition of an absolute hole

For opposing context `c`, friendly list `L`, capability `K`, and threshold `theta`:

```text
hole(L, c) = K(L, c) < theta
```

The MVP must expose `K`, `theta`, and every assumption.

## Definition of an efficiency hole

A viable response exists, yet resource-normalized effect falls below a selected efficiency threshold.

## Demo completion criteria

- all calculations reproduce exact enumerations
- a seeded hole appears in the matrix
- a known profile replacement closes the seeded hole
- the visual projection changes immediately
- generated explanation cites computed values
- repository runs from documented commands
- three-minute demonstration remains understandable without prior theory knowledge
