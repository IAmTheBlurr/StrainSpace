import { describe, expect, it } from "vitest";

import {
  compareExact,
  makeExactRational,
  makeProbability,
  nonnegativeDeficit,
  subtractExact,
} from "../src/rational-v1.js";

function value<T>(result: { ok: true; value: T } | { ok: false }): T {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error("Expected an exact result.");
  return result.value;
}

describe("schema-v1 exact rationals", () => {
  it("canonicalizes signs, factors, and zero", () => {
    expect(value(makeExactRational(2, 4))).toEqual({
      numerator: 1,
      denominator: 2,
    });
    expect(value(makeExactRational(1, -2))).toEqual({
      numerator: -1,
      denominator: 2,
    });
    expect(value(makeExactRational(0, 6))).toEqual({
      numerator: 0,
      denominator: 1,
    });
  });

  it("supports signed subtraction and separately proven deficits", () => {
    const half = value(makeExactRational(1, 2));
    const threeQuarters = value(makeExactRational(3, 4));
    expect(value(subtractExact(half, threeQuarters))).toEqual({
      numerator: -1,
      denominator: 4,
    });
    expect(value(nonnegativeDeficit(threeQuarters, half))).toEqual({
      numerator: 1,
      denominator: 4,
    });
    expect(nonnegativeDeficit(half, threeQuarters)).toMatchObject({
      ok: false,
      error: { kind: "invalid-domain-value" },
    });
  });

  it("distinguishes invalid probabilities from unsupported representation", () => {
    expect(makeProbability(2, 1)).toMatchObject({
      ok: false,
      error: { kind: "invalid-domain-value" },
    });
    expect(
      makeExactRational(BigInt(Number.MAX_SAFE_INTEGER) + 1n, 1n),
    ).toMatchObject({
      ok: false,
      error: { kind: "unsupported-computation-range" },
    });
  });

  it("compares without floating-point conversion", () => {
    expect(
      compareExact(
        value(makeExactRational(1, 3)),
        value(makeExactRational(2, 6)),
      ),
    ).toBe(0);
  });
});
