import type {
  Branded,
  D6Requirement,
  DomainResult,
  Probability,
} from "@strainspace/rule-schema";

import { makeProbability } from "./rational-v1.js";

export type D6FaceV1 = 1 | 2 | 3 | 4 | 5 | 6;
export type SuccessfulFaceSet = Branded<
  readonly D6FaceV1[],
  "SuccessfulD6FaceSet"
>;

export const D6_FACES_V1 = [1, 2, 3, 4, 5, 6] as const;

export interface D6OutcomeEvent {
  readonly requirement: D6Requirement;
  readonly faces: typeof D6_FACES_V1;
  readonly successfulFaces: SuccessfulFaceSet;
  readonly probability: Probability;
}

export function successfulD6Faces(
  requirement: D6Requirement,
): SuccessfulFaceSet {
  if (requirement.kind === "impossible")
    return [] as unknown as SuccessfulFaceSet;
  return D6_FACES_V1.filter(
    (face) => face >= requirement.minimumSuccessfulFace,
  ) as unknown as SuccessfulFaceSet;
}

export function uniformD6Probability(
  event: SuccessfulFaceSet,
): DomainResult<Probability> {
  return makeProbability(event.length, D6_FACES_V1.length);
}

export function enumerateD6Requirement(
  requirement: D6Requirement,
): DomainResult<D6OutcomeEvent> {
  const successfulFaces = successfulD6Faces(requirement);
  const probability = uniformD6Probability(successfulFaces);
  if (!probability.ok) return probability;
  return {
    ok: true,
    value: {
      requirement,
      faces: D6_FACES_V1,
      successfulFaces,
      probability: probability.value,
    },
  };
}

export function isD6RequirementSuccess(
  face: D6FaceV1,
  requirement: D6Requirement,
): boolean {
  return (
    requirement.kind === "ordinary" && face >= requirement.minimumSuccessfulFace
  );
}
