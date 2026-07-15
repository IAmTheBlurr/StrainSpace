import {
  PairRelationSchema,
  ThresholdMapSchema,
  type D6Threshold,
  type PairRelation,
  type PairRepresentation,
  type ThresholdMap,
} from "@strainspace/rule-schema";

export const BASIC_POWER_RESILIENCE_THRESHOLD_MAP: ThresholdMap =
  ThresholdMapSchema.parse({
    mapId: "basic-power-resilience",
    displayName: "Basic power-resilience threshold map",
    sourceSpace: "Positive integer pairs (power, resilience)",
    targetSpace: "Ordinary D6 thresholds {2, 3, 4, 5, 6}",
    coordinate: "ratio",
    metricRule:
      "Ordered multiplicative comparison; no Euclidean distance is asserted.",
    invariants: [
      "Scaling power and resilience by the same positive factor preserves the region.",
      "Increasing power cannot worsen the threshold for fixed resilience.",
      "Increasing resilience cannot improve the threshold for fixed power.",
    ],
    uncertainty:
      "None inside the clean basic map; external operators are excluded.",
    failureConditions: [
      "A modifier replaces or shifts the ordinary comparison.",
      "A cross-stage operator bypasses the power-resilience roll.",
    ],
    regions: [
      {
        regionId: "dominant",
        label: "At least double",
        minimumRatio: 2,
        maximumRatio: null,
        minimumInclusive: true,
        maximumInclusive: false,
        threshold: 2,
      },
      {
        regionId: "advantaged",
        label: "Greater than",
        minimumRatio: 1,
        maximumRatio: 2,
        minimumInclusive: false,
        maximumInclusive: false,
        threshold: 3,
      },
      {
        regionId: "balanced",
        label: "Equal",
        minimumRatio: 1,
        maximumRatio: 1,
        minimumInclusive: true,
        maximumInclusive: true,
        threshold: 4,
      },
      {
        regionId: "strained",
        label: "Less than",
        minimumRatio: 0.5,
        maximumRatio: 1,
        minimumInclusive: false,
        maximumInclusive: false,
        threshold: 5,
      },
      {
        regionId: "overmatched",
        label: "At most half",
        minimumRatio: null,
        maximumRatio: 0.5,
        minimumInclusive: false,
        maximumInclusive: true,
        threshold: 6,
      },
    ],
  });

export function representPair(
  leftValue: number,
  rightValue: number,
  representation: PairRepresentation,
): number {
  if (leftValue <= 0 || rightValue <= 0) {
    throw new RangeError(
      "Pair representations require positive values in this MVP.",
    );
  }
  switch (representation) {
    case "difference":
      return leftValue - rightValue;
    case "ratio":
      return leftValue / rightValue;
    case "log-ratio":
      return Math.log(leftValue / rightValue);
  }
}

export function powerResilienceThreshold(
  power: number,
  resilience: number,
): D6Threshold {
  if (
    !Number.isFinite(power) ||
    !Number.isFinite(resilience) ||
    power <= 0 ||
    resilience <= 0
  ) {
    throw new RangeError(
      "Power and resilience must be finite positive values.",
    );
  }
  if (power >= 2 * resilience) return 2;
  if (power > resilience) return 3;
  if (power === resilience) return 4;
  if (2 * power > resilience) return 5;
  return 6;
}

export function powerResilienceRegionId(threshold: D6Threshold): string {
  const region = BASIC_POWER_RESILIENCE_THRESHOLD_MAP.regions.find(
    (candidate) => candidate.threshold === threshold,
  );
  if (region === undefined)
    throw new RangeError(
      `No power-resilience region exists for threshold ${threshold}.`,
    );
  return region.regionId;
}

export function computePowerResilienceRelation(
  power: number,
  resilience: number,
  representation: PairRepresentation = "log-ratio",
): PairRelation {
  const threshold = powerResilienceThreshold(power, resilience);
  return PairRelationSchema.parse({
    leftValue: power,
    rightValue: resilience,
    representation,
    strain: representPair(power, resilience, representation),
    regionId: powerResilienceRegionId(threshold),
    threshold,
  });
}
