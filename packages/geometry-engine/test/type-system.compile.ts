import type {
  AttackCount,
  DamagePerCost,
  EpistemicEstimate,
  ExpectedModelsRemoved,
  ModelCount,
  ModelHealth,
  Power,
  Probability,
  Resilience,
} from "@strainspace/rule-schema";

import { analyzePowerResilience } from "../src/power-resilience.js";

function compileTimeContracts(
  power: Power,
  resilience: Resilience,
  health: ModelHealth,
  attackCount: AttackCount,
  modelCount: ModelCount,
  expectation: ExpectedModelsRemoved,
  rate: DamagePerCost,
  probability: Probability,
  estimate: EpistemicEstimate<Power>,
): void {
  analyzePowerResilience(power, resilience);
  void health;
  void attackCount;
  void modelCount;
  void expectation;
  void rate;
  void probability;

  // @ts-expect-error Resilience cannot occupy the Power role.
  analyzePowerResilience(resilience, power);
  // @ts-expect-error Power is not model health.
  const invalidHealth: ModelHealth = power;
  // @ts-expect-error ModelCount is not AttackCount.
  const invalidAttackCount: AttackCount = modelCount;
  // @ts-expect-error An expectation is not a realized model count.
  const invalidModelCount: ModelCount = expectation;
  // @ts-expect-error A damage-per-cost rate is not a probability.
  const invalidProbability: Probability = rate;
  // @ts-expect-error Epistemic estimates cannot enter deterministic operators.
  analyzePowerResilience(estimate, resilience);
  void invalidHealth;
  void invalidAttackCount;
  void invalidModelCount;
  void invalidProbability;
}

void compileTimeContracts;
