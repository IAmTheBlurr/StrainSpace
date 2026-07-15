import {
  CoverageResultSchema,
  HoleReportSchema,
  ProxyFactionSchema,
  type AttackProfile,
  type CoverageCriterion,
  type CoverageResult,
  type HoleReport,
  type PairRepresentation,
  type ProxyEntity,
  type ProxyFaction,
} from "@strainspace/rule-schema";

import {
  effectProbabilityAtLeastModelsRemoved,
  projectCleanSequence,
} from "./projection.js";
import {
  compareRational,
  rational,
  rationalToNumber,
  subtractRational,
} from "./rational.js";

export interface CoverageCell {
  readonly sourceEntityId: string;
  readonly targetEntityId: string;
  readonly candidates: readonly CoverageResult[];
  readonly best: CoverageResult;
}

export interface CoverageMatrix {
  readonly sourceFactionId: string;
  readonly targetFactionId: string;
  readonly criterion: CoverageCriterion;
  readonly cells: readonly CoverageCell[];
}

export function analyzeAttackProfile(
  source: ProxyEntity,
  attack: AttackProfile,
  target: ProxyEntity,
  criterion: CoverageCriterion,
  representation: PairRepresentation = "log-ratio",
): CoverageResult {
  const projection = projectCleanSequence(
    attack,
    target.defense,
    representation,
  );
  const capability = effectProbabilityAtLeastModelsRemoved(
    projection.effectDistribution,
    criterion.minimumModelsRemoved,
  );
  const expectedDamage = rationalToNumber(
    projection.effectDistribution.expectedAppliedDamage,
  );
  return CoverageResultSchema.parse({
    sourceEntityId: source.id,
    sourceProfileId: attack.id,
    targetEntityId: target.id,
    pairRelation: projection.powerResilience.relation,
    effectDistribution: projection.effectDistribution,
    capability,
    criterion,
    covered: compareRational(capability, criterion.threshold) >= 0,
    efficiencyPer100Cost: (expectedDamage * 100) / source.cost,
    assumptions: [
      ...projection.effectDistribution.assumptions,
      "Capability is the probability of removing at least the criterion's model count in one clean activation.",
      "Efficiency is expected applied damage per 100 source cost; mobility, control, range, and opportunity cost are excluded.",
    ],
  });
}

function selectBest(candidates: readonly CoverageResult[]): CoverageResult {
  const first = candidates[0];
  if (first === undefined)
    throw new RangeError("At least one coverage candidate is required.");
  return candidates.slice(1).reduce((best, candidate) => {
    const capabilityOrder = compareRational(
      candidate.capability,
      best.capability,
    );
    if (capabilityOrder > 0) return candidate;
    if (
      capabilityOrder === 0 &&
      candidate.efficiencyPer100Cost > best.efficiencyPer100Cost
    )
      return candidate;
    return best;
  }, first);
}

export function buildCoverageMatrix(
  sourceFaction: ProxyFaction,
  targetFaction: ProxyFaction,
  criterion: CoverageCriterion,
  representation: PairRepresentation = "log-ratio",
): CoverageMatrix {
  const cells = sourceFaction.entities.flatMap((source) =>
    targetFaction.entities.map((target) => {
      const candidates = source.attackProfiles.map((attack) =>
        analyzeAttackProfile(source, attack, target, criterion, representation),
      );
      return {
        sourceEntityId: source.id,
        targetEntityId: target.id,
        candidates,
        best: selectBest(candidates),
      };
    }),
  );
  return {
    sourceFactionId: sourceFaction.factionId,
    targetFactionId: targetFaction.factionId,
    criterion,
    cells,
  };
}

function targetRegionId(target: ProxyEntity): string {
  return `resilience-${target.defense.resilience}-protection-${target.defense.protectionThreshold}-health-${target.defense.health}`;
}

export function detectAbsoluteHoles(
  matrix: CoverageMatrix,
  targetFaction: ProxyFaction,
): HoleReport[] {
  return targetFaction.entities.flatMap((target) => {
    const targetCells = matrix.cells.filter(
      (cell) => cell.targetEntityId === target.id,
    );
    if (targetCells.some((cell) => cell.best.covered)) return [];
    const bestCell = targetCells.reduce<CoverageCell | undefined>(
      (best, cell) => {
        if (best === undefined) return cell;
        return compareRational(cell.best.capability, best.best.capability) > 0
          ? cell
          : best;
      },
      undefined,
    );
    if (bestCell === undefined) return [];
    const regionId = targetRegionId(target);
    return [
      HoleReportSchema.parse({
        holeId: `absolute-${target.id}`,
        targetRegionId: regionId,
        targetEntityIds: [target.id],
        kind: "absolute",
        severity: subtractRational(
          matrix.criterion.threshold,
          bestCell.best.capability,
        ),
        bestAvailableResponse: bestCell.best.sourceProfileId,
        missingCapability: subtractRational(
          matrix.criterion.threshold,
          bestCell.best.capability,
        ),
        counterfactuals: [],
        evidence: [
          bestCell.best.sourceEntityId,
          bestCell.best.sourceProfileId,
          target.id,
        ],
        assumptions: [
          "A target region is an absolute hole when no source entity meets the declared coverage criterion.",
          ...matrix.criterion.assumptions,
        ],
      }),
    ];
  });
}

export function detectEfficiencyHoles(
  matrix: CoverageMatrix,
  targetFaction: ProxyFaction,
  minimumEfficiencyPer100Cost: number,
): HoleReport[] {
  return targetFaction.entities.flatMap((target) => {
    const targetCells = matrix.cells.filter(
      (cell) => cell.targetEntityId === target.id,
    );
    const viable = targetCells.filter((cell) => cell.best.covered);
    if (
      viable.length === 0 ||
      viable.some(
        (cell) => cell.best.efficiencyPer100Cost >= minimumEfficiencyPer100Cost,
      )
    ) {
      return [];
    }
    const best = viable.reduce((current, cell) =>
      cell.best.efficiencyPer100Cost > current.best.efficiencyPer100Cost
        ? cell
        : current,
    );
    const efficiencyRatio = rational(
      Math.round(best.best.efficiencyPer100Cost * 1000),
      Math.round(minimumEfficiencyPer100Cost * 1000),
    );
    const missing = subtractRational(rational(1), efficiencyRatio);
    return [
      HoleReportSchema.parse({
        holeId: `efficiency-${target.id}`,
        targetRegionId: targetRegionId(target),
        targetEntityIds: [target.id],
        kind: "efficiency",
        severity: missing,
        bestAvailableResponse: best.best.sourceProfileId,
        missingCapability: missing,
        counterfactuals: [],
        evidence: [
          best.best.sourceEntityId,
          best.best.sourceProfileId,
          target.id,
        ],
        assumptions: [
          `Viable responses exist, but all fall below ${minimumEfficiencyPer100Cost.toFixed(2)} expected applied damage per 100 cost.`,
          "The efficiency denominator includes source entity cost only.",
        ],
      }),
    ];
  });
}

export function replaceAttackProfile(
  faction: ProxyFaction,
  entityId: string,
  profileId: string,
  replacement: AttackProfile,
): ProxyFaction {
  let replaced = false;
  const entities = faction.entities.map((entity) => {
    if (entity.id !== entityId) return entity;
    const attackProfiles = entity.attackProfiles.map((profile) => {
      if (profile.id !== profileId) return profile;
      replaced = true;
      return replacement;
    });
    return { ...entity, attackProfiles };
  });
  if (!replaced)
    throw new RangeError(
      `Profile ${profileId} on entity ${entityId} was not found.`,
    );
  return ProxyFactionSchema.parse({ ...faction, entities });
}
