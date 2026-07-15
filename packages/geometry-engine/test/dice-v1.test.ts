import { describe, expect, it } from "vitest";

import type { D6Requirement } from "@strainspace/rule-schema";

import {
  D6_FACES_V1,
  enumerateD6Requirement,
  successfulD6Faces,
} from "../src/dice-v1.js";

const requirements: readonly D6Requirement[] = [
  { kind: "ordinary", minimumSuccessfulFace: 2 },
  { kind: "ordinary", minimumSuccessfulFace: 3 },
  { kind: "ordinary", minimumSuccessfulFace: 4 },
  { kind: "ordinary", minimumSuccessfulFace: 5 },
  { kind: "ordinary", minimumSuccessfulFace: 6 },
  { kind: "impossible" },
];

describe("typed D6 requirement events", () => {
  it("exhaustively maps the requirement catalog to upper-closed sets", () => {
    for (const requirement of requirements) {
      const faces = successfulD6Faces(requirement);
      const minimum =
        requirement.kind === "ordinary" ? requirement.minimumSuccessfulFace : 7;
      expect(faces).toEqual(D6_FACES_V1.filter((face) => face >= minimum));
      const event = enumerateD6Requirement(requirement);
      expect(event.ok).toBe(true);
      if (!event.ok) continue;
      const expected = [
        { numerator: 0, denominator: 1 },
        { numerator: 1, denominator: 6 },
        { numerator: 1, denominator: 3 },
        { numerator: 1, denominator: 2 },
        { numerator: 2, denominator: 3 },
        { numerator: 5, denominator: 6 },
      ] as const;
      expect(event.value.probability).toEqual(expected[faces.length]);
    }
  });

  it("orders requirements oppositely to event inclusion", () => {
    for (let index = 1; index < requirements.length; index += 1) {
      const previousRequirement = requirements[index - 1];
      const currentRequirement = requirements[index];
      expect(previousRequirement).toBeDefined();
      expect(currentRequirement).toBeDefined();
      if (previousRequirement === undefined || currentRequirement === undefined)
        continue;
      const previous = successfulD6Faces(previousRequirement);
      const current = successfulD6Faces(currentRequirement);
      expect(current.every((face) => previous.includes(face))).toBe(true);
    }
  });
});
