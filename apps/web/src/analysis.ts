import {
  buildCoverageMatrixV1,
  detectAbsoluteHolesV1,
  replaceAttackProfileV1,
  type AbsoluteHoleReportV1,
  type CoverageMatrixV1,
} from "@strainspace/geometry-engine";
import type {
  CounterProfileFixtureV1,
  CoverageCriterionV1,
  DomainResult,
  ProxyFactionV1,
} from "@strainspace/rule-schema";

export interface AnalysisSnapshot {
  readonly source: ProxyFactionV1;
  readonly target: ProxyFactionV1;
  readonly matrix: CoverageMatrixV1;
  readonly holes: readonly AbsoluteHoleReportV1[];
}

export function analyzeForces(
  source: ProxyFactionV1,
  target: ProxyFactionV1,
  criterion: CoverageCriterionV1,
  counterProfile?: CounterProfileFixtureV1,
): DomainResult<AnalysisSnapshot> {
  let activeSource = source;
  if (
    counterProfile !== undefined &&
    counterProfile.replaces.factionId === source.factionId
  ) {
    const replacement = replaceAttackProfileV1(source, counterProfile);
    if (!replacement.ok) return replacement;
    activeSource = replacement.value;
  }
  const matrix = buildCoverageMatrixV1(activeSource, target, criterion);
  if (!matrix.ok) return matrix;
  const holes = detectAbsoluteHolesV1(matrix.value, target);
  if (!holes.ok) return holes;
  return {
    ok: true,
    value: {
      source: activeSource,
      target,
      matrix: matrix.value,
      holes: holes.value,
    },
  };
}
