import type {
  Branded,
  D6Requirement,
  DomainResult,
  ExactRational,
  Power,
  Resilience,
} from "@strainspace/rule-schema";

import { exactToNumber, makeExactRational } from "./rational-v1.js";

export type PowerResilienceExactRatio = Branded<
  ExactRational,
  "PowerResilienceExactRatio"
>;
export type PowerResilienceIndexedDifference = Branded<
  number,
  "PowerResilienceIndexedDifference"
>;

export interface PowerResilienceLogRatioView {
  readonly kind: "approximate-log-ratio";
  readonly value: number;
  readonly sourceRatio: PowerResilienceExactRatio;
}

export type PowerResilienceRegionId =
  "dominant" | "advantaged" | "balanced" | "strained" | "overmatched";

export interface PowerResilienceRelation {
  readonly relationId: "power-resilience-v1";
  readonly power: Power;
  readonly resilience: Resilience;
  readonly exactRatio: PowerResilienceExactRatio;
  readonly indexedDifference: PowerResilienceIndexedDifference;
  readonly regionId: PowerResilienceRegionId;
  readonly requirement: D6Requirement;
}

export const POWER_RESILIENCE_RELATION_V1 = {
  relationId: "power-resilience-v1",
  inputKinds: ["power", "resilience"],
  authorizedViews: [
    "exact-ratio",
    "indexed-difference",
    "approximate-log-ratio",
  ],
  sourceSpace: "Positive safe-integer Power × Resilience pairs",
  targetSpace:
    "Exact ratio, diagnostic indexed difference, approximate log view, and ordinary D6 requirement",
  invariantIds: [
    "common-scaling-invariance",
    "power-monotonicity",
    "resilience-antitonicity",
    "role-reassigned-duality",
  ],
  operatorVersion: "1.0.0",
  visualization: {
    balanceRatio: { numerator: 1, denominator: 1 },
    lowerBoundary: { numerator: 1, denominator: 2 },
    upperBoundary: { numerator: 2, denominator: 1 },
  },
} as const;

function classify(
  power: Power,
  resilience: Resilience,
): {
  readonly regionId: PowerResilienceRegionId;
  readonly requirement: D6Requirement;
} {
  const left = BigInt(power);
  const right = BigInt(resilience);
  if (left >= 2n * right)
    return {
      regionId: "dominant",
      requirement: { kind: "ordinary", minimumSuccessfulFace: 2 },
    };
  if (left > right)
    return {
      regionId: "advantaged",
      requirement: { kind: "ordinary", minimumSuccessfulFace: 3 },
    };
  if (left === right)
    return {
      regionId: "balanced",
      requirement: { kind: "ordinary", minimumSuccessfulFace: 4 },
    };
  if (2n * left > right)
    return {
      regionId: "strained",
      requirement: { kind: "ordinary", minimumSuccessfulFace: 5 },
    };
  return {
    regionId: "overmatched",
    requirement: { kind: "ordinary", minimumSuccessfulFace: 6 },
  };
}

export function analyzePowerResilience(
  power: Power,
  resilience: Resilience,
): DomainResult<PowerResilienceRelation> {
  const ratio = makeExactRational(power, resilience);
  if (!ratio.ok) return ratio;
  const classification = classify(power, resilience);
  return {
    ok: true,
    value: {
      relationId: "power-resilience-v1",
      power,
      resilience,
      exactRatio: ratio.value as PowerResilienceExactRatio,
      indexedDifference: (power -
        resilience) as PowerResilienceIndexedDifference,
      ...classification,
    },
  };
}

export function powerResilienceExactRatio(
  relation: PowerResilienceRelation,
): PowerResilienceExactRatio {
  return relation.exactRatio;
}

export function powerResilienceIndexedDifference(
  relation: PowerResilienceRelation,
): PowerResilienceIndexedDifference {
  return relation.indexedDifference;
}

export function powerResilienceLogRatioView(
  relation: PowerResilienceRelation,
): PowerResilienceLogRatioView {
  return {
    kind: "approximate-log-ratio",
    value: Math.log(exactToNumber(relation.exactRatio)),
    sourceRatio: relation.exactRatio,
  };
}

export function powerResilienceRequirement(
  relation: PowerResilienceRelation,
): D6Requirement {
  return relation.requirement;
}
