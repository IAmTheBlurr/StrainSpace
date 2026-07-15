---
project: Warhammer Generative Geometry
version: 0.1.0
created: 2026-07-14
status: research handoff
rules_scope: Warhammer 40,000 11th edition concepts, with rules verification required before implementation
license_note: Personal research notes. Warhammer terminology belongs to Games Workshop.
---

# List, Board, and Victory-Point Geometry

## 1. Three modeling layers

The project benefits from three distinct layers:

1. **Abstract list layer:** capabilities and rules before placement.
2. **Board-state layer:** deployed positions, terrain, resources, and legal actions.
3. **Outcome layer:** damage, control, scoring, and final VP.

Each layer uses different mathematical objects. A projection connects layers, yet no layer should be collapsed prematurely.

## 2. Abstract list layer

Let \(L_A\) and \(L_B\) be complete lists. Define a relational capability map:

\[
\Phi(L_i,c)\in\mathcal{Z}
\]

where \(c\) includes opponent, mission, terrain assumptions, and rules version.

Candidate coordinates in \(\mathcal{Z}\):

- threat reach by turn
- anti-light, anti-elite, anti-vehicle, and anti-monster attack distributions
- durability under opponent profiles
- objective control transport capacity
- action throughput
- reserve and redeployment access
- screening density
- mobility topology
- resource demand and generation
- mission-specific scoring access
- denial capability
- rule-coupling signatures

The map is contextual. A list has no single universal geometry independent of opponent and mission.

## 3. Matchup geometry

Define pair map:

\[
\Psi(L_A,L_B,m,t)\in\mathcal{Z}_{match}
\]

where \(m\) is mission context and \(t\) is terrain context.

This map can compare capability surfaces rather than unit labels.

Possible outputs:

- favorable and unfavorable target classes
- reciprocal threat asymmetry
- scoring-role overlap
- denial asymmetry
- resource pressure
- deployment burden
- initiative sensitivity

## 4. Deployment as an initial condition

A deployed game state \(x_0\) converts abstract list potential into concrete reachability.

Before deployment, many positions remain possible. After deployment, threat regions, line-of-sight constraints, reserve entry zones, and objective paths become computable.

The transition is:

\[
(L_A,L_B,m,t,d)\mapsto x_0
\]

where \(d\) encodes both deployments and first-turn conditions.

## 5. Movement and reachability

For unit \(u\) in state \(x\), define one-step reachable region:

\[
\mathcal{R}_u^{(1)}(x)
\]

Multi-turn reachability is recursive:

\[
\mathcal{R}_u^{(k+1)}(x)=\bigcup_{y\in\mathcal{R}_u^{(k)}(x)}\mathcal{R}_u^{(1)}(y)
\]

Actual rules require obstacles, coherency, engagement range, advance, charge, transport, reserve, and mission constraints.

Threat region adds weapon reach and target eligibility:

\[
\mathcal{T}_u^{(k)}(x)=\{z:\text{unit }u\text{ can legally affect }z\text{ within }k\text{ steps}\}
\]

## 6. Scoring capability fields

For player \(i\), define a mission-specific scoring field over board states:

\[
S_i(x,t)\in\mathbb{R}
\]

This may represent immediate scoring, expected future scoring, or robust guaranteed scoring.

A denial field can represent impact on opponent scoring:

\[
D_i(x,t)\in\mathbb{R}
\]

Combined local value:

\[
U_i(x,t)=S_i(x,t)+D_i(x,t)-C_i(x,t)
\]

where \(C_i\) captures risk, resource cost, or future opportunity loss.

## 7. VP space

Terminal VP outcomes lie in:

\[
\mathcal{V}\subseteq\mathbb{Z}_{\ge0}^2
\]

Each point is \((VP_A,VP_B)\).

Useful coordinates:

\[
\Delta=VP_A-VP_B
\]

and

\[
\Sigma=VP_A+VP_B
\]

\(\Delta\) measures score advantage. \(\Sigma\) measures total scoring intensity. Two games can share \(\Delta\) while having very different suppression or scoring patterns.

## 8. Start-of-game balance

At the first scoring instant, observed VP may be equal. Win probability need not equal one-half.

Define pregame value:

\[
J_0=\mathbb{E}[\Delta\mid L_A,L_B,m,t,d,\pi_A,\pi_B]
\]

If policies remain unspecified, compute a range or robust bound rather than one number.

## 9. Reachable VP envelope

From current state \(x_t\):

\[
\mathcal{R}_{VP}(x_t)=\{(VP_A,VP_B)\text{ reachable under legal continuations}\}
\]

Possible representations:

- exact set for tiny games
- bounding box
- convex hull
- Pareto frontier
- probability heat map
- quantile contours
- robust adversarial envelope

The envelope should contract as the game progresses. Unexpected expansion may signal hidden options, newly activated rules, or modeling error.

## 10. VP strain

Observed strain:

\[
\Delta_t=VP_A(t)-VP_B(t)
\]

Projected strain under policies:

\[
\widehat{\Delta}_t=\mathbb{E}[VP_A(T)-VP_B(T)\mid x_t]
\]

Robust strain:

\[
\underline{\Delta}_t=\max_{\pi_A}\min_{\pi_B}\mathbb{E}[\Delta_T\mid x_t]
\]

The robust version asks: what score difference can player A protect against a best-response opponent, given model assumptions?

## 11. Turn-plan generation

For each legal candidate action \(a\), estimate:

\[
Q(x_t,a)=\text{future VP value after action }a
\]

A decision aid can report:

- immediate VP swing
- denied opponent VP
- future reachable VP range
- resource cost
- casualty risk
- dependence on dice tails
- opponent counterplay
- reversibility

The output should use plain language and preserve uncertainty.

## 12. Force-Disposition geometry

A Force Disposition pairing selects mission structure and therefore changes the scoring map.

Formal role:

\[
m=f_{FD}(d_A,d_B,\text{mission deck},R)
\]

The selected mission changes:

- scoring events
- valuable board regions
- timing windows
- unit-role value
- denial priorities
- terminal VP support

Therefore list evaluation should condition on disposition pairing rather than average across all missions.

## 13. Geometry of list holes

Let \(\mathcal{C}\) be a set of relevant contexts, such as opponent archetype, mission, terrain, and turn stage. Let capability score be:

\[
K(L,c)
\]

Define a hole region:

\[
\mathcal{H}_\theta(L)=\{c\in\mathcal{C}:K(L,c)<\theta\}
\]

Possible hole types:

- no reliable answer to a durability band
- insufficient OC transport to a scoring region
- weak reserve screening
- no low-cost action unit
- poor late-turn reach
- excessive command-point contention
- dependence on one fragile rule coupling

## 14. Geometry versus semantics

The model should erase names when possible and preserve behavior. Two units with different lore labels may occupy similar capability regions. Two units with similar stat lines may differ strongly because their rule graphs create different topology or coupling.

## 15. Concrete player-facing dashboard

A practical interface could display:

- current VP pair and projected VP distribution
- robust VP lower bound
- three highest-leverage actions
- enemy scoring routes
- own scoring routes
- breakpoints reachable with available buffs
- threatened units and objectives
- list-role coverage and holes
- post-game counterfactuals

The interface is a low-dimensional projection of the model, not the model itself.
