import { describe, expect, it } from "vitest";

import {
  AttackCountSchema,
  D6RequirementWireSchema,
  ExactRationalV1WireSchema,
  ProbabilityWireSchema,
  ProxyFactionDocumentV1WireSchema,
  parseProxyFactionDocument,
} from "../src/v1.js";

const v1Faction = {
  schemaVersion: "1.0.0",
  factionId: "test-force",
  displayName: "Test Force",
  description: "Synthetic type-system fixture.",
  entities: [
    {
      id: "test-entity",
      displayName: "Test Entity",
      cost: 999,
      mobility: 100,
      control: 0,
      defense: {
        resilience: 4,
        protectionRequirement: "impossible",
        health: 25,
        modelCount: 100,
      },
      attackProfiles: [
        {
          id: "test-attack",
          displayName: "Test Attack",
          count: 7,
          accuracyRequirement: 3,
          power: 5,
          penetration: 1,
          damage: 20,
          tags: [],
          operators: [],
        },
      ],
      tags: [],
    },
  ],
};

describe("schema v1 mathematical domains", () => {
  it("accepts a valid AttackCount above the clean-engine range", () => {
    expect(AttackCountSchema.parse(7)).toBe(7);
    expect(() => AttackCountSchema.parse(0)).toThrow();
  });

  it("does not turn current fixture ranges into domain limits", () => {
    expect(() =>
      ProxyFactionDocumentV1WireSchema.parse(v1Faction),
    ).not.toThrow();
  });

  it("uses compact D6 wire requirements with explicit impossibility", () => {
    expect(D6RequirementWireSchema.parse("impossible")).toBe("impossible");
    expect(() => D6RequirementWireSchema.parse(7)).toThrow();
  });

  it("requires canonical rationals and bounded probabilities", () => {
    expect(
      ExactRationalV1WireSchema.parse({ numerator: -1, denominator: 2 }),
    ).toEqual({
      numerator: -1,
      denominator: 2,
    });
    expect(() =>
      ExactRationalV1WireSchema.parse({ numerator: 2, denominator: 4 }),
    ).toThrow();
    expect(() =>
      ProbabilityWireSchema.parse({ numerator: 3, denominator: 2 }),
    ).toThrow();
  });

  it("rejects unversioned input after legacy compatibility removal", () => {
    const legacy = {
      factionId: "legacy-force",
      displayName: "Legacy Force",
      description: "Temporary migration fixture.",
      entities: [
        {
          id: "legacy-entity",
          displayName: "Legacy Entity",
          cost: 1,
          mobility: 0,
          control: 0,
          defense: {
            resilience: 1,
            protectionThreshold: 7,
            health: 1,
            modelCount: 1,
          },
          attackProfiles: [
            {
              id: "legacy-attack",
              displayName: "Legacy Attack",
              count: 7,
              accuracyThreshold: 7,
              power: 1,
              penetration: 0,
              damage: 1,
              tags: [],
              operators: [],
            },
          ],
          tags: [],
        },
      ],
    };
    expect(() => parseProxyFactionDocument(legacy)).toThrow();
  });
});
