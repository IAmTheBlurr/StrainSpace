---
project: Warhammer Generative Geometry
version: 0.1.0
created: 2026-07-14
status: research handoff
rules_scope: Warhammer 40,000 11th edition concepts, with rules verification required before implementation
license_note: Personal research notes. Warhammer terminology belongs to Games Workshop.
---

# References and Rules Assumptions

## 1. Rules assumptions

The handoff references Warhammer 40,000 11th-edition concepts current during July 2026.

Verified official concepts include:

- five Force Dispositions: Take and Hold, Purge the Foe, Disruption, Reconnaissance, and Priority Assets
- Force Dispositions influence mission generation
- equal Strength and Toughness maps to a 4+ wound roll in the basic interaction
- official downloads include current points, detachment points, Force Dispositions, faction material, and rules updates

Implementation must freeze exact source revisions and encode later errata explicitly.

## 2. Official Warhammer sources

Accessed 2026-07-14.

- Games Workshop, "#New40k: How your army affects your mission." https://www.warhammer-community.com/en-gb/articles/oefzq9fg/new40k-how-your-army-affects-your-mission/
- Games Workshop, "Building an army in the new edition of Warhammer 40,000." https://www.warhammer-community.com/en-gb/articles/95fucn12/building-an-army-in-the-new-edition-of-warhammer-40000/
- Games Workshop, "Warhammer 40,000: The Anatomy of a New Datasheet." https://www.warhammer-community.com/en-gb/articles/MNNVVPhc/warhammer-40000-the-anatomy-of-a-new-datasheet/
- Games Workshop, "Warhammer 40,000 Downloads." https://www.warhammer-community.com/en-gb/downloads/warhammer-40000/
- Games Workshop, "#New40k: Download the new Event Companions today." https://www.warhammer-community.com/en-gb/articles/lszdpzmc/new40k-download-new-event-companions-today/

## 3. Mathematics references

### Geometry and topology

- John M. Lee, *Introduction to Smooth Manifolds*.
- Dale Husemoller, *Fibre Bundles*.
- James R. Munkres, *Topology*.
- Mark Goresky and Robert MacPherson, *Stratified Morse Theory*.
- Herbert Edelsbrunner and John Harer, *Computational Topology: An Introduction*.
- Mark de Berg, Otfried Cheong, Marc van Kreveld, and Mark Overmars, *Computational Geometry: Algorithms and Applications*.

### Dynamical systems, control, and reachability

- Dimitri P. Bertsekas, *Dynamic Programming and Optimal Control*.
- Martin L. Puterman, *Markov Decision Processes*.
- Lloyd S. Shapley, "Stochastic Games," 1953.
- Jean-Pierre Aubin, *Viability Theory*.
- Thomas A. Henzinger, "The Theory of Hybrid Automata."

### Probability and graphical models

- Sheldon Ross, *A First Course in Probability*.
- Daphne Koller and Nir Friedman, *Probabilistic Graphical Models*.
- Judea Pearl, *Causality*.

### Inverse problems and identifiability

- Albert Tarantola, *Inverse Problem Theory and Methods for Model Parameter Estimation*.
- Heinz W. Engl, Martin Hanke, and Andreas Neubauer, *Regularization of Inverse Problems*.
- Emil Walter and Luc Pronzato, *Identification of Parametric Models from Experimental Data*.

### Formal methods

- Edmund M. Clarke, Orna Grumberg, and Doron A. Peled, *Model Checking*.
- Christel Baier and Joost-Pieter Katoen, *Principles of Model Checking*.

### Optimization and variational analysis

- R. Tyrrell Rockafellar and Roger J-B Wets, *Variational Analysis*.
- Stephen Boyd and Lieven Vandenberghe, *Convex Optimization*.

## 4. Literature-review targets

Search areas:

- tabletop wargame AI
- stochastic combat models
- military operations research
- adversarial planning under uncertainty
- game-state abstraction
- automated rules reasoning
- probabilistic programming for games
- geometric deep learning for relational systems
- combat outcome simulation
- mission-conditioned game analytics

## 5. Intellectual-positioning caution

The current program may combine known methods in a new application. A novelty claim requires systematic literature review and prior-art search. The strongest likely contribution may be a coherent representation which connects exact rules, relational geometry, stochastic control, VP projection, and player-facing diagnosis.
