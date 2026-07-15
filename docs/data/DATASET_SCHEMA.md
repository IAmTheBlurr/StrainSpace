# Dataset Schema

## Design goals

- generic terminology
- exact scalar preservation
- explicit units and domains
- deterministic validation
- provenance separation
- future operator extension

## Faction

```ts
interface ProxyFaction {
  factionId: string;
  displayName: string;
  entities: ProxyEntity[];
  metadata?: Record<string, unknown>;
}
```

## Entity

```ts
interface ProxyEntity {
  id: string;
  displayName: string;
  cost: number;
  mobility: number;
  resilience: number;
  protectionThreshold: D6Threshold;
  health: number;
  control: number;
  attackProfiles: AttackProfile[];
  tags: string[];
}
```

## Attack profile

```ts
interface AttackProfile {
  id: string;
  displayName: string;
  count: number | DiceExpression;
  accuracyThreshold: D6Threshold;
  power: number;
  penetration: number;
  damage: number | DiceExpression;
  tags: string[];
  operators: RuleOperatorRef[];
}
```

## D6 threshold

```ts
type D6Threshold = 2 | 3 | 4 | 5 | 6 | 7;
```

Threshold `7` represents no ordinary successful face before modifiers or overrides.

## Pair relation

```ts
interface PairRelation {
  leftValue: number;
  rightValue: number;
  representation: "difference" | "ratio" | "log-ratio";
  strain: number;
  regionId: string;
  threshold: D6Threshold;
}
```

## Outcome space

```ts
interface DiscreteOutcomeSpace {
  faces: readonly [1, 2, 3, 4, 5, 6];
  successfulFaces: number[];
  probabilityNumerator: number;
  probabilityDenominator: 6;
}
```

## Coverage result

```ts
interface CoverageResult {
  sourceProfileId: string;
  targetEntityId: string;
  effectDistribution: Distribution;
  capability: number;
  threshold: number;
  covered: boolean;
  assumptions: string[];
}
```

## Hole report

```ts
interface HoleReport {
  targetRegionId: string;
  kind: "absolute" | "efficiency";
  severity: number;
  bestAvailableResponse?: string;
  missingCapability: number;
  counterfactuals: CounterfactualResult[];
  evidence: EvidenceRef[];
}
```

## Private provenance

Keep source mapping in an ignored structure:

```ts
interface PrivateSourceRecord {
  proxyId: string;
  sourceName: string;
  sourceDocument: string;
  sourceDate: string;
  enteredBy: string;
  notes?: string;
}
```

No private source record belongs in public commits or demonstration media.
