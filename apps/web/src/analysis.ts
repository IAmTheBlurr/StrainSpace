import {
  buildCoverageMatrix,
  detectAbsoluteHoles,
  replaceAttackProfile,
  type CoverageMatrix,
} from "@strainspace/geometry-engine";
import type {
  CounterProfileFixture,
  CoverageCriterion,
  HoleReport,
  PairRepresentation,
  ProxyFaction,
} from "@strainspace/rule-schema";

export interface AnalysisSnapshot {
  readonly source: ProxyFaction;
  readonly target: ProxyFaction;
  readonly matrix: CoverageMatrix;
  readonly holes: readonly HoleReport[];
}

export function analyzeForces(
  source: ProxyFaction,
  target: ProxyFaction,
  criterion: CoverageCriterion,
  representation: PairRepresentation,
  counterProfile?: CounterProfileFixture,
): AnalysisSnapshot {
  const activeSource =
    counterProfile === undefined ||
    counterProfile.replaces.factionId !== source.factionId
      ? source
      : replaceAttackProfile(
          source,
          counterProfile.replaces.entityId,
          counterProfile.replaces.profileId,
          counterProfile.profile,
        );
  const matrix = buildCoverageMatrix(
    activeSource,
    target,
    criterion,
    representation,
  );
  return {
    source: activeSource,
    target,
    matrix,
    holes: detectAbsoluteHoles(matrix, target),
  };
}
