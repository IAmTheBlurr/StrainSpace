import {
  EffectDistributionSchema,
  type AttackProfile,
  type DefenseProfile,
  type DiscreteOutcomeSpace,
  type EffectDistribution,
  type PairRelation,
  type PairRepresentation,
  type Rational,
} from "@strainspace/rule-schema";

import { D6_FACES, enumerateD6Threshold } from "./dice.js";
import {
  addRational,
  choose,
  complementRational,
  multiplyRational,
  powerRational,
  rational,
  scaleRational,
  sumRationals,
} from "./rational.js";
import { computePowerResilienceRelation } from "./thresholds.js";

export interface PenetrationProtectionProjection {
  readonly baseThreshold: DefenseProfile["protectionThreshold"];
  readonly penetration: number;
  readonly effectiveThreshold: DefenseProfile["protectionThreshold"];
  readonly protectionSpace: DiscreteOutcomeSpace;
  readonly failedProtectionProbability: Rational;
}

export interface CleanSequenceProjection {
  readonly accuracy: DiscreteOutcomeSpace;
  readonly powerResilience: {
    readonly relation: PairRelation;
    readonly outcomeSpace: DiscreteOutcomeSpace;
  };
  readonly penetrationProtection: PenetrationProtectionProjection;
  readonly damageHealth: {
    readonly damage: number;
    readonly health: number;
    readonly modelCount: number;
    readonly hitsPerModel: number;
  };
  readonly singleAttackEffectProbability: Rational;
  readonly effectDistribution: EffectDistribution;
}

function effectiveProtectionThreshold(
  base: DefenseProfile["protectionThreshold"],
  penetration: number,
) {
  return Math.min(
    7,
    Math.max(2, base + penetration),
  ) as DefenseProfile["protectionThreshold"];
}

export function projectPenetrationProtection(
  defense: DefenseProfile,
  penetration: number,
): PenetrationProtectionProjection {
  const effectiveThreshold = effectiveProtectionThreshold(
    defense.protectionThreshold,
    penetration,
  );
  const protectionSpace = enumerateD6Threshold(effectiveThreshold);
  return {
    baseThreshold: defense.protectionThreshold,
    penetration,
    effectiveThreshold,
    protectionSpace,
    failedProtectionProbability: {
      numerator: 6 - protectionSpace.successfulFaces.length,
      denominator: 6,
    },
  };
}

function binomialProbability(
  total: number,
  successes: number,
  successProbability: Rational,
): Rational {
  const failureProbability = complementRational(successProbability);
  return scaleRational(
    multiplyRational(
      powerRational(successProbability, successes),
      powerRational(failureProbability, total - successes),
    ),
    choose(total, successes),
  );
}

function applyFixedDamage(
  damagingHits: number,
  damage: number,
  defense: DefenseProfile,
) {
  const hitsPerModel = Math.ceil(defense.health / damage);
  const modelsRemoved = Math.min(
    defense.modelCount,
    Math.floor(damagingHits / hitsPerModel),
  );
  if (modelsRemoved === defense.modelCount) {
    return {
      appliedDamage: defense.modelCount * defense.health,
      modelsRemoved,
      hitsPerModel,
    };
  }
  const hitsOnCurrentModel = damagingHits - modelsRemoved * hitsPerModel;
  const partialDamage = Math.min(
    defense.health - 1,
    hitsOnCurrentModel * damage,
  );
  return {
    appliedDamage: modelsRemoved * defense.health + partialDamage,
    modelsRemoved,
    hitsPerModel,
  };
}

export function buildEffectDistribution(
  attack: AttackProfile,
  defense: DefenseProfile,
  singleAttackEffectProbability: Rational,
): EffectDistribution {
  const outcomes = Array.from(
    { length: attack.count + 1 },
    (_, damagingHits) => {
      const effect = applyFixedDamage(damagingHits, attack.damage, defense);
      return {
        damagingHits,
        appliedDamage: effect.appliedDamage,
        modelsRemoved: effect.modelsRemoved,
        probability: binomialProbability(
          attack.count,
          damagingHits,
          singleAttackEffectProbability,
        ),
      };
    },
  );
  const expectedAppliedDamage = sumRationals(
    outcomes.map((outcome) =>
      scaleRational(outcome.probability, outcome.appliedDamage),
    ),
  );
  const expectedModelsRemoved = sumRationals(
    outcomes.map((outcome) =>
      scaleRational(outcome.probability, outcome.modelsRemoved),
    ),
  );
  return EffectDistributionSchema.parse({
    outcomes,
    expectedAppliedDamage,
    expectedModelsRemoved,
    assumptions: [
      "Each gate uses an independent fair D6 with no modifiers, rerolls, or replacement effects.",
      "Damage is fixed and successful attacks are allocated sequentially to one model at a time.",
      "Excess damage is discarded; no prevention, reduction, or alternate damage channel applies.",
    ],
  });
}

export function projectCleanSequence(
  attack: AttackProfile,
  defense: DefenseProfile,
  representation: PairRepresentation = "log-ratio",
): CleanSequenceProjection {
  const accuracy = enumerateD6Threshold(attack.accuracyThreshold);
  const relation = computePowerResilienceRelation(
    attack.power,
    defense.resilience,
    representation,
  );
  const powerResilienceSpace = enumerateD6Threshold(relation.threshold);
  const penetrationProtection = projectPenetrationProtection(
    defense,
    attack.penetration,
  );
  const singleAttackEffectProbability = multiplyRational(
    multiplyRational(accuracy.probability, powerResilienceSpace.probability),
    penetrationProtection.failedProtectionProbability,
  );
  const effectDistribution = buildEffectDistribution(
    attack,
    defense,
    singleAttackEffectProbability,
  );
  return {
    accuracy,
    powerResilience: { relation, outcomeSpace: powerResilienceSpace },
    penetrationProtection,
    damageHealth: {
      damage: attack.damage,
      health: defense.health,
      modelCount: defense.modelCount,
      hitsPerModel: Math.ceil(defense.health / attack.damage),
    },
    singleAttackEffectProbability,
    effectDistribution,
  };
}

export function exhaustSingleAttackSequence(
  attack: AttackProfile,
  defense: DefenseProfile,
): { successfulPaths: number; totalPaths: number } {
  const relation = computePowerResilienceRelation(
    attack.power,
    defense.resilience,
  );
  const protection = projectPenetrationProtection(defense, attack.penetration);
  let successfulPaths = 0;
  for (const accuracyFace of D6_FACES) {
    for (const powerFace of D6_FACES) {
      for (const protectionFace of D6_FACES) {
        if (
          accuracyFace >= attack.accuracyThreshold &&
          powerFace >= relation.threshold &&
          protectionFace < protection.effectiveThreshold
        ) {
          successfulPaths += 1;
        }
      }
    }
  }
  return { successfulPaths, totalPaths: 6 ** 3 };
}

export function effectProbabilityAtLeastModelsRemoved(
  distribution: EffectDistribution,
  minimumModelsRemoved: number,
): Rational {
  return distribution.outcomes
    .filter((outcome) => outcome.modelsRemoved >= minimumModelsRemoved)
    .reduce(
      (total, outcome) => addRational(total, outcome.probability),
      rational(0),
    );
}
