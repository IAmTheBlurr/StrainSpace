---
project: Warhammer Generative Geometry
version: 0.1.0
created: 2026-07-14
status: research handoff
rules_scope: Warhammer 40,000 11th edition concepts, with rules verification required before implementation
license_note: Personal research notes. Warhammer terminology belongs to Games Workshop.
---

# Post-Game Diagnosis and List-Hole Analysis

## 1. Goal

Convert a game record into causal, counterfactual, and mission-conditioned findings. Avoid generic statements such as "bad dice" or "wrong target" unless the model can quantify them.

## 2. Required game record

Minimum useful replay data:

- full lists and rules versions
- mission and Force Dispositions
- terrain and deployment map
- deployment positions
- turn order
- movement and action choices
- target and weapon allocation
- stratagem and resource use
- dice results or aggregate roll counts
- objective control by scoring window
- VP changes
- destroyed and damaged units

Higher fidelity produces stronger counterfactuals.

## 3. Diagnostic layers

### Layer A: Rules correctness

- Was each rule applied correctly?
- Did modifiers, caps, and timing resolve correctly?
- Did any missed rule alter a threshold or legal action?

### Layer B: Probability realization

- How likely was the observed result?
- Which roll groups were ordinary, tail events, or extreme?
- Did variance materially change the strategic state?

### Layer C: Breakpoints

- Which stat or modifier changes would cross a threshold?
- Was a buff spent without changing a threshold?
- Was a target selected near an unfavorable boundary?

### Layer D: Spatial reachability

- Which units could reach scoring or denial regions?
- Which deployment choices removed future paths?
- Which move created or closed a corridor?

### Layer E: VP projection

- Which action changed reachable VP support most?
- Which decision increased opponent robust scoring?
- Which scoring opportunity was irreversible after a specific turn?

### Layer F: Resource geometry

- Which command-point commitments competed?
- Which sequence consumed a resource needed for a later breakpoint?
- Which resource remained unused at terminal state?

## 4. Counterfactual types

### Action counterfactual

Replace one action while keeping dice and later choices fixed where legal.

### Dice-normalized counterfactual

Replace observed dice with expected distribution or percentile bands.

### Policy counterfactual

Recompute continuation with a different player policy.

### List counterfactual

Replace one unit or upgrade while preserving points and mission context.

### Deployment counterfactual

Move one unit or group within legal deployment constraints.

### Rule counterfactual

Apply a proposed balance change and measure downstream effect.

## 5. Minimal intervention

Define intervention cost \(c(i)\) and VP gain \(g(i)\). Seek:

\[
\min_i c(i)\quad\text{subject to}\quad g(i)\ge\gamma
\]

where \(\gamma\) is a meaningful VP swing.

Examples:

- one different target
- one unit held in reserve
- one command point preserved
- one movement path shifted
- one weapon profile exchanged

## 6. Regret

For action \(a_t\), define modeled regret:

\[
R_t=Q(x_t,a_t^*)-Q(x_t,a_t)
\]

where \(a_t^*\) is the best action under a selected policy model.

Report regret as a range across opponent models rather than one absolute number.

## 7. Luck versus decision

Separate variance contribution from policy contribution.

One method:

1. Replay actual decisions across many dice samples.
2. Replay alternative decisions across the same dice seeds.
3. Compare distributions.

Outputs:

- probability actual line wins
- probability alternative line wins
- expected VP difference
- variance sensitivity
- tail dependence

## 8. List-hole definition

Choose context set \(\mathcal{C}\), capability function \(K\), and threshold \(\theta\):

\[
\mathcal{H}_\theta(L)=\{c:K(L,c)<\theta\}
\]

Without explicit \(\mathcal{C}\), \(K\), and \(\theta\), a hole claim lacks falsifiability.

## 9. Candidate capability dimensions

- effective threat by range band
- expected and lower-quantile damage by target class
- durability by incoming profile
- objective-control delivery by turn
- action throughput
- screening coverage
- reserve denial
- late-game mobility
- mission-specific scoring access
- resource contention
- redundancy of critical roles

## 10. Hole severity

Define:

\[
Severity(c)=w(c)\max(0,\theta-K(L,c))
\]

where \(w(c)\) weights context frequency or importance.

Aggregate severity:

\[
H(L)=\int_{\mathcal{C}} Severity(c)\,d\mu(c)
\]

For finite contexts, use a weighted sum.

## 11. Redundancy and fragility

A list may cover a role with one unit and still remain fragile.

Define role coverage count:

\[
N_r(L,c)=\text{number of independent assets which satisfy role }r
\]

A single-point failure exists when \(N_r=1\) and loss of the asset causes a major capability drop.

## 12. Mission-conditioned hole report

Example output:

```text
Context: Reconnaissance versus Take and Hold
Primary hole: late-turn wide-board action access
Severity: high
Cause: only one independent mobile action unit
Failure mode: enemy can trade into the unit by turn two
Observed game evidence: action route collapsed after left-flank loss
Minimal list intervention: add a second low-cost mobile unit
Minimal play intervention: reserve the existing unit until turn three
Confidence: medium, depends on terrain and opponent indirect threat
```

## 13. Post-game report template

### Game identity

Rules version, mission, lists, terrain, first turn.

### Outcome

Final VP pair, score strain, surviving forces.

### Pregame geometry

Projected matchup strengths, holes, and deployment burdens.

### Critical boundaries

Thresholds and spatial breakpoints which mattered.

### High-leverage decisions

Ranked by robust VP impact.

### Variance analysis

Observed percentile and strategic consequences.

### Counterfactuals

Minimal changes and resulting VP distributions.

### List findings

Mission-conditioned role gaps and redundancy issues.

### Next-game experiments

One or two controlled changes, each with an expected observation.

## 14. Avoiding hindsight bias

A diagnosis must use information available at decision time. Hidden future dice and later opponent choices cannot justify an earlier recommendation unless the analysis is explicitly retrospective.

Use three labels:

- ex ante recommendation
- ex post explanation
- oracle counterfactual

## 15. Concrete value for list building

The system can support:

- removal of redundant capability
- purchase of missing mission access
- breakpoint-efficient upgrades
- role redundancy
- resource demand balancing
- opponent-conditioned side plans
- deployment templates
- target-class coverage

The goal is not a universal list score. The goal is a map of strengths, holes, and tradeoffs across contexts.
