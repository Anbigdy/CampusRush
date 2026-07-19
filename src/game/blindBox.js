export const BLIND_BOX_OUTCOMES = Object.freeze([
  Object.freeze({ id: 'hakimi', probability: 0.5 }),
  Object.freeze({ id: 'score', probability: 0.2 }),
  Object.freeze({ id: 'skill', probability: 0.15 }),
  Object.freeze({ id: 'debt', probability: 0.1 }),
  Object.freeze({ id: 'nothing', probability: 0.05 }),
]);

export const HAKIMI_OUTCOME_PROBABILITY =
  BLIND_BOX_OUTCOMES.find((outcome) => outcome.id === 'hakimi')?.probability ?? 0;

export function selectBlindBoxOutcome(randomValue = Math.random()) {
  const roll = Math.min(1 - Number.EPSILON, Math.max(0, randomValue));
  let cumulativeProbability = 0;

  for (const outcome of BLIND_BOX_OUTCOMES) {
    cumulativeProbability += outcome.probability;
    if (roll < cumulativeProbability) {
      return outcome.id;
    }
  }

  return BLIND_BOX_OUTCOMES.at(-1).id;
}
