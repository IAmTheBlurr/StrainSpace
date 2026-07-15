import { describe, expect, it } from "vitest";

import type { AttackProfile, DefenseProfile } from "@strainspace/rule-schema";

import {
  exhaustSingleAttackSequence,
  projectCleanSequence,
} from "../src/projection.js";
import { compareRational, rational, sumRationals } from "../src/rational.js";

const attack: AttackProfile = {
  id: "test-profile",
  displayName: "Test Profile",
  count: 4,
  accuracyThreshold: 3,
  power: 8,
  penetration: 2,
  damage: 2,
  tags: [],
  operators: [],
};

const defense: DefenseProfile = {
  resilience: 6,
  protectionThreshold: 3,
  health: 3,
  modelCount: 3,
};

describe("clean sequence projection", () => {
  it("matches exhaustive enumeration of all 216 single-attack paths", () => {
    const projection = projectCleanSequence(attack, defense);
    const exhaustive = exhaustSingleAttackSequence(attack, defense);
    expect(
      compareRational(
        projection.singleAttackEffectProbability,
        rational(exhaustive.successfulPaths, 216),
      ),
    ).toBe(0);
  });

  it("produces an exact normalized effect distribution", () => {
    const projection = projectCleanSequence(attack, defense);
    const total = sumRationals(
      projection.effectDistribution.outcomes.map(
        (outcome) => outcome.probability,
      ),
    );
    expect(total).toEqual(rational(1));
    expect(projection.damageHealth.hitsPerModel).toBe(2);
  });

  it("changes only at the penetration-protection boundary", () => {
    const noPenetration = projectCleanSequence(
      { ...attack, penetration: 0 },
      defense,
    );
    const onePenetration = projectCleanSequence(
      { ...attack, penetration: 1 },
      defense,
    );
    expect(noPenetration.penetrationProtection.effectiveThreshold).toBe(3);
    expect(onePenetration.penetrationProtection.effectiveThreshold).toBe(4);
    expect(
      onePenetration.penetrationProtection.failedProtectionProbability
        .numerator,
    ).toBeGreaterThan(
      noPenetration.penetrationProtection.failedProtectionProbability.numerator,
    );
  });
});
