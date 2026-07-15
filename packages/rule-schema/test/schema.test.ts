import { describe, expect, it } from "vitest";

import {
  CounterProfileDocumentV1WireSchema,
  CoverageCriterionDocumentV1WireSchema,
  ProxyFactionDocumentV1WireSchema,
  ThresholdMapDocumentV1WireSchema,
  exportJsonSchemas,
} from "../src/index.js";

describe("public document schemas", () => {
  it.each([
    ["faction", ProxyFactionDocumentV1WireSchema, { factionId: "force" }],
    [
      "counter-profile",
      CounterProfileDocumentV1WireSchema,
      { counterProfiles: [] },
    ],
    [
      "coverage criterion",
      CoverageCriterionDocumentV1WireSchema,
      { criterionId: "criterion" },
    ],
    ["threshold map", ThresholdMapDocumentV1WireSchema, { mapId: "map" }],
  ])("rejects an unversioned %s document", (_name, schema, value) => {
    expect(() => schema.parse(value)).toThrow();
  });

  it("exports only the four actual public wire boundaries", () => {
    const exported = exportJsonSchemas();
    expect(exported).toHaveProperty(
      "$schema",
      "https://json-schema.org/draft/2020-12/schema",
    );
    expect(Object.keys((exported as { schemas: object }).schemas)).toEqual([
      "counterProfileDocument",
      "coverageCriterionDocument",
      "proxyFactionDocument",
      "thresholdMapDocument",
    ]);
  });
});
