import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { powerResilienceThreshold, representPair } from "../src/thresholds.js";

describe("pair representations", () => {
  it("difference and log-ratio are antisymmetric while ratio is reciprocal", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 1, max: 100 }),
        (left, right) => {
          expect(representPair(left, right, "difference")).toBeCloseTo(
            -representPair(right, left, "difference"),
            12,
          );
          expect(representPair(left, right, "log-ratio")).toBeCloseTo(
            -representPair(right, left, "log-ratio"),
            12,
          );
          expect(
            representPair(left, right, "ratio") *
              representPair(right, left, "ratio"),
          ).toBeCloseTo(1, 12);
        },
      ),
    );
  });
});

describe("power-resilience threshold map", () => {
  it.each([
    [8, 4, 2],
    [7, 4, 3],
    [4, 4, 4],
    [3, 4, 5],
    [2, 4, 6],
  ] as const)(
    "maps (%d, %d) to %d+ at exact boundaries",
    (power, resilience, threshold) => {
      expect(powerResilienceThreshold(power, resilience)).toBe(threshold);
    },
  );

  it("is monotone in power and resilience", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        fc.integer({ min: 1, max: 50 }),
        fc.integer({ min: 1, max: 50 }),
        (a, b, resilience) => {
          const lowerPower = Math.min(a, b);
          const higherPower = Math.max(a, b);
          expect(
            powerResilienceThreshold(higherPower, resilience),
          ).toBeLessThanOrEqual(
            powerResilienceThreshold(lowerPower, resilience),
          );
        },
      ),
    );
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 }),
        fc.integer({ min: 1, max: 50 }),
        fc.integer({ min: 1, max: 50 }),
        (a, b, power) => {
          const lowerResilience = Math.min(a, b);
          const higherResilience = Math.max(a, b);
          expect(
            powerResilienceThreshold(power, higherResilience),
          ).toBeGreaterThanOrEqual(
            powerResilienceThreshold(power, lowerResilience),
          );
        },
      ),
    );
  });
});
