import {
  CounterProfileFixtureSchema,
  CoverageCriterionSchema,
  ProxyFactionSchema,
  type CounterProfileFixture,
  type CoverageCriterion,
  type ProxyFaction,
} from "@strainspace/rule-schema";

import counterProfilesJson from "../../../fixtures/counter-profiles.json";
import coverageCriterionJson from "../../../fixtures/coverage-criterion.json";
import meridianJson from "../../../fixtures/meridian-compact.json";
import vesperJson from "../../../fixtures/vesper-array.json";

export interface FixtureDataset {
  readonly factions: readonly ProxyFaction[];
  readonly criterion: CoverageCriterion;
  readonly counterProfiles: readonly CounterProfileFixture[];
}

export async function loadFixtureDataset(): Promise<FixtureDataset> {
  await Promise.resolve();
  return {
    factions: [
      ProxyFactionSchema.parse(meridianJson),
      ProxyFactionSchema.parse(vesperJson),
    ],
    criterion: CoverageCriterionSchema.parse(coverageCriterionJson),
    counterProfiles:
      CounterProfileFixtureSchema.array().parse(counterProfilesJson),
  };
}
