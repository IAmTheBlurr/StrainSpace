import { z } from "zod";

const identifier = z
  .string()
  .min(1)
  .max(80)
  .regex(
    /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
    "Use a generic kebab-case identifier.",
  );
const displayName = z.string().trim().min(1).max(100);
const safeInteger = z.number().int().safe();
const nonNegativeInteger = safeInteger.nonnegative();
const positiveInteger = safeInteger.positive();

export const RationalSchema = z
  .object({
    numerator: nonNegativeInteger,
    denominator: positiveInteger,
  })
  .strict();

export const D6FaceSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);

export const D6ThresholdSchema = z.union([
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
]);

export const ScalarValueSchema = z
  .object({
    id: identifier,
    sourceEntityId: identifier,
    name: displayName,
    value: z.number().finite(),
    unit: z.string().trim().min(1).max(40),
    domain: z
      .object({
        minimum: z.number().finite(),
        maximum: z.number().finite(),
        integer: z.boolean(),
      })
      .strict(),
    assumptions: z.array(z.string().trim().min(1)).default([]),
  })
  .strict();

export const RuleOperatorRefSchema = z
  .object({
    operatorId: identifier,
    kind: z.enum(["modifier", "reroll", "branch", "repeat", "replacement"]),
  })
  .strict();

export const AttackProfileSchema = z
  .object({
    id: identifier,
    displayName,
    count: positiveInteger.max(6),
    accuracyThreshold: D6ThresholdSchema,
    power: positiveInteger,
    penetration: nonNegativeInteger,
    damage: positiveInteger,
    tags: z.array(identifier).default([]),
    operators: z.array(RuleOperatorRefSchema).default([]),
  })
  .strict();

export const DefenseProfileSchema = z
  .object({
    resilience: positiveInteger,
    protectionThreshold: D6ThresholdSchema,
    health: positiveInteger,
    modelCount: positiveInteger.max(20),
  })
  .strict();

export const ProxyEntitySchema = z
  .object({
    id: identifier,
    displayName,
    cost: positiveInteger,
    mobility: nonNegativeInteger,
    control: nonNegativeInteger,
    defense: DefenseProfileSchema,
    attackProfiles: z.array(AttackProfileSchema).min(1),
    tags: z.array(identifier).default([]),
  })
  .strict();

export const ProxyFactionSchema = z
  .object({
    factionId: identifier,
    displayName,
    description: z.string().trim().min(1).max(300),
    entities: z.array(ProxyEntitySchema).min(1),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const PairRepresentationSchema = z.enum([
  "difference",
  "ratio",
  "log-ratio",
]);

export const PairRelationSchema = z
  .object({
    leftValue: z.number().finite().positive(),
    rightValue: z.number().finite().positive(),
    representation: PairRepresentationSchema,
    strain: z.number().finite(),
    regionId: identifier,
    threshold: D6ThresholdSchema,
  })
  .strict();

export const ThresholdRegionSchema = z
  .object({
    regionId: identifier,
    label: displayName,
    minimumRatio: z.number().finite().positive().nullable(),
    maximumRatio: z.number().finite().positive().nullable(),
    minimumInclusive: z.boolean(),
    maximumInclusive: z.boolean(),
    threshold: D6ThresholdSchema,
  })
  .strict();

export const ThresholdMapSchema = z
  .object({
    mapId: identifier,
    displayName,
    sourceSpace: z.string().trim().min(1),
    targetSpace: z.string().trim().min(1),
    coordinate: PairRepresentationSchema,
    metricRule: z.string().trim().min(1),
    invariants: z.array(z.string().trim().min(1)).min(1),
    uncertainty: z.string().trim().min(1),
    failureConditions: z.array(z.string().trim().min(1)).min(1),
    regions: z.array(ThresholdRegionSchema).min(1),
  })
  .strict();

export const DiscreteOutcomeSpaceSchema = z
  .object({
    faces: z.tuple([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
      z.literal(6),
    ]),
    successfulFaces: z.array(D6FaceSchema),
    probability: RationalSchema,
  })
  .strict();

export const EffectOutcomeSchema = z
  .object({
    damagingHits: nonNegativeInteger,
    appliedDamage: nonNegativeInteger,
    modelsRemoved: nonNegativeInteger,
    probability: RationalSchema,
  })
  .strict();

export const EffectDistributionSchema = z
  .object({
    outcomes: z.array(EffectOutcomeSchema).min(1),
    expectedAppliedDamage: RationalSchema,
    expectedModelsRemoved: RationalSchema,
    assumptions: z.array(z.string().trim().min(1)).min(1),
  })
  .strict();

export const CoverageCriterionSchema = z
  .object({
    criterionId: identifier,
    displayName,
    metric: z.literal("probability-at-least-models-removed"),
    minimumModelsRemoved: positiveInteger,
    threshold: RationalSchema,
    assumptions: z.array(z.string().trim().min(1)).min(1),
  })
  .strict();

export const CoverageResultSchema = z
  .object({
    sourceEntityId: identifier,
    sourceProfileId: identifier,
    targetEntityId: identifier,
    pairRelation: PairRelationSchema,
    effectDistribution: EffectDistributionSchema,
    capability: RationalSchema,
    criterion: CoverageCriterionSchema,
    covered: z.boolean(),
    efficiencyPer100Cost: z.number().finite().nonnegative(),
    assumptions: z.array(z.string().trim().min(1)).min(1),
  })
  .strict();

export const CounterfactualResultSchema = z
  .object({
    counterfactualId: identifier,
    label: displayName,
    targetRegionId: identifier,
    beforeCapability: RationalSchema,
    afterCapability: RationalSchema,
    closesHole: z.boolean(),
  })
  .strict();

export const HoleReportSchema = z
  .object({
    holeId: identifier,
    targetRegionId: identifier,
    targetEntityIds: z.array(identifier).min(1),
    kind: z.enum(["absolute", "efficiency"]),
    severity: RationalSchema,
    bestAvailableResponse: identifier.optional(),
    missingCapability: RationalSchema,
    counterfactuals: z.array(CounterfactualResultSchema),
    evidence: z.array(identifier).min(1),
    assumptions: z.array(z.string().trim().min(1)).min(1),
  })
  .strict();

export const CounterProfileFixtureSchema = z
  .object({
    counterProfileId: identifier,
    displayName,
    replaces: z
      .object({
        factionId: identifier,
        entityId: identifier,
        profileId: identifier,
      })
      .strict(),
    profile: AttackProfileSchema,
  })
  .strict();

export const StrainSpaceDatasetSchema = z
  .object({
    factions: z.array(ProxyFactionSchema).min(2),
    counterProfiles: z.array(CounterProfileFixtureSchema),
    coverageCriteria: z.array(CoverageCriterionSchema).min(1),
    thresholdMaps: z.array(ThresholdMapSchema).min(1),
  })
  .strict();

export type Rational = z.infer<typeof RationalSchema>;
export type D6Face = z.infer<typeof D6FaceSchema>;
export type D6Threshold = z.infer<typeof D6ThresholdSchema>;
export type ScalarValue = z.infer<typeof ScalarValueSchema>;
export type AttackProfile = z.infer<typeof AttackProfileSchema>;
export type DefenseProfile = z.infer<typeof DefenseProfileSchema>;
export type ProxyEntity = z.infer<typeof ProxyEntitySchema>;
export type ProxyFaction = z.infer<typeof ProxyFactionSchema>;
export type PairRepresentation = z.infer<typeof PairRepresentationSchema>;
export type PairRelation = z.infer<typeof PairRelationSchema>;
export type ThresholdMap = z.infer<typeof ThresholdMapSchema>;
export type DiscreteOutcomeSpace = z.infer<typeof DiscreteOutcomeSpaceSchema>;
export type EffectDistribution = z.infer<typeof EffectDistributionSchema>;
export type CoverageCriterion = z.infer<typeof CoverageCriterionSchema>;
export type CoverageResult = z.infer<typeof CoverageResultSchema>;
export type HoleReport = z.infer<typeof HoleReportSchema>;
export type CounterProfileFixture = z.infer<typeof CounterProfileFixtureSchema>;

export const exportableSchemas = {
  attackProfile: AttackProfileSchema,
  coverageCriterion: CoverageCriterionSchema,
  coverageResult: CoverageResultSchema,
  defenseProfile: DefenseProfileSchema,
  discreteOutcomeSpace: DiscreteOutcomeSpaceSchema,
  effectDistribution: EffectDistributionSchema,
  holeReport: HoleReportSchema,
  pairRelation: PairRelationSchema,
  proxyEntity: ProxyEntitySchema,
  proxyFaction: ProxyFactionSchema,
  scalarValue: ScalarValueSchema,
  strainSpaceDataset: StrainSpaceDatasetSchema,
  thresholdMap: ThresholdMapSchema,
} as const;

export function exportJsonSchemas(): Record<string, unknown> {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "StrainSpace runtime schemas",
    schemas: Object.fromEntries(
      Object.entries(exportableSchemas).map(([name, schema]) => [
        name,
        z.toJSONSchema(schema),
      ]),
    ),
  };
}
