---
project: Warhammer Generative Geometry
version: 0.1.0
created: 2026-07-14
status: research handoff
rules_scope: Warhammer 40,000 11th edition concepts, with rules verification required before implementation
license_note: Personal research notes. Warhammer terminology belongs to Games Workshop.
---

# Formal Mathematical Framework

## 1. Scope

This document defines a rigorous scaffold for representing Warhammer as a finite, stochastic, adversarial, hybrid dynamical system with context-indexed history spaces and low-dimensional outcome projections.

The framework intentionally separates exact definitions from geometric interpretations.

## 2. Ruleset and entities

Let:

- \(R\) denote a fixed ruleset version.
- \(U_R\) denote the finite set of legal unit definitions under \(R\).
- \(W_R\) denote the finite set of weapon profiles under \(R\).
- \(A_R\) denote army, detachment, enhancement, stratagem, and ability definitions.
- \(M_R\) denote mission definitions, including Force Disposition relations.
- \(T_R\) denote legal terrain and deployment configurations.

All later spaces depend on \(R\). Versioning is mandatory because points, datasheets, commentary, and balance updates change the legal system.

## 3. List spaces

Let \(\mathcal{L}_i(R)\) denote the finite set of legal army lists for player \(i\) under ruleset \(R\), event constraints, and points limit.

A list is not merely a vector. A list is a typed relational object:

\[
L_i=(V_i,E_i,\lambda_i)
\]

where:

- \(V_i\) contains units, weapons, resources, and rule objects.
- \(E_i\) contains relations such as leader attachment, transport capacity, shared keywords, aura scope, and detachment access.
- \(\lambda_i\) assigns numerical and categorical attributes.

A feature map may embed a list into a vector space:

\[
\phi:\mathcal{L}_i(R)\to\mathbb{R}^n
\]

No canonical embedding is assumed. Any proposed embedding requires invariance and predictive tests.

## 4. Base context

Define a pre-game context space:

\[
\mathcal{B}_R = \mathcal{L}_A(R)\times\mathcal{L}_B(R)\times\mathcal{M}_R\times\mathcal{T}_R\times\mathcal{D}_R\times\mathcal{C}_R
\]

where:

- \(\mathcal{M}_R\) contains mission and Force Disposition pairing.
- \(\mathcal{T}_R\) contains terrain layout.
- \(\mathcal{D}_R\) contains deployment choices or fixed deployment states.
- \(\mathcal{C}_R\) contains event-specific constraints, first-turn resolution, and other fixed context.

A point \(b\in\mathcal{B}_R\) defines one fixed starting context.

Before deployment, omit \(\mathcal{D}_R\) or treat deployment as a policy-controlled variable. After deployment, include a concrete initial state.

## 5. Board states

Let \(\mathcal{X}_b\) denote the set of legal board states reachable under context \(b\).

A state \(x\in\mathcal{X}_b\) may include:

\[
x=(p,q,h,s,r,o,v,\tau,\varphi,\kappa)
\]

with:

- \(p\): model or unit positions and orientations
- \(q\): unit membership, coherency, attachment, transport, and reserve status
- \(h\): remaining wounds and destroyed-model information
- \(s\): status effects, battle-shock, actions, and temporary rules
- \(r\): command points and other resources
- \(o\): objective ownership and control values
- \(v\): accumulated victory points
- \(\tau\): battle round and turn
- \(\varphi\): phase and activation location
- \(\kappa\): pending triggers, choices, and rule-resolution stack

The state space mixes continuous coordinates, integers, categories, graphs, and finite automata. It is a hybrid state space.

## 6. Actions and legality

For each state \(x\), define legal actions:

\[
\mathcal{A}_i(x,b)
\]

for player \(i\).

An action may encode target selection, movement path, stratagem use, unit activation, weapon allocation, charge declaration, pile-in, consolidation, or mission action.

Legality is a predicate:

\[
\operatorname{Legal}_R(x,a,b)\in\{0,1\}
\]

## 7. Dice and random events

For \(n\) independent fair D6 rolls:

\[
\Omega_n=\{1,2,3,4,5,6\}^n
\]

with uniform measure \(\mu_n\) before rerolls or replacement rules.

A complete random event variable \(\omega\) may also include random attack counts, damage rolls, mission randomness, and tie-break procedures.

Rules can transform the measure, event partition, or sample space. A reroll defines a conditional resampling operator. An automatic success bypasses a roll and changes the transition graph.

## 8. State transition

A deterministic rule interpreter with explicit random input has form:

\[
x_{t+1}=F_R(x_t,a_t,\omega_t;b)
\]

A probabilistic representation integrates over \(\omega\):

\[
P_R(x_{t+1}\mid x_t,a_t,b)
\]

The system is adversarial because each player selects actions. It is stochastic because dice influence transitions. It is hybrid because continuous movement and discrete rule states coexist.

## 9. Policies and skill

A policy for player \(i\) is:

\[
\pi_i(a\mid x,b)
\]

Player skill enters through policy quality, observation, planning horizon, and execution. A list-only model cannot produce a unique game outcome without policy assumptions.

Useful policy classes include:

- uniformly random legal policy
- simple heuristic policy
- scripted archetype policy
- search-based policy
- learned policy
- human-estimated policy
- minimax or equilibrium approximation

Skill can remain outside the first prototype by fixing simple policies or analyzing reachable sets without probabilities over actions.

## 10. Histories

A finite legal history from context \(b\) is:

\[
h=(x_0,a_0,\omega_0,x_1,a_1,\omega_1,\ldots,x_T)
\]

Let \(\mathcal{H}_b\) denote all legal histories from \(b\).

The context-indexed family is:

\[
\mathcal{H}:\mathcal{B}_R\to\mathbf{Set},\qquad b\mapsto\mathcal{H}_b
\]

Its total space is the dependent sum:

\[
\mathcal{E}_R=\{(b,h):b\in\mathcal{B}_R,\ h\in\mathcal{H}_b\}
\]

with projection:

\[
\pi:\mathcal{E}_R\to\mathcal{B}_R,\qquad \pi(b,h)=b
\]

This construction is always valid as an indexed family.

## 11. Fiber-bundle status

A true fiber bundle requires a typical fiber \(F\) and local trivializations:

\[
\pi^{-1}(U)\cong U\times F
\]

for neighborhoods \(U\subseteq\mathcal{B}_R\).

Warhammer contexts can change unit counts, rule graphs, legal actions, and history branching. Fibers may fail to be homeomorphic or even share a common combinatorial type.

Safer descriptions include:

- context-indexed family of legal histories
- stratified fibration
- bundle-like family
- category of elements of \(\mathcal{H}\)
- dependent state space

The phrase **list-to-board fiber evolution** remains a custom intuitive label. Formal work should use indexed families first and promote the structure to a fiber bundle only after proving local triviality on a restricted stratum.

## 12. Outcome maps

Define an outcome map:

\[
O:\mathcal{E}_R\to\mathcal{Y}
\]

Possible outcome coordinates include final score, surviving units, objective control history, resource use, damage, and positional control.

Victory-point projection is:

\[
V:\mathcal{E}_R\to\mathbb{R}^2,\qquad V(b,h)=(VP_A(h),VP_B(h))
\]

Score strain is:

\[
\Delta V(b,h)=VP_A(h)-VP_B(h)
\]

For fixed policies:

\[
\mathbb{E}_{\pi_A,\pi_B}[\Delta V\mid b]
\]

For robust adversarial planning:

\[
J_A(b,x)=\max_{\pi_A}\min_{\pi_B}\mathbb{E}[\Delta V\mid b,x,\pi_A,\pi_B]
\]

This value function is a precise version of projected scoring advantage.

## 13. Reachable outcome sets

For state \(x\) at time \(t\), define reachable terminal VP set:

\[
\mathcal{R}_{VP}(x,t)=\{V(h):h\text{ is a legal continuation from }x\}
\]

Useful derived objects:

- support of terminal VP distribution
- minimum and maximum VP per player
- Pareto frontier
- convex hull as a coarse envelope
- robust lower and upper bounds
- probability contours under policy assumptions

A scoring envelope is a custom name for one chosen representation of \(\mathcal{R}_{VP}\) or its probability-weighted support.

## 14. Projection stack

A proposed projection stack is:

\[
\text{rules and values}
\to \text{relations}
\to \text{thresholds and legal regions}
\to \text{dice events}
\to \text{state transitions}
\to \text{board histories}
\to \text{VP outcomes}
\]

Each arrow is a map. Some maps are deterministic, some stochastic, some many-to-one, and some context-dependent.

Dimensional reduction occurs because many distinct histories share one final score.

## 15. Geometry requirements

Calling a representation geometric requires explicit structure. Candidate structures include:

- metric space
- normed vector space
- inner-product space
- graph metric
- simplicial complex
- cell complex
- manifold or stratified manifold
- measure space
- partially ordered set
- category

A visual embedding alone does not establish intrinsic geometry.

## 16. Relational typing

Let \(v_i,v_j\) be raw values and \(c\) be context. Define a proposed role assignment:

\[
\tau(v_i,v_j,c)\in\mathcal{T}
\]

where \(\mathcal{T}\) may include:

- scale relation
- ratio relation
- threshold relation
- orientation relation
- reachability relation
- capacity relation
- ordering relation
- coupling relation
- resource-conversion relation

The role depends on operator behavior, not on stat labels alone.

## 17. Sparse inverse generative scaffold

Let \(y\in\mathcal{Y}\) denote an observable or full shape representation. Let \(z\in\mathbb{R}^k\) denote sparse coordinates. A generative map is:

\[
G:\mathbb{R}^k\times\mathcal{C}\to\mathcal{Y}
\]

A reconstruction map is:

\[
I:\mathcal{Y}_{obs}\to\mathbb{R}^k
\]

A sparse identifiable coordinate set satisfies:

1. Reconstruction error remains below tolerance.
2. Distinct latent coordinates produce distinguishable generated outputs, locally or globally.
3. No strict subset reaches the same tolerance and identifiability target.

Warhammer hypothesis: a compact relational coordinate set may reconstruct strategically important outcome geometry across a defined context class.

## 18. Smoothness and differential geometry

Global Warhammer rules are discrete and discontinuous. Thresholds create piecewise-constant or piecewise-defined maps. Differential geometry does not apply directly everywhere.

Three valid routes exist:

1. Study smooth strata between rule boundaries.
2. Use stratified geometry across discrete regions.
3. Introduce continuous relaxations for sensitivity analysis, then verify results against exact discrete rules.

Likely mathematical home:

- discrete and computational geometry for legal regions and reachability
- stochastic games and control theory for actions and adversaries
- hybrid systems for mixed state types
- stratified geometry for thresholds and rule regimes
- inverse problems and identifiability for sparse reconstruction
- probability and combinatorics for dice
- formal methods for rule correctness
- differential geometry only on suitable embeddings or relaxed strata
