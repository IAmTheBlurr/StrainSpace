import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  parseCounterProfileDocument,
  parseCoverageCriterionDocument,
  parseProxyFactionDocument,
} from "@strainspace/rule-schema";

import {
  compareCounterProfileV1,
  buildCoverageMatrixV1,
  detectAbsoluteHolesV1,
} from "../src/coverage-v1.js";

async function loadJson(path: string): Promise<unknown> {
  return JSON.parse(
    await readFile(resolve(import.meta.dirname, "../../..", path), "utf8"),
  ) as unknown;
}

describe("coverage and absolute holes", () => {
  it("finds the seeded apex hole and closes it with the known counter-profile", async () => {
    const parsedV1 = {
      sourceName: "versioned fixture",
      onLegacyWarning: () => {},
    };
    const source = parseProxyFactionDocument(
      await loadJson("fixtures/meridian-compact.json"),
      parsedV1,
    );
    const target = parseProxyFactionDocument(
      await loadJson("fixtures/vesper-array.json"),
      parsedV1,
    );
    const criterion = parseCoverageCriterionDocument(
      await loadJson("fixtures/coverage-criterion.json"),
      parsedV1,
    );
    const counterDocument = parseCounterProfileDocument(
      await loadJson("fixtures/counter-profiles.json"),
      parsedV1,
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
  });
});
