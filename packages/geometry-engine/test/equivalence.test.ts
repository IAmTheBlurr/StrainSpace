import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CounterProfileFixtureSchema,
  CoverageCriterionSchema,
  ProxyFactionSchema,
  type CoverageResult,
} from "@strainspace/rule-schema";

import {
  buildCoverageMatrix,
  detectAbsoluteHoles,
  replaceAttackProfile,
} from "../src/coverage.js";

type OracleRow = readonly [
  sourceEntityId: string,
  targetEntityId: string,
  sourceProfileId: string,
  regionId: string,
  threshold: number,
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

function compact(result: CoverageResult): OracleRow {
  return [
    result.sourceEntityId,
    result.targetEntityId,
    result.sourceProfileId,
    result.pairRelation.regionId,
    result.pairRelation.threshold,
    result.capability.numerator,
    result.capability.denominator,
    result.covered,
    result.effectDistribution.expectedAppliedDamage.numerator,
    result.effectDistribution.expectedAppliedDamage.denominator,
    result.effectDistribution.expectedModelsRemoved.numerator,
    result.effectDistribution.expectedModelsRemoved.denominator,
  ];
}

describe("checkpoint migration equivalence", () => {
  it("freezes every baseline and Phase Lance matrix cell", async () => {
    const source = ProxyFactionSchema.parse(
      await loadJson("fixtures/meridian-compact.json"),
    );
    const target = ProxyFactionSchema.parse(
      await loadJson("fixtures/vesper-array.json"),
    );
    const criterion = CoverageCriterionSchema.parse(
      await loadJson("fixtures/coverage-criterion.json"),
    );
    const counters = CounterProfileFixtureSchema.array().parse(
      await loadJson("fixtures/counter-profiles.json"),
    );
    const oracle = (await loadJson(
      "packages/geometry-engine/test/fixtures/vertical-slice-equivalence.json",
    )) as Oracle;

    const baseline = buildCoverageMatrix(source, target, criterion);
    expect(baseline.cells.map((cell) => compact(cell.best))).toEqual(
      oracle.baseline,
    );

    const baselineHoles = detectAbsoluteHoles(baseline, target);
    expect(baselineHoles).toHaveLength(1);
    expect(baselineHoles[0]?.targetEntityIds[0]).toBe(
      oracle.baselineHole.targetEntityId,
    );
    expect(baselineHoles[0]?.bestAvailableResponse).toBe(
      oracle.baselineHole.bestAvailableResponse,
    );
    expect(baselineHoles[0]?.missingCapability).toEqual({
      numerator: oracle.baselineHole.capabilityGap[0],
      denominator: oracle.baselineHole.capabilityGap[1],
    });

    const counter = counters[0];
    expect(counter).toBeDefined();
    if (counter === undefined) return;
    const replacementSource = replaceAttackProfile(
      source,
      counter.replaces.entityId,
      counter.replaces.profileId,
      counter.profile,
    );
    const replacement = buildCoverageMatrix(
      replacementSource,
      target,
      criterion,
    );
    const baselineByKey = new Map(
      oracle.baseline.map((row) => [`${row[0]}|${row[1]}`, row]),
    );
    const changedByKey = new Map(
      oracle.replacementChanged.map((row) => [`${row[0]}|${row[1]}`, row]),
    );
    expect(
      replacement.cells.map((cell) => {
        const key = `${cell.sourceEntityId}|${cell.targetEntityId}`;
        expect(
          oracle.replacementUnchangedCellKeys.includes(key) ||
            changedByKey.has(key),
        ).toBe(true);
        return compact(cell.best);
      }),
    ).toEqual(
      replacement.cells.map((cell) => {
        const key = `${cell.sourceEntityId}|${cell.targetEntityId}`;
        return changedByKey.get(key) ?? baselineByKey.get(key);
      }),
    );
    expect(detectAbsoluteHoles(replacement, target)).toEqual(
      oracle.replacementHoles,
    );
  });
});
