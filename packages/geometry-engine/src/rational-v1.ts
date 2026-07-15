import type {
  DamagePerCost,
  DomainResult,
  ExactRational,
  ExpectedDamage,
  ExpectedModelsRemoved,
  Probability,
} from "@strainspace/rule-schema";

const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);

function gcd(left: bigint, right: bigint): bigint {
  let a = left < 0n ? -left : left;
  let b = right < 0n ? -right : right;
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

export function makeExactRational(
  numerator: number | bigint,
  denominator: number | bigint = 1,
): DomainResult<ExactRational> {
  const rawNumerator =
    typeof numerator === "bigint"
      ? numerator
      : Number.isSafeInteger(numerator)
        ? BigInt(numerator)
        : undefined;
  const rawDenominator =
    typeof denominator === "bigint"
      ? denominator
      : Number.isSafeInteger(denominator)
        ? BigInt(denominator)
        : undefined;
  if (rawNumerator === undefined || rawDenominator === undefined) {
    return {
      ok: false,
      error: {
        kind: "invalid-domain-value",
        quantityKind: "exact-rational",
        message: "Rational inputs must be integers.",
      },
    };
  }
  if (rawDenominator === 0n) {
    return {
      ok: false,
      error: {
        kind: "invalid-domain-value",
        quantityKind: "exact-rational",
        message: "A rational denominator cannot be zero.",
      },
    };
  }
  const sign = rawDenominator < 0n ? -1n : 1n;
  const signedNumerator = rawNumerator * sign;
  const positiveDenominator = rawDenominator * sign;
  const divisor = gcd(signedNumerator, positiveDenominator);
  const reducedNumerator = signedNumerator / divisor;
  const reducedDenominator = positiveDenominator / divisor;
  if (
    reducedNumerator < -MAX_SAFE_BIGINT ||
    reducedNumerator > MAX_SAFE_BIGINT ||
    reducedDenominator > MAX_SAFE_BIGINT
  ) {
    return {
      ok: false,
      error: {
        kind: "unsupported-computation-range",
        operatorId: "exact-rational-v1",
        message:
          "The exact result is outside the safe-integer schema-v1 representation range.",
      },
    };
  }
  return {
    ok: true,
    value: {
      numerator: Number(reducedNumerator),
      denominator: Number(reducedDenominator),
    } as ExactRational,
  };
}

export function makeProbability(
  numerator: number | bigint,
  denominator: number | bigint = 1,
): DomainResult<Probability> {
  const result = makeExactRational(numerator, denominator);
  if (!result.ok) return result;
  if (
    result.value.numerator < 0 ||
    result.value.numerator > result.value.denominator
  ) {
    return {
      ok: false,
      error: {
        kind: "invalid-domain-value",
        quantityKind: "probability",
        message: "A probability must lie in the closed interval [0, 1].",
      },
    };
  }
  return { ok: true, value: result.value as Probability };
}

export function addExact(
  left: ExactRational,
  right: ExactRational,
): DomainResult<ExactRational> {
  return makeExactRational(
    BigInt(left.numerator) * BigInt(right.denominator) +
      BigInt(right.numerator) * BigInt(left.denominator),
    BigInt(left.denominator) * BigInt(right.denominator),
  );
}

export function subtractExact(
  left: ExactRational,
  right: ExactRational,
): DomainResult<ExactRational> {
  return makeExactRational(
    BigInt(left.numerator) * BigInt(right.denominator) -
      BigInt(right.numerator) * BigInt(left.denominator),
    BigInt(left.denominator) * BigInt(right.denominator),
  );
}

export function nonnegativeDeficit(
  larger: ExactRational,
  smaller: ExactRational,
): DomainResult<ExactRational> {
  if (compareExact(larger, smaller) < 0) {
    return {
      ok: false,
      error: {
        kind: "invalid-domain-value",
        quantityKind: "nonnegative-deficit",
        message: "A nonnegative deficit requires the first value to be larger.",
      },
    };
  }
  return subtractExact(larger, smaller);
}

export function multiplyExact(
  left: ExactRational,
  right: ExactRational,
): DomainResult<ExactRational> {
  return makeExactRational(
    BigInt(left.numerator) * BigInt(right.numerator),
    BigInt(left.denominator) * BigInt(right.denominator),
  );
}

export function divideExact(
  dividend: ExactRational,
  divisor: ExactRational,
): DomainResult<ExactRational> {
  if (divisor.numerator === 0) {
    return {
      ok: false,
      error: {
        kind: "invalid-domain-value",
        quantityKind: "exact-rational",
        message: "Division by zero is undefined.",
      },
    };
  }
  return makeExactRational(
    BigInt(dividend.numerator) * BigInt(divisor.denominator),
    BigInt(dividend.denominator) * BigInt(divisor.numerator),
  );
}

export function powerExact(
  value: ExactRational,
  exponent: number,
): DomainResult<ExactRational> {
  if (!Number.isSafeInteger(exponent) || exponent < 0) {
    return {
      ok: false,
      error: {
        kind: "invalid-domain-value",
        quantityKind: "exact-rational-exponent",
        message: "An exact exponent must be a nonnegative safe integer.",
      },
    };
  }
  return makeExactRational(
    BigInt(value.numerator) ** BigInt(exponent),
    BigInt(value.denominator) ** BigInt(exponent),
  );
}

export function sumExact(
  values: readonly ExactRational[],
): DomainResult<ExactRational> {
  let totalResult = makeExactRational(0);
  for (const value of values) {
    if (!totalResult.ok) return totalResult;
    totalResult = addExact(totalResult.value, value);
  }
  return totalResult;
}

export function scaleExact(
  value: ExactRational,
  factor: number | bigint,
): DomainResult<ExactRational> {
  const safeFactor =
    typeof factor === "bigint"
      ? factor
      : Number.isSafeInteger(factor)
        ? BigInt(factor)
        : undefined;
  if (safeFactor === undefined) {
    return {
      ok: false,
      error: {
        kind: "invalid-domain-value",
        quantityKind: "integer-scale",
        message: "An exact integer scale must be integral.",
      },
    };
  }
  return makeExactRational(
    BigInt(value.numerator) * safeFactor,
    value.denominator,
  );
}

export function reciprocalExact(
  value: ExactRational,
): DomainResult<ExactRational> {
  if (value.numerator === 0) {
    return {
      ok: false,
      error: {
        kind: "invalid-domain-value",
        quantityKind: "exact-rational",
        message: "Zero has no reciprocal.",
      },
    };
  }
  return makeExactRational(value.denominator, value.numerator);
}

export function compareExact(
  left: ExactRational,
  right: ExactRational,
): -1 | 0 | 1 {
  const difference =
    BigInt(left.numerator) * BigInt(right.denominator) -
    BigInt(right.numerator) * BigInt(left.denominator);
  return difference === 0n ? 0 : difference > 0n ? 1 : -1;
}

export function exactToNumber(value: ExactRational): number {
  return value.numerator / value.denominator;
}

export function exactToPercent(value: Probability, digits = 0): string {
  return `${(exactToNumber(value) * 100).toFixed(digits)}%`;
}

export function asProbability(value: ExactRational): Probability {
  return value as Probability;
}

export function asExpectedDamage(value: ExactRational): ExpectedDamage {
  return value as ExpectedDamage;
}

export function asExpectedModelsRemoved(
  value: ExactRational,
): ExpectedModelsRemoved {
  return value as ExpectedModelsRemoved;
}

export function asDamagePerCost(value: ExactRational): DamagePerCost {
  return value as DamagePerCost;
}
