import type { Rational } from "@strainspace/rule-schema";

function gcd(left: bigint, right: bigint): bigint {
  let a = left < 0n ? -left : left;
  let b = right < 0n ? -right : right;
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

function fromBigInt(numerator: bigint, denominator: bigint): Rational {
  if (denominator === 0n)
    throw new RangeError("A rational denominator cannot be zero.");
  const sign = denominator < 0n ? -1n : 1n;
  const signedNumerator = numerator * sign;
  if (signedNumerator < 0n)
    throw new RangeError("Probability rationals cannot be negative.");
  const divisor = gcd(signedNumerator, denominator);
  const reducedNumerator = signedNumerator / divisor;
  const reducedDenominator = (denominator * sign) / divisor;
  const max = BigInt(Number.MAX_SAFE_INTEGER);
  if (reducedNumerator > max || reducedDenominator > max) {
    throw new RangeError(
      "Exact result exceeds the serializable safe-integer MVP domain.",
    );
  }
  return {
    numerator: Number(reducedNumerator),
    denominator: Number(reducedDenominator),
  };
}

export function rational(numerator: number, denominator = 1): Rational {
  if (!Number.isSafeInteger(numerator) || !Number.isSafeInteger(denominator)) {
    throw new RangeError("Rational inputs must be safe integers.");
  }
  return fromBigInt(BigInt(numerator), BigInt(denominator));
}

export function addRational(left: Rational, right: Rational): Rational {
  return fromBigInt(
    BigInt(left.numerator) * BigInt(right.denominator) +
      BigInt(right.numerator) * BigInt(left.denominator),
    BigInt(left.denominator) * BigInt(right.denominator),
  );
}

export function subtractRational(left: Rational, right: Rational): Rational {
  const numerator =
    BigInt(left.numerator) * BigInt(right.denominator) -
    BigInt(right.numerator) * BigInt(left.denominator);
  return fromBigInt(
    numerator < 0n ? 0n : numerator,
    BigInt(left.denominator) * BigInt(right.denominator),
  );
}

export function multiplyRational(left: Rational, right: Rational): Rational {
  return fromBigInt(
    BigInt(left.numerator) * BigInt(right.numerator),
    BigInt(left.denominator) * BigInt(right.denominator),
  );
}

export function scaleRational(value: Rational, factor: number): Rational {
  if (!Number.isSafeInteger(factor) || factor < 0)
    throw new RangeError("Scale must be a non-negative integer.");
  return fromBigInt(
    BigInt(value.numerator) * BigInt(factor),
    BigInt(value.denominator),
  );
}

export function complementRational(value: Rational): Rational {
  return subtractRational(rational(1), value);
}

export function compareRational(left: Rational, right: Rational): number {
  const difference =
    BigInt(left.numerator) * BigInt(right.denominator) -
    BigInt(right.numerator) * BigInt(left.denominator);
  return difference === 0n ? 0 : difference > 0n ? 1 : -1;
}

export function sumRationals(values: readonly Rational[]): Rational {
  return values.reduce(addRational, rational(0));
}

export function rationalToNumber(value: Rational): number {
  return value.numerator / value.denominator;
}

export function rationalToPercent(value: Rational, digits = 0): string {
  return `${(rationalToNumber(value) * 100).toFixed(digits)}%`;
}

export function powerRational(value: Rational, exponent: number): Rational {
  if (!Number.isSafeInteger(exponent) || exponent < 0) {
    throw new RangeError("Exponent must be a non-negative safe integer.");
  }
  return fromBigInt(
    BigInt(value.numerator) ** BigInt(exponent),
    BigInt(value.denominator) ** BigInt(exponent),
  );
}

export function choose(total: number, selected: number): number {
  if (selected < 0 || selected > total) return 0;
  let result = 1;
  const k = Math.min(selected, total - selected);
  for (let index = 1; index <= k; index += 1) {
    result = (result * (total - k + index)) / index;
  }
  return result;
}
