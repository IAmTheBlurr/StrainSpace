---
project: Warhammer Generative Geometry
version: 0.1.0
created: 2026-07-14
status: research handoff
rules_scope: Warhammer 40,000 11th edition concepts, with rules verification required before implementation
license_note: Personal research notes. Warhammer terminology belongs to Games Workshop.
---

# Pair Geometry and Dice Projections

## 1. Why pair relations matter

A single characteristic often lacks operational meaning. Rules compare, combine, clamp, threshold, or route values. The primitive object is frequently a relation plus an operator.

For Strength and Toughness, the relevant map is not a generic Euclidean distance. The wound rule uses multiplicative comparison.

## 2. Strength-Toughness plane

Let \(S>0\) and \(T>0\). The positive quadrant forms a two-dimensional value space:

\[
\mathcal{P}_{ST}=\{(S,T):S>0,T>0\}
\]

The wound rule partitions this plane with threshold boundaries:

\[
S=T,\qquad S=2T,\qquad T=2S
\]

These boundaries create five rule regions.

## 3. Ratio coordinate

Define:

\[
r=S/T
\]

The wound threshold depends on regions of \(r\):

\[
Q(r)=
\begin{cases}
2,& r\ge 2\\
3,& 1<r<2\\
4,& r=1\\
5,& 1/2<r<1\\
6,& 0<r\le 1/2
\end{cases}
\]

Here, \(Q\) returns the required unmodified D6 wound roll under the basic rule.

## 4. Log-ratio strain

Define pair strain:

\[
\sigma=\log(S/T)
\]

Then:

\[
Q(\sigma)=
\begin{cases}
2,& \sigma\ge \log 2\\
3,& 0<\sigma<\log 2\\
4,& \sigma=0\\
5,& -\log 2<\sigma<0\\
6,& \sigma\le-\log 2
\end{cases}
\]

This coordinate has useful symmetry:

\[
\sigma(T,S)=-\sigma(S,T)
\]

A multiplicative change becomes additive:

\[
\log(S_1/T)+\log(S_2/S_1)=\log(S_2/T)
\]

The coordinate provides a disciplined version of balanced versus strained relation.

## 5. Examples

### Equal pair

\[
S=10,\quad T=10,\quad \sigma=0
\]

The wound threshold is 4+.

### Moderate attacker advantage

\[
S=13,\quad T=8,\quad \sigma=\log(13/8)\approx0.486
\]

Since \(0<0.486<\log2\approx0.693\), the threshold is 3+.

### Double threshold

\[
S=8,\quad T=4,\quad \sigma=\log2
\]

The threshold is 2+.

### Equal delta with different result

\[
(4,2)\text{ and }(12,10)
\]

Both pairs have delta 2. The first reaches 2+, while the second reaches 3+. Delta alone is insufficient.

## 6. Dice projection

For required roll \(k\in\{2,3,4,5,6\}\):

\[
E_k=\{k,k+1,\ldots,6\}
\]

With a fair D6:

\[
p_k=P(E_k)=\frac{7-k}{6}
\]

So:

- 2+ maps to \(5/6\)
- 3+ maps to \(4/6\)
- 4+ maps to \(3/6\)
- 5+ maps to \(2/6\)
- 6+ maps to \(1/6\)

The composite wound projection is:

\[
(S,T)\mapsto \sigma\mapsto Q(\sigma)\mapsto E_{Q(\sigma)}\mapsto p_{Q(\sigma)}
\]

## 7. Information loss

This projection is many-to-one. Every pair inside one region maps to the same threshold.

Examples:

- \((S,T)=(6,5)\) and \((13,8)\) both map to 3+.
- Their pair strains differ.
- The D6 projection discards within-region separation.

This information loss explains why breakpoint analysis matters. Small changes often do nothing until a threshold boundary is crossed.

## 8. Threshold geometry

The wound map is piecewise constant on regions of the \((S,T)\) plane. The geometry has sharp boundaries and no global smooth derivative.

A sensitivity method should distinguish:

- within-region perturbation: no threshold change
- boundary crossing: discrete probability jump
- rule modifier: possible shift into another region or direct threshold change

## 9. Hit, wound, and save as factors

A simple attack sequence can use factors:

\[
\mathcal{G}=\mathcal{G}_{hit}\times\mathcal{G}_{wound}\times\mathcal{G}_{save}
\]

This product notation expresses factor structure. It does not prove Euclidean orthogonality.

For a clean independent per-attack chain:

\[
p_{unsaved}=p_{hit}\,p_{wound}\,p_{failed\ save}
\]

Expected unsaved attacks from \(N\) attacks:

\[
\mathbb{E}[U]=N\,p_{hit}\,p_{wound}\,p_{failed\ save}
\]

Expected damage under independent damage variable \(D\):

\[
\mathbb{E}[Damage]=\mathbb{E}[U]\,\mathbb{E}[D]
\]

This baseline fails when rules create dependencies, caps, spillover constraints, mortal wounds, damage reduction, or conditional damage.

## 10. Attack geometry needs more than three gates

The hit-wound-save sequence captures three major threshold stages. Full board effect also depends on:

- attack count
- target allocation
- damage distribution
- model wounds
- damage spill rules
- feel-no-pain style prevention
- mortal or special damage channels
- model removal and unit coherency
- downstream loss of OC, movement, weapons, or abilities

A complete model is a coupled operator network rather than a cube with only three axes.

## 11. Coupling examples

Use a factor graph or operator graph.

- **Automatic wound from hit result:** edge from hit result to wound outcome.
- **Extra hits:** edge from hit event to attack-count node.
- **Critical wound changes save:** edge from wound event to save operator.
- **Cover:** terrain and target state feed into save threshold.
- **Damage reduction:** target rule modifies damage operator.
- **Reroll:** failure event routes back into the same dice space.

## 12. String-art line envelope

Suppose perpendicular axes have lengths \(A\) and \(B\). Let a parameter \(t\in(0,1)\) select intercepts:

\[
(At,0),\qquad (0,B(1-t))
\]

The line family is:

\[
\frac{x}{At}+\frac{y}{B(1-t)}=1
\]

The envelope follows from solving the line equation with its derivative in \(t\). One form is:

\[
\sqrt{x/A}+\sqrt{y/B}=1
\]

After algebraic transformation, this is a conic-related parabola form. Equal \(A\) and \(B\) create symmetry in scale. They do not create a circle under this construction.

This established envelope concept may still inspire a Warhammer method. A family of pair constraints can generate a boundary curve. The pairing rule must be defined before interpreting the curve.

## 13. Candidate pair classes

A first-principles parser can classify pair behavior after inspecting the operator:

1. Ratio quantizer: Strength versus Toughness.
2. Threshold shift: armour penetration versus save.
3. Reach overlap: movement or range versus distance.
4. Capacity allocation: transport capacity versus model cost.
5. Contest relation: objective control versus opposing objective control.
6. Resource conversion: command points versus stratagem costs.
7. Timing relation: duration versus phase or turn window.
8. Topological permission: keyword pair controls legal connectivity.

## 14. Pair test protocol

For values \(a,b\) and rule operator \(f\):

1. Enumerate legal values of \((a,b)\).
2. Compute \(f(a,b)\).
3. Plot or tabulate constant-output regions.
4. Identify boundaries.
5. Test scale invariance: compare \(f(a,b)\) with \(f(ca,cb)\).
6. Test swap symmetry: compare \(f(a,b)\) with \(f(b,a)\).
7. Test monotonicity.
8. Search for a coordinate transform which simplifies boundaries.
9. Quantify information loss under projection.
10. Validate against exact rules examples.

## 15. Expected result

Many Warhammer pair maps will be finite, monotone, and piecewise-defined. Natural coordinates may include ratio, log ratio, difference, normalized difference, order relation, or graph distance. No single coordinate will fit every mechanic.
