import { z } from "zod";

import {
  CounterProfileDocumentV1WireSchema,
  CoverageCriterionDocumentV1WireSchema,
  ProxyFactionDocumentV1WireSchema,
  ThresholdMapDocumentV1WireSchema,
} from "./v1.js";

export const exportableSchemas = {
  counterProfileDocument: CounterProfileDocumentV1WireSchema,
  coverageCriterionDocument: CoverageCriterionDocumentV1WireSchema,
  proxyFactionDocument: ProxyFactionDocumentV1WireSchema,
  thresholdMapDocument: ThresholdMapDocumentV1WireSchema,
} as const;

export function exportJsonSchemas(): Record<string, unknown> {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "StrainSpace public document schemas v1",
    schemas: Object.fromEntries(
      Object.entries(exportableSchemas).map(([name, schema]) => [
        name,
        z.toJSONSchema(schema),
      ]),
    ),
  };
}

export * from "./v1.js";
