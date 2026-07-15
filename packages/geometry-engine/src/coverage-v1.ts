import type {
  AttackProfileV1,
  CounterProfileFixtureV1,
  CoverageCriterionV1,
  DamagePerCost,
  DomainResult,
  Probability,
  ProxyEntityV1,
  ProxyFactionV1,
} from "@strainspace/rule-schema";

import type { PowerResilienceRelation } from "./power-resilience.js";
import {
  probabilityAtLeastModelsRemovedV1,
  projectCleanSequenceV1,
  type EffectDistributionV1,
} from "./projection-v1.js";
import {
  asDamagePerCost,
  asProbability,
  compareExact,
  exactToNumber,
  makeExactRational,
  nonnegativeDeficit,
} from "./rational-v1.js";

export interface CalculationProvenance {
  readonly operatorId: string;
  readonly operatorVersion: "1.0.0";
  readonly relationId?: "power-resilience-v1";
  readonly assumptionIds: readonly string[];
  readonly sourceEntityId?: string;
  readonly sourceProfileId?: string;
  readonly targetEntityId?: string;
}

export interface CoverageResultV1 {
  readonly sourceEntityId: string;
  readonly sourceProfileId: string;
  readonly targetEntityId: string;
  readonly pairRelation: PowerResilienceRelation;
  readonly effectDistribution: EffectDistributionV1;
  readonly capability: Probability;
  readonly criterion: CoverageCriterionV1;
  readonly covered: boolean;
  readonly damagePerCost: DamagePerCost;
  readonly assumptions: readonly string[];
  readonly provenance: CalculationProvenance;
}

export interface CoverageCellV1 {
  readonly sourceEntityId: string;
  readonly targetEntityId: string;
  readonly candidates: readonly CoverageResultV1[];
  readonly best: CoverageResultV1;
}

export interface CoverageMatrixV1 {
  readonly sourceFactionId: string;
  readonly targetFactionId: string;
  readonly criterion: CoverageCriterionV1;
  readonly cells: readonly CoverageCellV1[];
}

interface HoleReportBaseV1 {
  readonly holeId: string;
  readonly targetRegionId: string;
  readonly targetEntityIds: readonly string[];
  readonly bestAvailableResponse?: string;
  readonly evidence: readonly string[];
  readonly assumptions: readonly string[];
}

export interface AbsoluteHoleReportV1 extends HoleReportBaseV1 {
  readonly kind: "absolute";
  readonly capabilityGap: Probability;
}

export interface EfficiencyHoleReportV1 extends HoleReportBaseV1 {
  readonly kind: "efficiency";
  readonly efficiencyGap: DamagePerCost;
}

export type HoleReportV1 = AbsoluteHoleReportV1 | EfficiencyHoleReportV1;

export interface CounterfactualComparisonV1 {
  readonly counterProfileId: string;
  readonly before: CoverageMatrixV1;
  readonly after: CoverageMatrixV1;
  readonly beforeHoles: readonly AbsoluteHoleReportV1[];
  readonly afterHoles: readonly AbsoluteHoleReportV1[];
  readonly closesHole: boolean;
}

export function damagePerCost(
  expectedDamage: CoverageResultV1["effectDistribution"]["expectedAppliedDamage"],
  cost: ProxyEntityV1["cost"],
): DomainResult<DamagePerCost> {
  const result = makeExactRational(
    BigInt(expectedDamage.numerator),
    BigInt(expectedDamage.denominator) * BigInt(cost),
  );
  if (!result.ok) return result;
  return { ok: true, value: asDamagePerCost(result.value) };
}

export function damagePer100CostToNumber(value: DamagePerCost): number {
  return exactToNumber(value) * 100;
}

export function meetsEfficiencyFloor(
  value: DamagePerCost,
  floor: DamagePerCost,
): boolean {
  return compareExact(value, floor) >= 0;
}

export function analyzeAttackProfileV1(
  source: ProxyEntityV1,
  attack: AttackProfileV1,
  target: ProxyEntityV1,
  criterion: CoverageCriterionV1,
): DomainResult<CoverageResultV1> {
  const projection = projectCleanSequenceV1(attack, target.defense);
  if (!projection.ok) return projection;
  const capability = probabilityAtLeastModelsRemovedV1(
    projection.value.effectDistribution,
    criterion.minimumModelsRemoved,
  );
  if (!capability.ok) return capability;
  const efficiency = damagePerCost(
    projection.value.effectDistribution.expectedAppliedDamage,
    source.cost,
  );
  if (!efficiency.ok) return efficiency;
  return {
    ok: true,
    value: {
      sourceEntityId: source.id,
      sourceProfileId: attack.id,
      targetEntityId: target.id,
      pairRelation: projection.value.powerResilience.relation,
      effectDistribution: projection.value.effectDistribution,
      capability: capability.value,
      criterion,
      covered: compareExact(capability.value, criterion.threshold) >= 0,
      damagePerCost: efficiency.value,
      assumptions: [
        ...projection.value.effectDistribution.assumptions,
        "capability-is-removal-event-probability",
        "efficiency-is-expected-damage-per-source-cost",
      ],
      provenance: {
        operatorId: "coverage-analysis-v1",
        operatorVersion: "1.0.0",
        relationId: "power-resilience-v1",
        assumptionIds: [
          "clean-independent-fair-d6-gates",
          "fixed-sequential-damage-no-spill",
          "efficiency-excludes-nondamage-value",
        ],
        sourceEntityId: source.id,
        sourceProfileId: attack.id,
        targetEntityId: target.id,
      },
    },
  };
}

function selectBest(
  candidates: readonly CoverageResultV1[],
): DomainResult<CoverageResultV1> {
  const first = candidates[0];
  if (first === undefined) {
    return {
      ok: false,
      error: {
        kind: "invalid-domain-value",
        quantityKind: "coverage-candidate-set",
        message: "At least one coverage candidate is required.",
      },
    };
  }
  return {
    ok: true,
    value: candidates.slice(1).reduce((best, candidate) => {
      const capabilityOrder = compareExact(
        candidate.capability,
        best.capability,
      );
      if (capabilityOrder > 0) return candidate;
      if (
        capabilityOrder === 0 &&
        compareExact(candidate.damagePerCost, best.damagePerCost) > 0
      )
        return candidate;
      return best;
    }, first),
  };
}

export function buildCoverageMatrixV1(
  sourceFaction: ProxyFactionV1,
  targetFaction: ProxyFactionV1,
  criterion: CoverageCriterionV1,
): DomainResult<CoverageMatrixV1> {
  const cells: CoverageCellV1[] = [];
  for (const source of sourceFaction.entities) {
    for (const target of targetFaction.entities) {
      const candidates: CoverageResultV1[] = [];
      for (const attack of source.attackProfiles) {
        const candidate = analyzeAttackProfileV1(
          source,
          attack,
          target,
          criterion,
        );
        if (!candidate.ok) return candidate;
        candidates.push(candidate.value);
      }
      const best = selectBest(candidates);
      if (!best.ok) return best;
      cells.push({
        sourceEntityId: source.id,
        targetEntityId: target.id,
        candidates,
        best: best.value,
      });
    }
  }
  return {
    ok: true,
    value: {
      sourceFactionId: sourceFaction.factionId,
      targetFactionId: targetFaction.factionId,
      criterion,
      cells,
    },
  };
}

function targetRegionId(target: ProxyEntityV1): string {
  const protection =
    target.defense.protectionRequirement.kind === "impossible"
      ? "impossible"
      : target.defense.protectionRequirement.minimumSuccessfulFace;
  return `resilience-${target.defense.resilience}-protection-${protection}-health-${target.defense.health}`;
}

export function detectAbsoluteHolesV1(
  matrix: CoverageMatrixV1,
  targetFaction: ProxyFactionV1,
): DomainResult<readonly AbsoluteHoleReportV1[]> {
  const holes: AbsoluteHoleReportV1[] = [];
  for (const target of targetFaction.entities) {
    const targetCells = matrix.cells.filter(
      (cell) => cell.targetEntityId === target.id,
    );
    if (targetCells.some((cell) => cell.best.covered)) continue;
    const bestCell = targetCells.reduce<CoverageCellV1 | undefined>(
      (best, cell) => {
        if (best === undefined) return cell;
        return compareExact(cell.best.capability, best.best.capability) > 0
          ? cell
          : best;
      },
      undefined,
    );
    if (bestCell === undefined) continue;
    const gap = nonnegativeDeficit(
      matrix.criterion.threshold,
      bestCell.best.capability,
    );
    if (!gap.ok) return gap;
    holes.push({
      holeId: `absolute-${target.id}`,
      targetRegionId: targetRegionId(target),
      targetEntityIds: [target.id],
      kind: "absolute",
      capabilityGap: asProbability(gap.value),
      bestAvailableResponse: bestCell.best.sourceProfileId,
      evidence: [
        bestCell.best.sourceEntityId,
        bestCell.best.sourceProfileId,
        target.id,
      ],
      assumptions: [
        "absolute-hole-requires-no-covered-response",
        ...matrix.criterion.assumptions,
      ],
    });
  }
  return { ok: true, value: holes };
}

export function detectEfficiencyHolesV1(
  matrix: CoverageMatrixV1,
  targetFaction: ProxyFactionV1,
  floor: DamagePerCost,
): DomainResult<readonly EfficiencyHoleReportV1[]> {
  const holes: EfficiencyHoleReportV1[] = [];
  for (const target of targetFaction.entities) {
    const viable = matrix.cells.filter(
      (cell) => cell.targetEntityId === target.id && cell.best.covered,
    );
    if (
      viable.length === 0 ||
      viable.some((cell) =>
        meetsEfficiencyFloor(cell.best.damagePerCost, floor),
      )
    )
      continue;
    const best = viable.reduce((current, cell) =>
      compareExact(cell.best.damagePerCost, current.best.damagePerCost) > 0
        ? cell
        : current,
    );
    const gap = nonnegativeDeficit(floor, best.best.damagePerCost);
    if (!gap.ok) return gap;
    holes.push({
      holeId: `efficiency-${target.id}`,
      targetRegionId: targetRegionId(target),
      targetEntityIds: [target.id],
      kind: "efficiency",
      efficiencyGap: asDamagePerCost(gap.value),
      bestAvailableResponse: best.best.sourceProfileId,
      evidence: [
        best.best.sourceEntityId,
        best.best.sourceProfileId,
        target.id,
      ],
      assumptions: ["efficiency-floor-uses-exact-damage-per-cost"],
    });
  }
  return { ok: true, value: holes };
}

export function replaceAttackProfileV1(
  faction: ProxyFactionV1,
  replacement: CounterProfileFixtureV1,
): DomainResult<ProxyFactionV1> {
  if (replacement.replaces.factionId !== faction.factionId) {
    return {
      ok: false,
      error: {
        kind: "invalid-domain-value",
        quantityKind: "counter-profile-selector",
        message: "The counter profile targets a different faction.",
      },
    };
  }
  let replaced = false;
  const entities = faction.entities.map((entity) => {
    if (entity.id !== replacement.replaces.entityId) return entity;
    return {
      ...entity,
      attackProfiles: entity.attackProfiles.map((profile) => {
        if (profile.id !== replacement.replaces.profileId) return profile;
        replaced = true;
        return replacement.profile;
      }),
    };
  });
  if (!replaced) {
    return {
      ok: false,
      error: {
        kind: "invalid-domain-value",
        quantityKind: "counter-profile-selector",
        message:
          "The selected entity/profile replacement target was not found.",
      },
    };
  }
  return { ok: true, value: { ...faction, entities } };
}

export function compareCounterProfileV1(
  source: ProxyFactionV1,
  target: ProxyFactionV1,
  criterion: CoverageCriterionV1,
  replacement: CounterProfileFixtureV1,
): DomainResult<CounterfactualComparisonV1> {
  const before = buildCoverageMatrixV1(source, target, criterion);
  if (!before.ok) return before;
  const replaced = replaceAttackProfileV1(source, replacement);
  if (!replaced.ok) return replaced;
  const after = buildCoverageMatrixV1(replaced.value, target, criterion);
  if (!after.ok) return after;
  const beforeHoles = detectAbsoluteHolesV1(before.value, target);
  if (!beforeHoles.ok) return beforeHoles;
  const afterHoles = detectAbsoluteHolesV1(after.value, target);
  if (!afterHoles.ok) return afterHoles;
  return {
    ok: true,
    value: {
      counterProfileId: replacement.counterProfileId,
      before: before.value,
      after: after.value,
      beforeHoles: beforeHoles.value,
      afterHoles: afterHoles.value,
      closesHole: beforeHoles.value.length > 0 && afterHoles.value.length === 0,
    },
  };
}
