import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { PowerSchema, ResilienceSchema } from "@strainspace/rule-schema";

import {
  analyzePowerResilience,
  powerResilienceLogRatioView,
} from "../src/power-resilience.js";

function relation(powerValue: number, resilienceValue: number) {
  const result = analyzePowerResilience(
    PowerSchema.parse(powerValue),
    ResilienceSchema.parse(resilienceValue),
  );
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error("Expected a supported relation.");
  return result.value;
}

describe("power-resilience-v1", () => {
  it.each([
    [8, 4, "dominant", 2],
    [7, 4, "advantaged", 3],
    [4, 4, "balanced", 4],
    [3, 4, "strained", 5],
    [2, 4, "overmatched", 6],
  ] as const)(
    "maps (%d, %d) to %s and %d+",
    (power, resilience, regionId, minimumSuccessfulFace) => {
      const result = relation(power, resilience);
      expect(result.regionId).toBe(regionId);
      expect(result.requirement).toEqual({
        kind: "ordinary",
        minimumSuccessfulFace,
      });
    },
  );

  it("preserves the exact ratio and approximate logarithm", () => {
    const result = relation(13, 8);
    expect(result.exactRatio).toEqual({ numerator: 13, denominator: 8 });
    expect(powerResilienceLogRatioView(result).value).toBeCloseTo(
      Math.log(13 / 8),
      14,
    );
  });

  it("tests duality through explicit role reassignment", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        (powerMagnitude, resilienceMagnitude) => {
          const direct = relation(powerMagnitude, resilienceMagnitude);
          const dual = relation(resilienceMagnitude, powerMagnitude);
          expect(dual.indexedDifference + direct.indexedDifference).toBe(0);
          expect(dual.exactRatio.numerator * direct.exactRatio.numerator).toBe(
            dual.exactRatio.denominator * direct.exactRatio.denominator,
          );
          expect(powerResilienceLogRatioView(dual).value).toBeCloseTo(
            -powerResilienceLogRatioView(direct).value,
            12,
          );
          const directFace =
            direct.requirement.kind === "ordinary"
              ? direct.requirement.minimumSuccessfulFace
              : undefined;
          const dualFace =
            dual.requirement.kind === "ordinary"
              ? dual.requirement.minimumSuccessfulFace
              : undefined;
          expect(dualFace).toBe(
            directFace === undefined ? undefined : 8 - directFace,
          );
        },
      ),
    );
  });

  it("keeps difference diagnostic rather than rule sufficient", () => {
    expect(relation(4, 2).indexedDifference).toBe(2);
    expect(relation(12, 10).indexedDifference).toBe(2);
    expect(relation(4, 2).requirement).not.toEqual(
      relation(12, 10).requirement,
    );
  });

  it("is monotone and invariant under supported common scaling", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 20 }),
        (a, b, resilience, scale) => {
          const lower = Math.min(a, b);
          const higher = Math.max(a, b);
          const lowerRelation = relation(lower, resilience);
          const higherRelation = relation(higher, resilience);
          const face = (value: ReturnType<typeof relation>) =>
            value.requirement.kind === "ordinary"
              ? value.requirement.minimumSuccessfulFace
              : 7;
          expect(face(higherRelation)).toBeLessThanOrEqual(face(lowerRelation));
          expect(face(relation(a * scale, resilience * scale))).toBe(
            face(relation(a, resilience)),
          );
        },
      ),
    );
  });
});
