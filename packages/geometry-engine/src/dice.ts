import type {
  D6Face,
  D6Threshold,
  DiscreteOutcomeSpace,
} from "@strainspace/rule-schema";

export const D6_FACES = [1, 2, 3, 4, 5, 6] as const;

export function enumerateD6Threshold(
  threshold: D6Threshold,
): DiscreteOutcomeSpace {
  const successfulFaces: D6Face[] = D6_FACES.filter(
    (face) => face >= threshold,
  );
  return {
    faces: [...D6_FACES],
    successfulFaces,
    probability: { numerator: successfulFaces.length, denominator: 6 },
  };
}

export function isD6Success(face: D6Face, threshold: D6Threshold): boolean {
  return face >= threshold;
}
