# Dataset Schema

## Public wire boundaries

StrainSpace version 1 persists only four public document kinds:

- faction fixture documents
- counter-profile fixture documents
- coverage-criterion fixture documents
- power-resilience threshold-map documents

Every document has `"schemaVersion": "1.0.0"`, rejects unknown root fields, and is validated before its values enter the deterministic engine. Unversioned documents, unsupported versions, and the retired numeric D6 sentinel `7` are rejected.

The tracked JSON Schema bundle is generated from these roots at `packages/rule-schema/schema/strainspace.schema.json`. Intermediate relations, distributions, expectations, matrices, holes, and counterfactual results are typed runtime values and are recomputed rather than persisted.

## Domain, fixture, and operator ranges

Schema validation enforces intrinsic mathematical domains. It does not encode temporary fixture or algorithm limits.

For example, `AttackCount` is a positive safe integer. Current fixtures use counts from three through six, while the clean repeated-attack operator supports one through six. A count of seven is valid domain data and parses successfully, but the clean support guard returns `unsupported-computation-range`.

The same separation applies to model count, mobility, resource cost, damage, health, power, resilience, and rational serialization. Current fixture ranges and generated-test sampling ranges are documentation, not mathematical domains.

## Faction document

```ts
interface ProxyFactionDocumentV1Wire {
  schemaVersion: "1.0.0";
  factionId: string;
  displayName: string;
  description: string;
  entities: ProxyEntityV1Wire[];
  metadata?: Record<string, unknown>;
}

interface ProxyEntityV1Wire {
  id: string;
  displayName: string;
  cost: number; // positive safe integer ResourceCost
  mobility: number; // nonnegative safe integer MobilityDistance
  control: number; // nonnegative safe integer ControlContribution
  defense: DefenseProfileV1Wire;
  attackProfiles: AttackProfileV1Wire[];
  tags: string[];
}
```

Field-specific schemas reconstruct distinct runtime brands. A `Power` cannot occupy a `Resilience`, `ModelHealth`, or count parameter merely because each uses a JSON number on the wire.

## Attack and defense profiles

```ts
interface AttackProfileV1Wire {
  id: string;
  displayName: string;
  count: number; // positive safe integer AttackCount
  accuracyRequirement: D6RequirementWire;
  power: number; // positive safe integer Power
  penetration: number; // nonnegative safe integer PenetrationModifier
  damage: number; // positive safe integer FixedDamage
  tags: string[];
  operators: RuleOperatorRefV1Wire[];
}

interface DefenseProfileV1Wire {
  resilience: number; // positive safe integer Resilience
  protectionRequirement: D6RequirementWire;
  health: number; // positive safe integer ModelHealth
  modelCount: number; // positive safe integer ModelCount
}
```

Nonempty operator references are valid rule data but are explicitly unsupported by the current clean engine.

## D6 requirements

```ts
type D6RequirementWire = 2 | 3 | 4 | 5 | 6 | "impossible";

type D6Requirement =
  | { kind: "ordinary"; minimumSuccessfulFace: 2 | 3 | 4 | 5 | 6 }
  | { kind: "impossible" };
```

The compact wire value is decoded immediately into the tagged runtime union. Requirements are ordinal rule boundaries, not ordinary numeric magnitudes.

## Exact rational records

```ts
interface ExactRationalV1Wire {
  numerator: number;
  denominator: number;
}
```

Version 1 requires safe-integer, coprime terms, a positive denominator, and canonical `0/1`. Probability records additionally require `0 <= numerator <= denominator`. BigInt intermediates are used by runtime arithmetic; a reduced result outside the v1 safe-integer representation range returns an explicit unsupported-computation result rather than falling back to floating point.

## Counter-profile document

```ts
interface CounterProfileDocumentV1Wire {
  schemaVersion: "1.0.0";
  counterProfiles: Array<{
    counterProfileId: string;
    displayName: string;
    replaces: {
      factionId: string;
      entityId: string;
      profileId: string;
    };
    profile: AttackProfileV1Wire;
  }>;
}
```

Counterfactual execution is limited to the current immutable single-profile replacement and independent matrix recomputation.

## Coverage-criterion document

```ts
interface CoverageCriterionDocumentV1Wire {
  schemaVersion: "1.0.0";
  criterionId: string;
  displayName: string;
  metric: "probability-at-least-models-removed";
  minimumModelsRemoved: number;
  threshold: ExactRationalV1Wire;
  assumptions: string[];
}
```

## Threshold-map document

The threshold map carries visualization metadata for `power-resilience-v1`: relation and operator IDs, source and target descriptions, invariant IDs, exact rational region boundaries, labels, and D6 requirements. It contains no executable formula and is not a runtime plugin mechanism. Executable threshold arithmetic remains statically implemented in TypeScript.

## Provenance boundary

Current analysis is in memory. Minimal runtime provenance may contain operator ID/version, relation ID, assumption IDs, and source/target identifiers. This milestone creates no input hashing, canonical JSON hashing, persisted cache, generalized analysis envelope, or derivation graph.

Private source mapping remains outside public fixtures and commits.
