---
project: Warhammer Generative Geometry
version: 0.1.0
created: 2026-07-14
status: research handoff
rules_scope: Warhammer 40,000 11th edition concepts, with rules verification required before implementation
license_note: Personal research notes. Warhammer terminology belongs to Games Workshop.
---

# Plain-Language Primer

## 1. The central idea

Warhammer appears on the table as models, distances, dice, wounds, objectives, and points. Those visible events may be treated as low-dimensional outputs from a much larger rule system.

A list already has structure before deployment. A mission already restricts scoring paths before the first move. Deployment narrows reachable futures. Each action narrows them further. Dice select among remaining branches. Victory points compress the entire history into two scores.

The proposed research program studies the structure before compression.

## 2. Why aggregate statistics often mislead

A faction win rate merges many different causes:

- faction and detachment choices
- Force Dispositions
- mission pairing
- terrain layout
- list composition
- deployment
- player policy and skill
- rules familiarity
- opponent mix
- event format
- sample size
- rules version

A single percentage hides these variables. Early-edition data adds severe selection bias because players use unfamiliar lists and incomplete strategic models.

Statistics remain useful. The problem concerns premature aggregation. Structural modeling can define better variables, better strata, and better comparisons before statistical estimation begins.

## 3. Sparse reconstruction

The garment example provides the motivating pattern.

Conventional drafting measures many surface distances. A sparse reconstruction method seeks a smaller set of measurements whose relations determine a hidden scaffold. A generative procedure then reconstructs other measurements or shape features.

The Warhammer analogue asks:

- Is there a compact set of relational coordinates which identifies important list behavior?
- Can rules generate a larger geometry from these coordinates?
- Can the resulting geometry project into dice thresholds, board control, and victory points?

A successful answer would not require millions of games. It would require a correct model, valid constraints, and tests against observed play.

## 4. Numbers do not arrive with geometric roles

A raw scalar has no automatic geometric meaning. A value becomes meaningful through a relation and an operator.

Strength 8 alone says little. Toughness 8 alone says little. Their relation enters a wound rule. The rule converts the relation into a threshold. The threshold selects successful faces in a D6 sample space. The selected faces produce a probability. Repeated attack resolution contributes to damage and model removal.

The chain is:

`raw values -> relation -> rule operator -> dice event -> probability distribution -> state transition -> board effect`

## 5. Ruler-like and protractor-like values

The conversation introduced two intuitive value roles:

- **Ruler-like value**: a magnitude, extent, capacity, or scale.
- **Protractor-like value**: an orientation, alignment, phase, or relational selector.

These labels are useful as exploratory metaphors. They are not formal mathematical types yet.

A stronger first-principles approach begins with untyped values. A relational typing procedure examines how a pair behaves under a rule. A pair may produce scale, orientation, threshold, ordering, coupling, reachability, or another role.

## 6. Orthogonality requires a metric

Placing two numbers on perpendicular axes creates a coordinate picture. Formal orthogonality needs an inner product or metric. Equal numeric values do not automatically create a balanced physical system because the axes may use different units, scales, semantics, or nonlinear rules.

For Strength and Toughness, a ratio is more natural than a raw difference. The wound rule uses equality, ordering, and doubling thresholds. A difference alone loses information.

Example:

- Strength 4 and Toughness 2 have difference 2 and reach the double threshold.
- Strength 12 and Toughness 10 also have difference 2 and do not reach the double threshold.

A ratio-based coordinate preserves the relevant relation.

## 7. Pair strain

A useful proposed coordinate is log-ratio strain:

\[
\sigma(S,T)=\log(S/T)
\]

Properties:

- balanced pair: \(S=T\), so \(\sigma=0\)
- attacker advantage: \(S>T\), so \(\sigma>0\)
- defender advantage: \(S<T\), so \(\sigma<0\)
- swap Strength and Toughness: the sign flips
- double threshold: \(\sigma=\log 2\)
- half threshold: \(\sigma=-\log 2\)

The wound rule becomes a quantized projection of strain into five wound thresholds.

## 8. Dice space

A single D6 has finite sample space:

\[
\Omega_1=\{1,2,3,4,5,6\}
\]

A threshold such as 4+ selects event:

\[
E_{4+}=\{4,5,6\}
\]

With a fair D6:

\[
P(E_{4+})=3/6=1/2
\]

For multiple dice:

\[
\Omega_n=\{1,2,3,4,5,6\}^n
\]

Rerolls, critical results, exploding hits, automatic success, and replacement rules alter events or measures on this finite space.

Dice space is a projection layer. It receives a threshold from a rule relation and returns a distribution over next states.

## 9. Attack gates

A basic attack often passes through three dice gates:

1. Hit gate
2. Wound gate
3. Save gate

These gates form a product-like sequence in a simple profile. They are not guaranteed to be orthogonal. The precise formal property is separability. A clean sequence factorizes. Special rules create couplings across gates.

Examples:

- A critical hit which automatically wounds couples hit space to wound space.
- Extra hits couple hit space to attack-count space.
- A critical wound which bypasses or changes saves couples wound space to save or damage space.
- Cover changes save-space thresholds.

## 10. Abstract list geometry

A list can be represented before deployment as a structured point in a high-dimensional space. Coordinates may include:

- unit counts and compositions
- movement and range profiles
- durability profiles
- attack profiles
- deployment options
- reserve access
- objective control
- action capability
- army rules
- detachment rules
- Force Dispositions
- resource economies
- rule couplings

A useful geometry cannot rely on raw stat vectors alone. Relations, rules, and mission context matter.

## 11. Board-state geometry

After deployment, the model gains an initial state:

- model positions
- unit coherency
- terrain and visibility
- objective locations
- reserves
- resources
- active mission
- turn and initiative information

A legal action transforms one board state into another. Dice select a branch. The game becomes a stochastic dynamical system with adversarial control.

## 12. Victory-point projection

Every complete or partial game history can map into a point:

\[
(VP_A,VP_B)
\]

The score difference is:

\[
\Delta VP=VP_A-VP_B
\]

Equal scores at game start mean \(0-0\). Equal scores do not imply equal win probability. Lists, mission, terrain, deployment, and policies may create advantage before turn one.

The model can estimate:

- reachable VP pairs
- expected VP pair under policy assumptions
- robust VP bounds against an adversarial opponent
- actions which expand friendly scoring while contracting enemy scoring

## 13. List-to-board fiber evolution

The conversation proposed a fiber-bundle picture.

A base point records fixed context: both lists, mission, terrain, rules version, deployment, and other pre-game parameters. Above this point sits a fiber containing every legal game history from the context.

As a strict mathematical claim, Warhammer likely forms a stratified or bundle-like family rather than a smooth fiber bundle. Different contexts can have fibers with different combinatorial structures. The fiber language remains useful when handled carefully.

## 14. Concrete outputs

A mature system could produce:

- matchup-specific breakpoint reports
- probability distributions rather than only averages
- deployment threat and scoring maps
- reachable VP envelopes
- robust turn plans
- target-priority recommendations
- list-role coverage reports
- geometric hole detection
- counterfactual post-game diagnosis
- rules interaction graphs
- sensitivity analysis for points or rules changes

## 15. What success would mean

Success requires more than an attractive visualization. A valid model should provide at least one of these gains:

- better prediction than simpler baselines
- stronger calibration across unseen matchups
- useful compression with fewer variables
- accurate counterfactual explanations
- stable list-role diagnostics
- transferable structure across factions or missions
- clearer identification of rules breakpoints and couplings

Without measurable gain, the geometric language remains metaphorical.
