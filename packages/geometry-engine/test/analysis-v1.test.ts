import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  FixedDamageSchema,
  ModelCountSchema,
  ModelHealthSchema,
  RemovedModelCountSchema,
  type AttackProfileV1,
  type CoverageCriterionV1,
  type DefenseProfileV1,
  parseProxyFactionDocument,
} from "@strainspace/rule-schema";

import {
  analyzeAttackProfileV1,
  damagePerCost,
  meetsEfficiencyFloor,
} from "../src/coverage-v1.js";
import {
  allocateFixedDamageV1,
  checkSupportedCleanContext,
  exhaustSingleAttackSequenceV1,
  probabilityAtLeastModelsRemovedV1,
  projectCleanSequenceV1,
} from "../src/projection-v1.js";
import {
  asDamagePerCost,
  asExpectedDamage,
  asProbability,
  makeExactRational,
  scaleExact,
  sumExact,
} from "../src/rational-v1.js";

const faction = parseProxyFactionDocument({
  schemaVersion: "1.0.0",
  factionId: "test-force",
  displayName: "Test Force",
  description: "Synthetic clean-engine test fixture.",
  entities: [
    {
      id: "test-entity",
      displayName: "Test Entity",
      cost: 100,
      mobility: 50,
      control: 0,
      defense: {
        resilience: 6,
        protectionRequirement: 3,
        health: 3,
        modelCount: 3,
      },
      attackProfiles: [
        {
          id: "test-attack",
          displayName: "Test Attack",
          count: 4,
          accuracyRequirement: 3,
          power: 8,
          penetration: 2,
          damage: 2,
          tags: [],
          operators: [],
        },
      ],
      tags: [],
    },
  ],
});

const entity = faction.entities[0];
if (entity === undefined) throw new Error("Expected test entity.");
const attack = entity.attackProfiles[0];
if (attack === undefined) throw new Error("Expected test attack.");

function exact<T>(result: { ok: true; value: T } | { ok: false }): T {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error("Expected supported exact result.");
  return result.value;
}

describe("clean-engine support refinement", () => {
  it("distinguishes a valid AttackCount above six from supported clean input", () => {
    const seven: AttackProfileV1 = {
      ...attack,
      count: 7 as AttackProfileV1["count"],
    };
    expect(seven.count).toBe(7);
    expect(checkSupportedCleanContext(seven, entity.defense)).toMatchObject({
      ok: false,
      error: { kind: "unsupported-computation-range" },
    });
  });

  it("distinguishes unsupported rule context from invalid domain data", () => {
    const reroll: AttackProfileV1 = {
      ...attack,
      operators: [{ operatorId: "test-reroll", kind: "reroll" }],
    };
    expect(checkSupportedCleanContext(reroll, entity.defense)).toMatchObject({
      ok: false,
      error: { kind: "unsupported-rule-context" },
    });
  });

  it("uses checked arithmetic rather than fixture limits for model populations", () => {
    const largeValidDefense: DefenseProfileV1 = {
      ...entity.defense,
      health: ModelHealthSchema.parse(1),
      modelCount: ModelCountSchema.parse(Number.MAX_SAFE_INTEGER),
    };
    expect(checkSupportedCleanContext(attack, largeValidDefense)).toMatchObject(
      {
        ok: true,
      },
    );
    const unsupportedArithmetic: DefenseProfileV1 = {
      ...largeValidDefense,
      health: ModelHealthSchema.parse(2),
    };
    expect(
      checkSupportedCleanContext(attack, unsupportedArithmetic),
    ).toMatchObject({
      ok: false,
      error: { kind: "unsupported-computation-range" },
    });
  });

  it("matches exhaustive enumeration for a supported clean profile", () => {
    const projection = exact(projectCleanSequenceV1(attack, entity.defense));
    const exhaustive = exact(
      exhaustSingleAttackSequenceV1(attack, entity.defense),
    );
    expect(projection.singleAttackEffectProbability).toEqual(
      exact(
        makeExactRational(exhaustive.successfulPaths, exhaustive.totalPaths),
      ),
    );
    expect(exhaustive.totalPaths).toBe(216);
  });
});

describe("typed damage and efficiency", () => {
  it("conserves raw damage into applied and discarded damage", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 6 }),
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 1, max: 10 }),
        (hits, damageValue, health, models) => {
          const defense: DefenseProfileV1 = {
            ...entity.defense,
            health: health as DefenseProfileV1["health"],
            modelCount: models as DefenseProfileV1["modelCount"],
          };
          const allocation = exact(
            allocateFixedDamageV1(
              hits as Parameters<typeof allocateFixedDamageV1>[0],
              FixedDamageSchema.parse(damageValue),
              defense,
            ),
          );
          expect(allocation.appliedDamage + allocation.discardedDamage).toBe(
            allocation.rawDamage,
          );
          expect(allocation.modelsRemoved).toBeLessThanOrEqual(models);
          expect(allocation.appliedDamage).toBeLessThanOrEqual(health * models);
          if (hits < 6) {
            const next = exact(
              allocateFixedDamageV1(
                (hits + 1) as Parameters<typeof allocateFixedDamageV1>[0],
                FixedDamageSchema.parse(damageValue),
                defense,
              ),
            );
            expect(next.appliedDamage).toBeGreaterThanOrEqual(
              allocation.appliedDamage,
            );
            expect(next.modelsRemoved).toBeGreaterThanOrEqual(
              allocation.modelsRemoved,
            );
          }
        },
      ),
    );
  });

  it("normalizes the finite distribution and derives exact expectations", () => {
    const projection = exact(projectCleanSequenceV1(attack, entity.defense));
    expect(
      exact(
        sumExact(
          projection.effectDistribution.outcomes.map(
            (outcome) => outcome.probability,
          ),
        ),
      ),
    ).toEqual({ numerator: 1, denominator: 1 });
    expect(
      asExpectedDamage(
        exact(
          sumExact(
            projection.effectDistribution.outcomes.map((outcome) =>
              exact(scaleExact(outcome.probability, outcome.appliedDamage)),
            ),
          ),
        ),
      ),
    ).toEqual(projection.effectDistribution.expectedAppliedDamage);
  });

  it("treats exact equality as meeting the coverage boundary", () => {
    const projection = exact(projectCleanSequenceV1(attack, entity.defense));
    const capability = exact(
      probabilityAtLeastModelsRemovedV1(
        projection.effectDistribution,
        RemovedModelCountSchema.parse(1),
      ),
    );
    const criterion: CoverageCriterionV1 = {
      schemaVersion: "1.0.0",
      criterionId: "exact-boundary",
      displayName: "Exact boundary",
      metric: "probability-at-least-models-removed",
      minimumModelsRemoved: RemovedModelCountSchema.parse(1),
      threshold: capability,
      assumptions: ["test-exact-boundary"],
    };
    expect(
      exact(analyzeAttackProfileV1(entity, attack, entity, criterion)).covered,
    ).toBe(true);
    expect(
      exact(
        analyzeAttackProfileV1(entity, attack, entity, {
          ...criterion,
          threshold: asProbability(exact(makeExactRational(1))),
        }),
      ).covered,
    ).toBe(false);
  });

  it("compares exact efficiency without decimal rounding", () => {
    const oneThird = asDamagePerCost(exact(makeExactRational(1, 3)));
    const slightlyHigherFloor = asDamagePerCost(
      exact(makeExactRational(1667, 5000)),
    );
    expect(meetsEfficiencyFloor(oneThird, slightlyHigherFloor)).toBe(false);

    const expected = asExpectedDamage(exact(makeExactRational(10, 3)));
    expect(exact(damagePerCost(expected, entity.cost))).toEqual({
      numerator: 1,
      denominator: 30,
    });
  });
});
