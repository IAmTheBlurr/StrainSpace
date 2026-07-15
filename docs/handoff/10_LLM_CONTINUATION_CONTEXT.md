---
project: Warhammer Generative Geometry
version: 0.1.0
created: 2026-07-14
status: research handoff
rules_scope: Warhammer 40,000 11th edition concepts, with rules verification required before implementation
license_note: Personal research notes. Warhammer terminology belongs to Games Workshop.
---

# LLM Continuation Context

## Instruction to the next model

Continue a research program concerning a geometric and operator-based model of Warhammer 40,000. Preserve distinctions among established mathematics, adapted terminology, custom terminology, and hypotheses. Correct mathematical errors directly while preserving the conceptual goal.

Do not assume a smooth global geometry. Begin with finite spaces, graphs, piecewise maps, stochastic transitions, and context-indexed families. Introduce differential geometry only after a smooth relaxation or a regular stratum is specified.

## User's motivating insight

Sparse measurements can reconstruct hidden geometric scaffolds when a correct generative model exists. The user developed a garment reconstruction approach from a small body-measurement set and wants to explore an analogous strategy for Warhammer rules and list structure.

The user seeks first-principles reasoning rather than immediate use of heuristic categories.

## Current core model

1. Raw values gain operational meaning through relations and rule operators.
2. Strength and Toughness form a pair whose basic wound relation is multiplicative.
3. Log-ratio strain \(\sigma=\log(S/T)\) gives a symmetric coordinate around balance.
4. The wound table quantizes pair strain into a D6 threshold.
5. Dice form finite sample spaces and projection layers.
6. Hit, wound, and save are factor-like stages in a simple attack sequence.
7. Special rules create couplings across factors.
8. Complete lists define abstract relational geometry before deployment.
9. Deployment creates a concrete initial condition.
10. Legal actions and dice generate stochastic state trajectories.
11. VP is a low-dimensional projection of full game histories.
12. The set of legal histories over each context forms an indexed family. A true fiber bundle remains unproven.

## Custom terms in active use

- Abstract List Geometry
- Board-State Geometry
- Dice Space
- Projection Stack
- Outcome Shadow
- Pair Strain
- Inverse Generative Scaffold
- Sparse Identifiable Coordinates
- List-to-Board Fiber Evolution
- VP Space
- VP Strain
- Scoring Envelope
- Geometric Hole
- Operator Graph
- Relational Typing
- Action Funnel

## Mathematical corrections already established

1. Orthogonality requires a metric or inner product.
2. Equal numeric axis values do not establish isotropy.
3. Raw difference \(S-T\) is insufficient for the wound relation.
4. The tick-connected line construction creates an envelope, generally parabola-like, rather than a circle.
5. A 0-0 score at game start does not imply 50 percent win probability.
6. Hit, wound, and save form a separable product only under restricted rules.
7. Warhammer is globally discrete, hybrid, and stratified. Smooth differential geometry is local or relaxed.
8. A context-indexed history family is safer than claiming a fiber bundle.

## Formal objects

- Ruleset \(R\)
- List spaces \(\mathcal{L}_A(R),\mathcal{L}_B(R)\)
- Base context \(\mathcal{B}_R\)
- Board state \(x\in\mathcal{X}_b\)
- Legal action set \(\mathcal{A}_i(x,b)\)
- Dice event \(\omega\in\Omega\)
- Transition \(x_{t+1}=F_R(x_t,a_t,\omega_t;b)\)
- Policy \(\pi_i(a\mid x,b)\)
- History fiber \(\mathcal{H}_b\)
- Total indexed space \(\mathcal{E}_R=\{(b,h)\}\)
- Projection \(\pi(b,h)=b\)
- VP projection \(V(b,h)=(VP_A,VP_B)\)
- Score strain \(\Delta V=VP_A-VP_B\)
- Reachable VP set \(\mathcal{R}_{VP}(x,t)\)

## Immediate research task

Build an exact micro-model for one attack profile and one target. Use no special rules initially. Enumerate dice outcomes and verify product factorization. Add one coupling rule at a time. Generate breakpoints and counterfactuals.

## Questions for the next session

1. Which army and unit subset should serve as the first encoded case?
2. Which exact 11th-edition rules revision and mission pack should be frozen?
3. Should the first board model use a one-dimensional lane or a small 2D grid?
4. Which post-game record is available for replay?
5. Which output matters first: list-hole report, breakpoint report, or VP envelope?

## Continuation prompt

Use the attached handoff documents as authoritative conversation context. Help formalize and test the Warhammer Generative Geometry research program. Begin from finite state spaces and exact rule operators. Preserve uncertainty and identify every speculative claim. Build the smallest falsifiable model first.
