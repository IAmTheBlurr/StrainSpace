import fc from "fast-check";
import { describe, expect, it } from "vitest";

import { D6_FACES, enumerateD6Threshold } from "../src/dice.js";

describe("D6 threshold enumeration", () => {
  it.each([2, 3, 4, 5, 6, 7] as const)(
    "exhaustively enumerates %d+",
    (threshold) => {
      const outcome = enumerateD6Threshold(threshold);
      const bruteForce = D6_FACES.filter((face) => face >= threshold);
      expect(outcome.successfulFaces).toEqual(bruteForce);
      expect(outcome.probability).toEqual({
        numerator: bruteForce.length,
        denominator: 6,
      });
    },
  );

  it("is monotone as the required threshold rises", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 7 }),
        fc.integer({ min: 2, max: 7 }),
        (left, right) => {
          const low = Math.min(left, right) as 2 | 3 | 4 | 5 | 6 | 7;
          const high = Math.max(left, right) as 2 | 3 | 4 | 5 | 6 | 7;
          expect(
            enumerateD6Threshold(low).successfulFaces.length,
          ).toBeGreaterThanOrEqual(
            enumerateD6Threshold(high).successfulFaces.length,
          );
        },
      ),
    );
  });
});
