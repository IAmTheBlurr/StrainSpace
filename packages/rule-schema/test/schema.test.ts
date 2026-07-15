import { describe, expect, it } from "vitest";

import {
  AttackProfileSchema,
  D6ThresholdSchema,
  ProxyFactionSchema,
  exportJsonSchemas,
} from "../src/index.js";

describe("rule schemas", () => {
  it("accepts threshold 7 as an impossible ordinary D6 roll", () => {
    expect(D6ThresholdSchema.parse(7)).toBe(7);
  });

  it("rejects attack counts outside the exact MVP bound", () => {
    expect(() =>
      AttackProfileSchema.parse({
        id: "profile-a",
        displayName: "Profile A",
        count: 7,
        accuracyThreshold: 3,
        power: 5,
        penetration: 1,
        damage: 2,
        tags: [],
        operators: [],
      }),
    ).toThrow();
  });

  it("rejects non-generic identifiers", () => {
    expect(() =>
      ProxyFactionSchema.parse({
        factionId: "Faction With Spaces",
        displayName: "Example",
        description: "Example fixture.",
        entities: [],
      }),
    ).toThrow();
  });

  it("exports every runtime boundary to JSON Schema", () => {
    const exported = exportJsonSchemas();
    expect(exported).toHaveProperty(
      "$schema",
      "https://json-schema.org/draft/2020-12/schema",
    );
    expect(exported).toHaveProperty("schemas.proxyFaction");
    expect(exported).toHaveProperty("schemas.holeReport");
    expect(exported).toHaveProperty("schemas.thresholdMap");
  });
});
