# Mathematical Corrections for Implementation

The detailed discussion lives across the handoff archive. This file lists implementation constraints.

## Orthogonality

Orthogonality requires a chosen inner product or metric. Two profile fields do not become orthogonal merely because the UI draws perpendicular axes.

Implementation must label visual axes as independent display coordinates unless a mathematical metric supports a stronger claim.

## Equal values and isotropy

Equal numeric values do not establish isotropy. Isotropy concerns invariance under transformations, not equality of two coordinates.

## Difference versus ratio

Raw difference may lose relevant scale information. Ratio or log ratio often preserves multiplicative relations more faithfully.

Implement all three representations and expose the selected representation.

## Tick-line envelope

A family of lines joining paired axis points forms an envelope. Equal axis lengths do not generally produce a circle. Rotation does not automatically produce a sphere.

Any envelope visualization must derive its curve from an explicit line family.

## Dice space

A D6 sample space is finite:

```text
Omega = {1, 2, 3, 4, 5, 6}
```

A threshold selects a subset. Probability follows from measure over the subset.

## Sequence factorization

Accuracy, effect, defense, and damage stages factorize only under clean independence assumptions. Cross-stage abilities introduce couplings.

## Score balance

A zero-zero starting score does not imply equal win probability. Equal score and equal forecast are separate claims.

## Global smoothness

The rules system is discrete, hybrid, and stratified. Smooth differential geometry needs a defined relaxation, interpolation, or regular region.

## Fiber language

An indexed family of histories over contexts is safe. A formal fiber bundle needs topology, local triviality, and compatible fibers. Use fiber-bundle language as analogy until those conditions receive proof.
