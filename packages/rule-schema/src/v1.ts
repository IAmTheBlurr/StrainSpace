import { z } from "zod";

declare const quantityBrand: unique symbol;
declare const exactBrand: unique symbol;

export type Branded<T, Name extends string> = T & {
  readonly [quantityBrand]: Name;
};

export type SafeInteger = Branded<number, "SafeInteger">;
export type PositiveSafeInteger = Branded<number, "PositiveSafeInteger">;
export type AttackCount = Branded<number, "AttackCount">;
export type SupportedCleanAttackCount = Branded<
  AttackCount,
  "SupportedCleanAttackCount"
>;
export type Power = Branded<number, "Power">;
export type Resilience = Branded<number, "Resilience">;
export type PenetrationModifier = Branded<number, "PenetrationModifier">;
export type FixedDamage = Branded<number, "FixedDamage">;
export type ModelHealth = Branded<number, "ModelHealth">;
export type ModelCount = Branded<number, "ModelCount">;
export type MobilityDistance = Branded<number, "MobilityDistance">;
export type ResourceCost = Branded<number, "ResourceCost">;
export type ControlContribution = Branded<number, "ControlContribution">;
export type RemovedModelCount = Branded<number, "RemovedModelCount">;
export type DamagingHitCount = Branded<number, "DamagingHitCount">;

const safeInteger = z.number().int().safe();
const positiveSafeInteger = safeInteger.positive();
const nonNegativeSafeInteger = safeInteger.nonnegative();

export const AttackCountSchema = positiveSafeInteger.transform(
  (value) => value as AttackCount,
);
export const PowerSchema = positiveSafeInteger.transform(
  (value) => value as Power,
);
export const ResilienceSchema = positiveSafeInteger.transform(
  (value) => value as Resilience,
);
export const PenetrationModifierSchema = nonNegativeSafeInteger.transform(
  (value) => value as PenetrationModifier,
);
export const FixedDamageSchema = positiveSafeInteger.transform(
  (value) => value as FixedDamage,
);
export const ModelHealthSchema = positiveSafeInteger.transform(
  (value) => value as ModelHealth,
);
export const ModelCountSchema = positiveSafeInteger.transform(
  (value) => value as ModelCount,
);
export const MobilityDistanceSchema = nonNegativeSafeInteger.transform(
  (value) => value as MobilityDistance,
);
export const ResourceCostSchema = positiveSafeInteger.transform(
  (value) => value as ResourceCost,
);
export const ControlContributionSchema = nonNegativeSafeInteger.transform(
  (value) => value as ControlContribution,
);
export const RemovedModelCountSchema = positiveSafeInteger.transform(
  (value) => value as RemovedModelCount,
);

export type DomainError =
  | {
      readonly kind: "invalid-domain-value";
      readonly quantityKind: string;
      readonly message: string;
    }
  | {
      readonly kind: "invalid-wire-value";
      readonly schemaVersion: string;
      readonly message: string;
    }
  | {
      readonly kind: "unsupported-computation-range";
      readonly operatorId: string;
      readonly message: string;
    }
  | {
      readonly kind: "unsupported-rule-context";
      readonly operatorId: string;
      readonly operatorRefs: readonly string[];
      readonly message: string;
    }
  | {
      readonly kind: "unsupported-relation-operation";
      readonly relationId: string;
      readonly operation: string;
      readonly message: string;
    };

export type DomainResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: DomainError };

export interface EpistemicEstimate<Q> {
  readonly kind: "epistemic-estimate";
  readonly estimate: Q;
  readonly basis: string;
}

export interface ExactWeightedOutcome<O> {
  readonly outcome: O;
  readonly probability: Probability;
}

export interface ExactFiniteDistribution<O> {
  readonly kind: "exact-finite-distribution";
  readonly outcomes: readonly ExactWeightedOutcome<O>[];
}

export const D6OrdinaryRequirementWireSchema = z.union([
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);

export const D6RequirementWireSchema = z.union([
  D6OrdinaryRequirementWireSchema,
  z.literal("impossible"),
]);

export type D6OrdinaryRequirementWire = z.infer<
  typeof D6OrdinaryRequirementWireSchema
>;
export type D6RequirementWire = z.infer<typeof D6RequirementWireSchema>;

export type D6Requirement =
  | {
      readonly kind: "ordinary";
      readonly minimumSuccessfulFace: D6OrdinaryRequirementWire;
    }
  | { readonly kind: "impossible" };

export function decodeD6Requirement(wire: D6RequirementWire): D6Requirement {
  return wire === "impossible"
    ? { kind: "impossible" }
    : { kind: "ordinary", minimumSuccessfulFace: wire };
}

export function encodeD6Requirement(
  requirement: D6Requirement,
): D6RequirementWire {
  return requirement.kind === "impossible"
    ? "impossible"
    : requirement.minimumSuccessfulFace;
}

export const D6RequirementSchema = z
  .discriminatedUnion("kind", [
    z
      .object({
        kind: z.literal("ordinary"),
        minimumSuccessfulFace: D6OrdinaryRequirementWireSchema,
      })
      .strict(),
    z.object({ kind: z.literal("impossible") }).strict(),
  ])
  .readonly();

function gcd(left: number, right: number): number {
  let a = Math.abs(left);
  let b = Math.abs(right);
  while (b !== 0) [a, b] = [b, a % b];
  return a;
}

export const ExactRationalV1WireSchema = z
  .object({
    numerator: safeInteger,
    denominator: positiveSafeInteger,
  })
  .strict()
  .superRefine((value, context) => {
    if (value.numerator === 0 && value.denominator !== 1) {
      context.addIssue({
        code: "custom",
        message: "Canonical zero must be encoded as 0/1.",
      });
      return;
    }
    if (gcd(value.numerator, value.denominator) !== 1) {
      context.addIssue({
        code: "custom",
        message: "Exact rational values must be reduced.",
      });
    }
  });

export type ExactRationalV1Wire = z.infer<typeof ExactRationalV1WireSchema>;
export type ExactRational = Readonly<ExactRationalV1Wire> & {
  readonly [exactBrand]: "ExactRationalV1";
};
export type Probability = ExactRational & {
  readonly [exactBrand]: "ExactRationalV1";
  readonly [quantityBrand]: "Probability";
};
export type ExpectedDamage = ExactRational & {
  readonly [quantityBrand]: "ExpectedDamage";
};
export type ExpectedModelsRemoved = ExactRational & {
  readonly [quantityBrand]: "ExpectedModelsRemoved";
};
export type DamagePerCost = ExactRational & {
  readonly [quantityBrand]: "DamagePerCost";
};

export const ProbabilityWireSchema = ExactRationalV1WireSchema.superRefine(
  (value, context) => {
    if (value.numerator < 0 || value.numerator > value.denominator) {
      context.addIssue({
        code: "custom",
        message: "A probability must lie in the closed interval [0, 1].",
      });
    }
  },
);

export function exactRationalFromWire(
  wire: ExactRationalV1Wire,
): ExactRational {
  return wire as ExactRational;
}

export function probabilityFromWire(
  wire: z.infer<typeof ProbabilityWireSchema>,
): Probability {
  return wire as Probability;
}

const identifier = z
  .string()
  .min(1)
  .max(80)
  .regex(
    /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/,
    "Use a generic kebab-case identifier.",
  );
const displayName = z.string().trim().min(1).max(100);
const assumptions = z.array(z.string().trim().min(1)).min(1);

export const RuleOperatorRefV1WireSchema = z
  .object({
    operatorId: identifier,
    kind: z.enum(["modifier", "reroll", "branch", "repeat", "replacement"]),
  })
  .strict();

export type RuleOperatorRefV1 = z.infer<typeof RuleOperatorRefV1WireSchema>;

export const AttackProfileV1WireSchema = z
  .object({
    id: identifier,
    displayName,
    count: positiveSafeInteger,
    accuracyRequirement: D6RequirementWireSchema,
    power: positiveSafeInteger,
    penetration: nonNegativeSafeInteger,
    damage: positiveSafeInteger,
    tags: z.array(identifier).default([]),
    operators: z.array(RuleOperatorRefV1WireSchema).default([]),
  })
  .strict();

export interface AttackProfileV1 {
  readonly id: string;
  readonly displayName: string;
  readonly count: AttackCount;
  readonly accuracyRequirement: D6Requirement;
  readonly power: Power;
  readonly penetration: PenetrationModifier;
  readonly damage: FixedDamage;
  readonly tags: readonly string[];
  readonly operators: readonly RuleOperatorRefV1[];
}

export function decodeAttackProfileV1(
  wire: z.infer<typeof AttackProfileV1WireSchema>,
): AttackProfileV1 {
  return {
    ...wire,
    count: wire.count as AttackCount,
    accuracyRequirement: decodeD6Requirement(wire.accuracyRequirement),
    power: wire.power as Power,
    penetration: wire.penetration as PenetrationModifier,
    damage: wire.damage as FixedDamage,
  };
}

export const DefenseProfileV1WireSchema = z
  .object({
    resilience: positiveSafeInteger,
    protectionRequirement: D6RequirementWireSchema,
    health: positiveSafeInteger,
    modelCount: positiveSafeInteger,
  })
  .strict();

export interface DefenseProfileV1 {
  readonly resilience: Resilience;
  readonly protectionRequirement: D6Requirement;
  readonly health: ModelHealth;
  readonly modelCount: ModelCount;
}

export function decodeDefenseProfileV1(
  wire: z.infer<typeof DefenseProfileV1WireSchema>,
): DefenseProfileV1 {
  return {
    resilience: wire.resilience as Resilience,
    protectionRequirement: decodeD6Requirement(wire.protectionRequirement),
    health: wire.health as ModelHealth,
    modelCount: wire.modelCount as ModelCount,
  };
}

export const ProxyEntityV1WireSchema = z
  .object({
    id: identifier,
    displayName,
    cost: positiveSafeInteger,
    mobility: nonNegativeSafeInteger,
    control: nonNegativeSafeInteger,
    defense: DefenseProfileV1WireSchema,
    attackProfiles: z.array(AttackProfileV1WireSchema).min(1),
    tags: z.array(identifier).default([]),
  })
  .strict();

export interface ProxyEntityV1 {
  readonly id: string;
  readonly displayName: string;
  readonly cost: ResourceCost;
  readonly mobility: MobilityDistance;
  readonly control: ControlContribution;
  readonly defense: DefenseProfileV1;
  readonly attackProfiles: readonly AttackProfileV1[];
  readonly tags: readonly string[];
}

function decodeProxyEntityV1(
  wire: z.infer<typeof ProxyEntityV1WireSchema>,
): ProxyEntityV1 {
  return {
    ...wire,
    cost: wire.cost as ResourceCost,
    mobility: wire.mobility as MobilityDistance,
    control: wire.control as ControlContribution,
    defense: decodeDefenseProfileV1(wire.defense),
    attackProfiles: wire.attackProfiles.map(decodeAttackProfileV1),
  };
}

export const ProxyFactionDocumentV1WireSchema = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    factionId: identifier,
    displayName,
    description: z.string().trim().min(1).max(300),
    entities: z.array(ProxyEntityV1WireSchema).min(1),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export interface ProxyFactionV1 {
  readonly schemaVersion: "1.0.0";
  readonly factionId: string;
  readonly displayName: string;
  readonly description: string;
  readonly entities: readonly ProxyEntityV1[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}

function decodeProxyFactionV1(
  wire: z.infer<typeof ProxyFactionDocumentV1WireSchema>,
): ProxyFactionV1 {
  const faction: ProxyFactionV1 = {
    schemaVersion: wire.schemaVersion,
    factionId: wire.factionId,
    displayName: wire.displayName,
    description: wire.description,
    entities: wire.entities.map(decodeProxyEntityV1),
  };
  return wire.metadata === undefined
    ? faction
    : { ...faction, metadata: wire.metadata };
}

export const CoverageCriterionDocumentV1WireSchema = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    criterionId: identifier,
    displayName,
    metric: z.literal("probability-at-least-models-removed"),
    minimumModelsRemoved: positiveSafeInteger,
    threshold: ProbabilityWireSchema,
    assumptions,
  })
  .strict();

export interface CoverageCriterionV1 {
  readonly schemaVersion: "1.0.0";
  readonly criterionId: string;
  readonly displayName: string;
  readonly metric: "probability-at-least-models-removed";
  readonly minimumModelsRemoved: RemovedModelCount;
  readonly threshold: Probability;
  readonly assumptions: readonly string[];
}

function decodeCoverageCriterionV1(
  wire: z.infer<typeof CoverageCriterionDocumentV1WireSchema>,
): CoverageCriterionV1 {
  return {
    ...wire,
    minimumModelsRemoved: wire.minimumModelsRemoved as RemovedModelCount,
    threshold: probabilityFromWire(wire.threshold),
  };
}

export const CounterProfileFixtureV1WireSchema = z
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
    profile: AttackProfileV1WireSchema,
  })
  .strict();

export const CounterProfileDocumentV1WireSchema = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    counterProfiles: z.array(CounterProfileFixtureV1WireSchema),
  })
  .strict();

export interface CounterProfileFixtureV1 {
  readonly counterProfileId: string;
  readonly displayName: string;
  readonly replaces: {
    readonly factionId: string;
    readonly entityId: string;
    readonly profileId: string;
  };
  readonly profile: AttackProfileV1;
}

export interface CounterProfileDocumentV1 {
  readonly schemaVersion: "1.0.0";
  readonly counterProfiles: readonly CounterProfileFixtureV1[];
}

function decodeCounterProfileDocumentV1(
  wire: z.infer<typeof CounterProfileDocumentV1WireSchema>,
): CounterProfileDocumentV1 {
  return {
    schemaVersion: wire.schemaVersion,
    counterProfiles: wire.counterProfiles.map((counter) => ({
      ...counter,
      profile: decodeAttackProfileV1(counter.profile),
    })),
  };
}

const RatioBoundaryWireSchema = ExactRationalV1WireSchema.nullable();

export const ThresholdMapDocumentV1WireSchema = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    mapId: identifier,
    displayName,
    relationId: z.literal("power-resilience-v1"),
    sourceSpace: z.string().trim().min(1),
    targetSpace: z.string().trim().min(1),
    operatorVersion: z.string().trim().min(1),
    invariantIds: z.array(identifier).min(1),
    regions: z
      .array(
        z
          .object({
            regionId: identifier,
            label: displayName,
            minimumRatio: RatioBoundaryWireSchema,
            maximumRatio: RatioBoundaryWireSchema,
            minimumInclusive: z.boolean(),
            maximumInclusive: z.boolean(),
            requirement: D6RequirementWireSchema,
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

export type ThresholdMapDocumentV1 = z.infer<
  typeof ThresholdMapDocumentV1WireSchema
>;

export function parseProxyFactionDocument(input: unknown): ProxyFactionV1 {
  return decodeProxyFactionV1(ProxyFactionDocumentV1WireSchema.parse(input));
}

export function parseCoverageCriterionDocument(
  input: unknown,
): CoverageCriterionV1 {
  return decodeCoverageCriterionV1(
    CoverageCriterionDocumentV1WireSchema.parse(input),
  );
}

export function parseCounterProfileDocument(
  input: unknown,
): CounterProfileDocumentV1 {
  return decodeCounterProfileDocumentV1(
    CounterProfileDocumentV1WireSchema.parse(input),
  );
}
