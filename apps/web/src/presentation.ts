import {
  damagePer100CostToNumber,
  exactToNumber,
  exactToPercent,
  powerResilienceLogRatioView,
  type CleanSequenceProjectionV1,
  type PowerResilienceRelation,
} from "@strainspace/geometry-engine";
import type {
  AttackProfileV1,
  D6Requirement,
  D6RequirementWire,
  ProxyEntityV1,
  ThresholdMapDocumentV1,
} from "@strainspace/rule-schema";

import type { AnalysisSnapshot } from "./analysis.js";

export type PairCoordinateView =
  "indexed-difference" | "exact-ratio" | "approximate-log-ratio";

export const representationLabels: Record<PairCoordinateView, string> = {
  "indexed-difference": "Indexed difference",
  "exact-ratio": "Exact ratio",
  "approximate-log-ratio": "Approx. log ratio",
};

export interface SceneCell {
  readonly sourceEntityId: string;
  readonly targetEntityId: string;
  readonly sourceLabel: string;
  readonly targetLabel: string;
  readonly row: number;
  readonly column: number;
  readonly capability: number;
  readonly capabilityLabel: string;
  readonly covered: boolean;
  readonly selected: boolean;
}

export interface SceneModel {
  readonly sourceName: string;
  readonly targetName: string;
  readonly rowLabels: readonly string[];
  readonly columnLabels: readonly string[];
  readonly cells: readonly SceneCell[];
  readonly coveragePercent: number;
  readonly coveredCells: number;
  readonly totalCells: number;
  readonly selected: {
    readonly sourceLabel: string;
    readonly targetLabel: string;
    readonly profileLabel: string;
    readonly power: number;
    readonly resilience: number;
    readonly coordinate: string;
    readonly regionLabel: string;
    readonly requirement: string;
    readonly accuracy: string;
    readonly protectionFailure: string;
    readonly effect: string;
    readonly efficiency: string;
    readonly covered: boolean;
  };
  readonly thresholdRegions: readonly {
    readonly id: string;
    readonly label: string;
    readonly requirement: string;
    readonly active: boolean;
  }[];
  readonly dice: readonly {
    readonly face: number;
    readonly success: boolean;
  }[];
  readonly distribution: readonly {
    readonly label: string;
    readonly probability: number;
    readonly probabilityLabel: string;
  }[];
  readonly holes: readonly {
    readonly id: string;
    readonly targetLabel: string;
    readonly gap: string;
  }[];
  readonly counterfactualApplied: boolean;
}

export function buildSceneModel(
  snapshot: AnalysisSnapshot,
  selectedSource: ProxyEntityV1,
  selectedTarget: ProxyEntityV1,
  selectedProfile: AttackProfileV1,
  projection: CleanSequenceProjectionV1,
  thresholdMap: ThresholdMapDocumentV1,
  representation: PairCoordinateView,
  counterfactualApplied: boolean,
): SceneModel {
  const selectedKey = `${selectedSource.id}:${selectedTarget.id}`;
  const rowLabels = snapshot.source.entities.map(
    (entity) => entity.displayName,
  );
  const columnLabels = snapshot.target.entities.map(
    (entity) => entity.displayName,
  );
  const cells = snapshot.matrix.cells.map((cell) => {
    const sourceIndex = snapshot.source.entities.findIndex(
      (entity) => entity.id === cell.sourceEntityId,
    );
    const targetIndex = snapshot.target.entities.findIndex(
      (entity) => entity.id === cell.targetEntityId,
    );
    return {
      sourceEntityId: cell.sourceEntityId,
      targetEntityId: cell.targetEntityId,
      sourceLabel: rowLabels[sourceIndex] ?? cell.sourceEntityId,
      targetLabel: columnLabels[targetIndex] ?? cell.targetEntityId,
      row: sourceIndex,
      column: targetIndex,
      capability: exactToNumber(cell.best.capability),
      capabilityLabel: exactToPercent(cell.best.capability, 0),
      covered: cell.best.covered,
      selected: `${cell.sourceEntityId}:${cell.targetEntityId}` === selectedKey,
    };
  });
  const selectedCell = snapshot.matrix.cells.find(
    (cell) =>
      cell.sourceEntityId === selectedSource.id &&
      cell.targetEntityId === selectedTarget.id,
  );
  const coveredCells = cells.filter((cell) => cell.covered).length;
  const activeRegion = thresholdMap.regions.find(
    (region) =>
      region.regionId === projection.powerResilience.relation.regionId,
  );

  return {
    sourceName: snapshot.source.displayName,
    targetName: snapshot.target.displayName,
    rowLabels,
    columnLabels,
    cells,
    coveragePercent: Math.round((coveredCells / cells.length) * 100),
    coveredCells,
    totalCells: cells.length,
    selected: {
      sourceLabel: selectedSource.displayName,
      targetLabel: selectedTarget.displayName,
      profileLabel: selectedProfile.displayName,
      power: selectedProfile.power,
      resilience: selectedTarget.defense.resilience,
      coordinate: formatRelation(
        projection.powerResilience.relation,
        representation,
      ),
      regionLabel: activeRegion?.label ?? "Unknown region",
      requirement: formatRequirement(
        projection.powerResilience.relation.requirement,
      ),
      accuracy: exactToPercent(projection.accuracy.probability, 1),
      protectionFailure: exactToPercent(
        projection.penetrationProtection.failedProtectionProbability,
        1,
      ),
      effect: exactToPercent(projection.singleAttackEffectProbability, 1),
      efficiency: `${damagePer100CostToNumber(selectedCell?.best.damagePerCost ?? cellsNever()).toFixed(2)} dmg / 100`,
      covered: selectedCell?.best.covered ?? false,
    },
    thresholdRegions: thresholdMap.regions.toReversed().map((region) => ({
      id: region.regionId,
      label: region.label,
      requirement: formatRequirement(region.requirement),
      active: region.regionId === activeRegion?.regionId,
    })),
    dice: projection.powerResilience.outcomeEvent.faces.map((face) => ({
      face,
      success:
        projection.powerResilience.outcomeEvent.successfulFaces.includes(face),
    })),
    distribution: projection.effectDistribution.outcomes.map((outcome) => ({
      label: `${outcome.modelsRemoved} removed`,
      probability: exactToNumber(outcome.probability),
      probabilityLabel: exactToPercent(outcome.probability, 1),
    })),
    holes: snapshot.holes.map((hole) => {
      const entity = snapshot.target.entities.find(
        (candidate) => candidate.id === hole.targetEntityIds[0],
      );
      return {
        id: hole.holeId,
        targetLabel: entity?.displayName ?? hole.targetRegionId,
        gap: exactToPercent(hole.capabilityGap, 1),
      };
    }),
    counterfactualApplied,
  };
}

export function formatRelation(
  relation: PowerResilienceRelation,
  representation: PairCoordinateView,
): string {
  if (representation === "exact-ratio")
    return `${relation.exactRatio.numerator}/${relation.exactRatio.denominator}`;
  if (representation === "indexed-difference")
    return `${relation.indexedDifference >= 0 ? "+" : ""}${relation.indexedDifference}`;
  const approximate = powerResilienceLogRatioView(relation).value;
  return `≈${approximate >= 0 ? "+" : ""}${approximate.toFixed(2)}`;
}

export function formatRequirement(
  requirement: D6Requirement | D6RequirementWire,
): string {
  if (typeof requirement === "object")
    return requirement.kind === "impossible"
      ? "Impossible"
      : `${requirement.minimumSuccessfulFace}+`;
  return requirement === "impossible" ? "Impossible" : `${requirement}+`;
}

function cellsNever(): never {
  throw new Error("The selected coverage cell could not be resolved.");
}
