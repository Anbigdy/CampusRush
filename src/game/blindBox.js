export const BLIND_BOX_OUTCOMES = Object.freeze([
  Object.freeze({ id: 'hakimi', probability: 2 / 3 }),
  Object.freeze({ id: 'score', probability: 2 / 15 }),
  Object.freeze({ id: 'skill', probability: 1 / 10 }),
  Object.freeze({ id: 'debt', probability: 1 / 15 }),
  Object.freeze({ id: 'nothing', probability: 1 / 30 }),
]);

export const HAKIMI_OUTCOME_PROBABILITY =
  BLIND_BOX_OUTCOMES.find((outcome) => outcome.id === 'hakimi')?.probability ?? 0;

export const HAJIMI_REVEAL_ANIMATION = Object.freeze({
  imageStartAngle: -540,
  imageEnterAngle: 720,
  imageExitAngle: 1440,
  enterDuration: 520,
  exitDuration: 460,
});

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
