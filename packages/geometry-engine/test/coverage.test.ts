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
  detectEfficiencyHolesV1,
} from "../src/coverage-v1.js";
import { asDamagePerCost, makeExactRational } from "../src/rational-v1.js";

async function loadJson(path: string): Promise<unknown> {
  return JSON.parse(
    await readFile(resolve(import.meta.dirname, "../../..", path), "utf8"),
  ) as unknown;
}

describe("coverage and absolute holes", () => {
  it("finds the seeded apex hole and closes it with the known counter-profile", async () => {
    const source = parseProxyFactionDocument(
      await loadJson("fixtures/meridian-compact.json"),
    );
    const target = parseProxyFactionDocument(
      await loadJson("fixtures/vesper-array.json"),
    );
    const criterion = parseCoverageCriterionDocument(
      await loadJson("fixtures/coverage-criterion.json"),
    );
    const counterDocument = parseCounterProfileDocument(
      await loadJson("fixtures/counter-profiles.json"),
    );
    const before = buildCoverageMatrixV1(source, target, criterion);
    expect(before.ok).toBe(true);
    if (!before.ok) return;
    const beforeHoles = detectAbsoluteHolesV1(before.value, target);
    expect(beforeHoles.ok).toBe(true);
    if (!beforeHoles.ok) return;
    expect(beforeHoles.value.map((hole) => hole.targetEntityIds[0])).toContain(
      "vesper-bastion-prism",
    );

    const counter = counterDocument.counterProfiles[0];
    expect(counter).toBeDefined();
    if (counter === undefined) return;
    const comparison = compareCounterProfileV1(
      source,
      target,
      criterion,
      counter,
    );
    expect(comparison.ok).toBe(true);
    if (!comparison.ok) return;
    expect(comparison.value.afterHoles).toEqual([]);
    expect(comparison.value.closesHole).toBe(true);

    const one = makeExactRational(1);
    expect(one.ok).toBe(true);
    if (!one.ok) return;
    const efficiencyHoles = detectEfficiencyHolesV1(
      before.value,
      target,
      asDamagePerCost(one.value),
    );
    expect(efficiencyHoles.ok).toBe(true);
    if (!efficiencyHoles.ok) return;
    expect(efficiencyHoles.value).toHaveLength(3);
    expect(
      efficiencyHoles.value.some((hole) =>
        hole.targetEntityIds.includes("vesper-bastion-prism"),
      ),
    ).toBe(false);
    expect(
      efficiencyHoles.value.every(
        (hole) =>
          hole.kind === "efficiency" &&
          "efficiencyGap" in hole &&
          !("capabilityGap" in hole),
      ),
    ).toBe(true);
  });
});
