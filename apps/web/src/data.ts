import {
  parseCounterProfileDocument,
  parseCoverageCriterionDocument,
  parseProxyFactionDocument,
  ThresholdMapDocumentV1WireSchema,
  type CounterProfileFixtureV1,
  type CoverageCriterionV1,
  type ProxyFactionV1,
  type ThresholdMapDocumentV1,
} from "@strainspace/rule-schema";

import counterProfilesJson from "../../../fixtures/counter-profiles.json";
import coverageCriterionJson from "../../../fixtures/coverage-criterion.json";
import meridianJson from "../../../fixtures/meridian-compact.json";
import thresholdMapJson from "../../../fixtures/power-resilience-threshold-map.json";
import vesperJson from "../../../fixtures/vesper-array.json";

export interface FixtureDataset {
  readonly factions: readonly ProxyFactionV1[];
  readonly criterion: CoverageCriterionV1;
  readonly counterProfiles: readonly CounterProfileFixtureV1[];
  readonly thresholdMap: ThresholdMapDocumentV1;
}

export async function loadFixtureDataset(): Promise<FixtureDataset> {
  await Promise.resolve();
  const parsedV1 = {
    sourceName: "versioned fixture",
    onLegacyWarning: () => {},
  };
  const counterDocument = parseCounterProfileDocument(
    counterProfilesJson,
    parsedV1,
  );
  return {
    factions: [
      parseProxyFactionDocument(meridianJson, parsedV1),
      parseProxyFactionDocument(vesperJson, parsedV1),
    ],
    criterion: parseCoverageCriterionDocument(coverageCriterionJson, parsedV1),
    counterProfiles: counterDocument.counterProfiles,
    thresholdMap: ThresholdMapDocumentV1WireSchema.parse(thresholdMapJson),
  };
}
