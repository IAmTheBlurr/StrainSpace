import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CounterProfileFixtureSchema,
  CoverageCriterionSchema,
  ProxyFactionSchema,
} from "@strainspace/rule-schema";

import {
  buildCoverageMatrix,
  detectAbsoluteHoles,
  replaceAttackProfile,
} from "../src/coverage.js";

async function loadJson(path: string): Promise<unknown> {
  return JSON.parse(
    await readFile(resolve(import.meta.dirname, "../../..", path), "utf8"),
  ) as unknown;
}

describe("coverage and absolute holes", () => {
  it("finds the seeded apex hole and closes it with the known counter-profile", async () => {
    const source = ProxyFactionSchema.parse(
      await loadJson("fixtures/meridian-compact.json"),
    );
    const target = ProxyFactionSchema.parse(
      await loadJson("fixtures/vesper-array.json"),
    );
    const criterion = CoverageCriterionSchema.parse(
      await loadJson("fixtures/coverage-criterion.json"),
    );
    const counterProfiles = CounterProfileFixtureSchema.array().parse(
      await loadJson("fixtures/counter-profiles.json"),
    );
    const before = buildCoverageMatrix(source, target, criterion);
    const beforeHoles = detectAbsoluteHoles(before, target);
    expect(beforeHoles.map((hole) => hole.targetEntityIds[0])).toContain(
      "vesper-bastion-prism",
    );

    const counter = counterProfiles[0];
    expect(counter).toBeDefined();
    if (counter === undefined) return;
    const replaced = replaceAttackProfile(
      source,
      counter.replaces.entityId,
      counter.replaces.profileId,
      counter.profile,
    );
    const after = buildCoverageMatrix(replaced, target, criterion);
    const afterHoles = detectAbsoluteHoles(after, target);
    expect(afterHoles.map((hole) => hole.targetEntityIds[0])).not.toContain(
      "vesper-bastion-prism",
    );
  });
});
