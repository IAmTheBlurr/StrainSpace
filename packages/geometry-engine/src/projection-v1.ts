import type {
  AttackProfileV1,
  Branded,
  D6Requirement,
  DamagingHitCount,
  DefenseProfileV1,
  DomainResult,
  ExactRational,
  ExpectedDamage,
  ExpectedModelsRemoved,
  FixedDamage,
  ModelCount,
  ModelHealth,
  Probability,
  RemovedModelCount,
  SupportedCleanAttackCount,
} from "@strainspace/rule-schema";

import {
  D6_FACES_V1,
  enumerateD6Requirement,
  isD6RequirementSuccess,
  type D6OutcomeEvent,
} from "./dice-v1.js";
import {
  analyzePowerResilience,
  type PowerResilienceRelation,
} from "./power-resilience.js";
import {
  addExact,
  asExpectedDamage,
  asExpectedModelsRemoved,
  asProbability,
  makeExactRational,
  makeProbability,
  multiplyExact,
  powerExact,
  scaleExact,
  subtractExact,
  sumExact,
} from "./rational-v1.js";

export type AppliedDamage = Branded<number, "AppliedDamage">;
export type RawDamage = Branded<number, "RawDamage">;
export type DiscardedDamage = Branded<number, "DiscardedDamage">;

export interface SupportedCleanAttackProfile extends AttackProfileV1 {
  readonly count: SupportedCleanAttackCount;
  readonly operators: readonly [];
}

export interface SupportedCleanContext {
  readonly attack: SupportedCleanAttackProfile;
  readonly defense: DefenseProfileV1;
  readonly arithmeticSupport: "safe-v1";
}

export interface AllocationOutcome {
  readonly damagingHits: DamagingHitCount;
  readonly rawDamage: RawDamage;
  readonly appliedDamage: AppliedDamage;
  readonly discardedDamage: DiscardedDamage;
  readonly modelsRemoved: RemovedModelCount | 0;
  readonly hitsPerModel: number;
}

export interface EffectOutcomeV1 extends AllocationOutcome {
  readonly probability: Probability;
}

export interface EffectDistributionV1 {
  readonly kind: "exact-finite-distribution";
  readonly outcomes: readonly EffectOutcomeV1[];
  readonly expectedAppliedDamage: ExpectedDamage;
  readonly expectedModelsRemoved: ExpectedModelsRemoved;
  readonly assumptions: readonly string[];
}

export interface PenetrationProtectionProjectionV1 {
  readonly baseRequirement: D6Requirement;
  readonly penetration: AttackProfileV1["penetration"];
  readonly effectiveRequirement: D6Requirement;
  readonly protectionEvent: D6OutcomeEvent;
  readonly failedProtectionProbability: Probability;
}

export interface CleanSequenceProjectionV1 {
  readonly accuracy: D6OutcomeEvent;
  readonly powerResilience: {
    readonly relation: PowerResilienceRelation;
    readonly outcomeEvent: D6OutcomeEvent;
  };
  readonly penetrationProtection: PenetrationProtectionProjectionV1;
  readonly damageHealth: {
    readonly damage: FixedDamage;
    readonly health: ModelHealth;
    readonly modelCount: ModelCount;
    readonly hitsPerModel: number;
  };
  readonly singleAttackEffectProbability: Probability;
  readonly effectDistribution: EffectDistributionV1;
}

const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER);

function unsupportedRange(message: string): DomainResult<never> {
  return {
    ok: false,
    error: {
      kind: "unsupported-computation-range",
      operatorId: "clean-sequence-v1",
      message,
    },
  };
}

export function checkSupportedCleanContext(
  attack: AttackProfileV1,
  defense: DefenseProfileV1,
): DomainResult<SupportedCleanContext> {
  if (attack.operators.length > 0) {
    return {
      ok: false,
      error: {
        kind: "unsupported-rule-context",
        operatorId: "clean-sequence-v1",
        operatorRefs: attack.operators.map((operator) => operator.operatorId),
        message:
          "The clean sequence does not implement modifiers, rerolls, branches, repeats, or replacement effects.",
      },
    };
  }
  if (attack.count > 6) {
    return unsupportedRange(
      `AttackCount ${attack.count} is valid but the clean engine supports at most six attacks.`,
    );
  }
  const rawDamage = BigInt(attack.count) * BigInt(attack.damage);
  const targetCapacity = BigInt(defense.modelCount) * BigInt(defense.health);
  if (rawDamage > MAX_SAFE_BIGINT || targetCapacity > MAX_SAFE_BIGINT) {
    return unsupportedRange(
      "Clean allocation requires raw damage and total target capacity to remain safe integers.",
    );
  }
  return {
    ok: true,
    value: {
      attack: attack as SupportedCleanAttackProfile,
      defense,
      arithmeticSupport: "safe-v1",
    },
  };
}

function effectiveProtectionRequirement(
  base: D6Requirement,
  penetration: AttackProfileV1["penetration"],
): D6Requirement {
  if (base.kind === "impossible") return base;
  const shifted = BigInt(base.minimumSuccessfulFace) + BigInt(penetration);
  return shifted >= 7n
    ? { kind: "impossible" }
    : {
        kind: "ordinary",
        minimumSuccessfulFace: Number(shifted) as 2 | 3 | 4 | 5 | 6,
      };
}

function complementProbability(value: Probability): DomainResult<Probability> {
  const one = makeProbability(1);
  if (!one.ok) return one;
  const complement = subtractExact(one.value, value);
  if (!complement.ok) return complement;
  return { ok: true, value: asProbability(complement.value) };
}

function independentProbabilityProduct(
  values: readonly Probability[],
): DomainResult<Probability> {
  let productResult: DomainResult<ExactRational> = makeExactRational(1);
  for (const value of values) {
    if (!productResult.ok) return productResult;
    productResult = multiplyExact(productResult.value, value);
  }
  if (!productResult.ok) return productResult;
  return { ok: true, value: asProbability(productResult.value) };
}

export function projectPenetrationProtectionV1(
  defense: DefenseProfileV1,
  penetration: AttackProfileV1["penetration"],
): DomainResult<PenetrationProtectionProjectionV1> {
  const effectiveRequirement = effectiveProtectionRequirement(
    defense.protectionRequirement,
    penetration,
  );
  const protectionEvent = enumerateD6Requirement(effectiveRequirement);
  if (!protectionEvent.ok) return protectionEvent;
  const failedProtectionProbability = complementProbability(
    protectionEvent.value.probability,
  );
  if (!failedProtectionProbability.ok) return failedProtectionProbability;
  return {
    ok: true,
    value: {
      baseRequirement: defense.protectionRequirement,
      penetration,
      effectiveRequirement,
      protectionEvent: protectionEvent.value,
      failedProtectionProbability: failedProtectionProbability.value,
    },
  };
}

function choose(total: number, selected: number): number {
  if (selected < 0 || selected > total) return 0;
  let result = 1;
  const k = Math.min(selected, total - selected);
  for (let index = 1; index <= k; index += 1)
    result = (result * (total - k + index)) / index;
  return result;
}

function binomialProbability(
  total: number,
  successes: number,
  successProbability: Probability,
): DomainResult<Probability> {
  const failureProbability = complementProbability(successProbability);
  if (!failureProbability.ok) return failureProbability;
  const successesPower = powerExact(successProbability, successes);
  if (!successesPower.ok) return successesPower;
  const failuresPower = powerExact(failureProbability.value, total - successes);
  if (!failuresPower.ok) return failuresPower;
  const combined = multiplyExact(successesPower.value, failuresPower.value);
  if (!combined.ok) return combined;
  const scaled = scaleExact(combined.value, choose(total, successes));
  if (!scaled.ok) return scaled;
  return { ok: true, value: asProbability(scaled.value) };
}

export function allocateFixedDamageV1(
  damagingHits: DamagingHitCount,
  damage: FixedDamage,
  defense: DefenseProfileV1,
): DomainResult<AllocationOutcome> {
  const rawDamageBigInt = BigInt(damagingHits) * BigInt(damage);
  const targetCapacityBigInt =
    BigInt(defense.modelCount) * BigInt(defense.health);
  if (
    rawDamageBigInt > MAX_SAFE_BIGINT ||
    targetCapacityBigInt > MAX_SAFE_BIGINT
  )
    return unsupportedRange(
      "Fixed-damage allocation exceeds the safe integer implementation range.",
    );
  const hitsPerModel = Math.ceil(defense.health / damage);
  const modelsRemoved = Math.min(
    defense.modelCount,
    Math.floor(damagingHits / hitsPerModel),
  );
  let appliedDamage: number;
  if (modelsRemoved === defense.modelCount) {
    appliedDamage = defense.modelCount * defense.health;
  } else {
    const hitsOnCurrentModel = damagingHits - modelsRemoved * hitsPerModel;
    const partialDamage = Math.min(
      defense.health - 1,
      hitsOnCurrentModel * damage,
    );
    appliedDamage = modelsRemoved * defense.health + partialDamage;
  }
  const rawDamage = Number(rawDamageBigInt);
  return {
    ok: true,
    value: {
      damagingHits,
      rawDamage: rawDamage as RawDamage,
      appliedDamage: appliedDamage as AppliedDamage,
      discardedDamage: (rawDamage - appliedDamage) as DiscardedDamage,
      modelsRemoved: modelsRemoved as RemovedModelCount | 0,
      hitsPerModel,
    },
  };
}

export function buildEffectDistributionV1(
  context: SupportedCleanContext,
  singleAttackEffectProbability: Probability,
): DomainResult<EffectDistributionV1> {
  const outcomes: EffectOutcomeV1[] = [];
  for (
    let damagingHits = 0;
    damagingHits <= context.attack.count;
    damagingHits += 1
  ) {
    const allocation = allocateFixedDamageV1(
      damagingHits as DamagingHitCount,
      context.attack.damage,
      context.defense,
    );
    if (!allocation.ok) return allocation;
    const probability = binomialProbability(
      context.attack.count,
      damagingHits,
      singleAttackEffectProbability,
    );
    if (!probability.ok) return probability;
    outcomes.push({ ...allocation.value, probability: probability.value });
  }
  const expectedDamageTerms: ExactRational[] = [];
  const expectedModelTerms: ExactRational[] = [];
  for (const outcome of outcomes) {
    const damageTerm = scaleExact(outcome.probability, outcome.appliedDamage);
    if (!damageTerm.ok) return damageTerm;
    expectedDamageTerms.push(damageTerm.value);
    const modelTerm = scaleExact(outcome.probability, outcome.modelsRemoved);
    if (!modelTerm.ok) return modelTerm;
    expectedModelTerms.push(modelTerm.value);
  }
  const expectedDamage = sumExact(expectedDamageTerms);
  if (!expectedDamage.ok) return expectedDamage;
  const expectedModels = sumExact(expectedModelTerms);
  if (!expectedModels.ok) return expectedModels;
  return {
    ok: true,
    value: {
      kind: "exact-finite-distribution",
      outcomes,
      expectedAppliedDamage: asExpectedDamage(expectedDamage.value),
      expectedModelsRemoved: asExpectedModelsRemoved(expectedModels.value),
      assumptions: [
        "clean-independent-fair-d6-gates",
        "fixed-sequential-damage-no-spill",
        "no-prevention-reduction-or-alternate-channel",
      ],
    },
  };
}

export function projectCleanSequenceV1(
  attack: AttackProfileV1,
  defense: DefenseProfileV1,
): DomainResult<CleanSequenceProjectionV1> {
  const context = checkSupportedCleanContext(attack, defense);
  if (!context.ok) return context;
  const accuracy = enumerateD6Requirement(attack.accuracyRequirement);
  if (!accuracy.ok) return accuracy;
  const relation = analyzePowerResilience(attack.power, defense.resilience);
  if (!relation.ok) return relation;
  const powerResilienceEvent = enumerateD6Requirement(
    relation.value.requirement,
  );
  if (!powerResilienceEvent.ok) return powerResilienceEvent;
  const penetrationProtection = projectPenetrationProtectionV1(
    defense,
    attack.penetration,
  );
  if (!penetrationProtection.ok) return penetrationProtection;
  const singleAttackEffectProbability = independentProbabilityProduct([
    accuracy.value.probability,
    powerResilienceEvent.value.probability,
    penetrationProtection.value.failedProtectionProbability,
  ]);
  if (!singleAttackEffectProbability.ok) return singleAttackEffectProbability;
  const effectDistribution = buildEffectDistributionV1(
    context.value,
    singleAttackEffectProbability.value,
  );
  if (!effectDistribution.ok) return effectDistribution;
  return {
    ok: true,
    value: {
      accuracy: accuracy.value,
      powerResilience: {
        relation: relation.value,
        outcomeEvent: powerResilienceEvent.value,
      },
      penetrationProtection: penetrationProtection.value,
      damageHealth: {
        damage: attack.damage,
        health: defense.health,
        modelCount: defense.modelCount,
        hitsPerModel: Math.ceil(defense.health / attack.damage),
      },
      singleAttackEffectProbability: singleAttackEffectProbability.value,
      effectDistribution: effectDistribution.value,
    },
  };
}

export function exhaustSingleAttackSequenceV1(
  attack: AttackProfileV1,
  defense: DefenseProfileV1,
): DomainResult<{
  readonly successfulPaths: number;
  readonly totalPaths: 216;
}> {
  const context = checkSupportedCleanContext(attack, defense);
  if (!context.ok) return context;
  const relation = analyzePowerResilience(attack.power, defense.resilience);
  if (!relation.ok) return relation;
  const protection = projectPenetrationProtectionV1(
    defense,
    attack.penetration,
  );
  if (!protection.ok) return protection;
  let successfulPaths = 0;
  for (const accuracyFace of D6_FACES_V1) {
    for (const powerFace of D6_FACES_V1) {
      for (const protectionFace of D6_FACES_V1) {
        if (
          isD6RequirementSuccess(accuracyFace, attack.accuracyRequirement) &&
          isD6RequirementSuccess(powerFace, relation.value.requirement) &&
          !isD6RequirementSuccess(
            protectionFace,
            protection.value.effectiveRequirement,
          )
        )
          successfulPaths += 1;
      }
    }
  }
  return { ok: true, value: { successfulPaths, totalPaths: 216 } };
}

export function probabilityAtLeastModelsRemovedV1(
  distribution: EffectDistributionV1,
  minimumModelsRemoved: RemovedModelCount,
): DomainResult<Probability> {
  let totalResult: DomainResult<ExactRational> = makeExactRational(0);
  for (const outcome of distribution.outcomes) {
    if (outcome.modelsRemoved < minimumModelsRemoved) continue;
    if (!totalResult.ok) return totalResult;
    totalResult = addExact(totalResult.value, outcome.probability);
  }
  if (!totalResult.ok) return totalResult;
  return { ok: true, value: asProbability(totalResult.value) };
}
