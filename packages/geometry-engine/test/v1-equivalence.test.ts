import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  parseCounterProfileDocument,
  parseCoverageCriterionDocument,
  parseProxyFactionDocument,
} from "@strainspace/rule-schema";

import {
  buildCoverageMatrixV1,
  compareCounterProfileV1,
  detectAbsoluteHolesV1,
  type CoverageResultV1,
} from "../src/coverage-v1.js";

type OracleRow = readonly [
  sourceEntityId: string,
  targetEntityId: string,
  sourceProfileId: string,
  regionId: string,
  requirement: number,
  capabilityNumerator: number,
  capabilityDenominator: number,
  covered: boolean,
  expectedDamageNumerator: number,
  expectedDamageDenominator: number,
  expectedModelsNumerator: number,
  expectedModelsDenominator: number,
];

interface Oracle {
  readonly baseline: readonly OracleRow[];
  readonly replacementUnchangedCellKeys: readonly string[];
  readonly replacementChanged: readonly OracleRow[];
  readonly baselineHole: {
    readonly targetEntityId: string;
    readonly bestAvailableResponse: string;
    readonly capabilityGap: readonly [number, number];
  };
  readonly replacementHoles: readonly unknown[];
}

async function loadJson(path: string): Promise<unknown> {
  return JSON.parse(
    await readFile(resolve(import.meta.dirname, "../../..", path), "utf8"),
  ) as unknown;
}

function result<T>(value: { ok: true; value: T } | { ok: false }): T {
  expect(value.ok).toBe(true);
  if (!value.ok) throw new Error("Expected a supported v1 result.");
  return value.value;
}

function compact(value: CoverageResultV1): OracleRow {
  if (value.pairRelation.requirement.kind !== "ordinary")
    throw new Error("Oracle expects an ordinary power-resilience requirement.");
  return [
    value.sourceEntityId,
    value.targetEntityId,
    value.sourceProfileId,
    value.pairRelation.regionId,
    value.pairRelation.requirement.minimumSuccessfulFace,
    value.capability.numerator,
    value.capability.denominator,
    value.covered,
    value.effectDistribution.expectedAppliedDamage.numerator,
    value.effectDistribution.expectedAppliedDamage.denominator,
    value.effectDistribution.expectedModelsRemoved.numerator,
    value.effectDistribution.expectedModelsRemoved.denominator,
  ];
}

describe("typed-engine migration equivalence", () => {
  it("matches every checkpoint cell and the Phase Lance transition", async () => {
    const ignoreWarning = () => undefined;
    const source = parseProxyFactionDocument(
      await loadJson("fixtures/meridian-compact.json"),
      { sourceName: "meridian-compact.json", onLegacyWarning: ignoreWarning },
    );
    const target = parseProxyFactionDocument(
      await loadJson("fixtures/vesper-array.json"),
      { sourceName: "vesper-array.json", onLegacyWarning: ignoreWarning },
    );
    const criterion = parseCoverageCriterionDocument(
      await loadJson("fixtures/coverage-criterion.json"),
      { sourceName: "coverage-criterion.json", onLegacyWarning: ignoreWarning },
    );
    const counterDocument = parseCounterProfileDocument(
      await loadJson("fixtures/counter-profiles.json"),
      { sourceName: "counter-profiles.json", onLegacyWarning: ignoreWarning },
    );
    const oracle = (await loadJson(
      "packages/geometry-engine/test/fixtures/vertical-slice-equivalence.json",
    )) as Oracle;

    const baseline = result(buildCoverageMatrixV1(source, target, criterion));
    expect(baseline.cells.map((cell) => compact(cell.best))).toEqual(
      oracle.baseline,
    );
    const holes = result(detectAbsoluteHolesV1(baseline, target));
    expect(holes).toHaveLength(1);
    expect(holes[0]?.targetEntityIds[0]).toBe(
      oracle.baselineHole.targetEntityId,
    );
    expect(holes[0]?.bestAvailableResponse).toBe(
      oracle.baselineHole.bestAvailableResponse,
    );
    expect(holes[0]?.capabilityGap).toEqual({
      numerator: oracle.baselineHole.capabilityGap[0],
      denominator: oracle.baselineHole.capabilityGap[1],
    });

    const counter = counterDocument.counterProfiles[0];
    expect(counter).toBeDefined();
    if (counter === undefined) return;
    const comparison = result(
      compareCounterProfileV1(source, target, criterion, counter),
    );
    const baselineByKey = new Map(
      oracle.baseline.map((row) => [`${row[0]}|${row[1]}`, row]),
    );
    const changedByKey = new Map(
      oracle.replacementChanged.map((row) => [`${row[0]}|${row[1]}`, row]),
    );
    expect(comparison.after.cells.map((cell) => compact(cell.best))).toEqual(
      comparison.after.cells.map((cell) => {
        const key = `${cell.sourceEntityId}|${cell.targetEntityId}`;
        expect(
          oracle.replacementUnchangedCellKeys.includes(key) ||
            changedByKey.has(key),
        ).toBe(true);
        return changedByKey.get(key) ?? baselineByKey.get(key);
      }),
    );
    expect(comparison.beforeHoles).toHaveLength(1);
    expect(comparison.afterHoles).toEqual(oracle.replacementHoles);
    expect(comparison.closesHole).toBe(true);
  });
});
