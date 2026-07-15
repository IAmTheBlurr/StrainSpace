import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
  FixedDamageSchema,
  type AttackProfileV1,
  type DefenseProfileV1,
  parseProxyFactionDocument,
} from "@strainspace/rule-schema";

import { damagePerCost, meetsEfficiencyFloor } from "../src/coverage-v1.js";
import {
  allocateFixedDamageV1,
  checkSupportedCleanContext,
  exhaustSingleAttackSequenceV1,
  projectCleanSequenceV1,
} from "../src/projection-v1.js";
import {
  asDamagePerCost,
  asExpectedDamage,
  makeExactRational,
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
        },
      ),
    );
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
