export const BLIND_BOX_OUTCOMES = Object.freeze([
  Object.freeze({ id: 'hakimi', probability: 2 / 3 }),
  Object.freeze({ id: 'score', probability: 2 / 15 }),
  Object.freeze({ id: 'skill', probability: 1 / 10 }),
  Object.freeze({ id: 'debt', probability: 1 / 15 }),
  Object.freeze({ id: 'nothing', probability: 1 / 30 }),
]);

export const HAKIMI_OUTCOME_PROBABILITY =
  BLIND_BOX_OUTCOMES.find((outcome) => outcome.id === 'hakimi')?.probability ?? 0;

function freezeRevealMotion(motion) {
  return Object.freeze({
    ...motion,
    start: Object.freeze(motion.start),
    enter: Object.freeze(motion.enter),
    exit: Object.freeze(motion.exit),
  });
}

export const HAJIMI_REVEAL_MOTIONS = Object.freeze([
  freezeRevealMotion({
    id: 'vortex',
    start: { x: 0, y: 0, angle: -540, scaleX: 0.82, scaleY: 0.82, alpha: 1 },
    enter: { x: 0, y: 0, angle: 720, scaleX: 1, scaleY: 1, alpha: 1 },
    exit: { x: 0, y: -20, angle: 1440, scaleX: 1.18, scaleY: 1.18, alpha: 0 },
    enterDuration: 520,
    holdDuration: 560,
    exitDuration: 460,
    enterEase: 'Back.Out',
    exitEase: 'Cubic.In',
  }),
  freezeRevealMotion({
    id: 'side-sling',
    start: { x: -520, y: 70, angle: -38, scaleX: 0.7, scaleY: 0.7, alpha: 0.7 },
    enter: { x: 0, y: 0, angle: 8, scaleX: 1, scaleY: 1, alpha: 1 },
    exit: { x: 560, y: -90, angle: 65, scaleX: 0.8, scaleY: 0.8, alpha: 0 },
    enterDuration: 430,
    holdDuration: 620,
    exitDuration: 390,
    enterEase: 'Back.Out',
    exitEase: 'Cubic.In',
  }),
  freezeRevealMotion({
    id: 'meteor-drop',
    start: { x: 130, y: -430, angle: 145, scaleX: 0.75, scaleY: 0.75, alpha: 0.75 },
    enter: { x: 0, y: 0, angle: -10, scaleX: 1, scaleY: 1, alpha: 1 },
    exit: { x: -160, y: 430, angle: -210, scaleX: 0.65, scaleY: 0.65, alpha: 0 },
    enterDuration: 480,
    holdDuration: 580,
    exitDuration: 430,
    enterEase: 'Bounce.Out',
    exitEase: 'Quad.In',
  }),
  freezeRevealMotion({
    id: 'pendulum',
    start: { x: -140, y: -80, angle: -105, scaleX: 0.9, scaleY: 0.9, alpha: 0.85 },
    enter: { x: 0, y: 0, angle: 12, scaleX: 1, scaleY: 1, alpha: 1 },
    exit: { x: 170, y: 100, angle: 100, scaleX: 0.85, scaleY: 0.85, alpha: 0 },
    enterDuration: 620,
    holdDuration: 500,
    exitDuration: 520,
    enterEase: 'Elastic.Out',
    exitEase: 'Sine.In',
  }),
  freezeRevealMotion({
    id: 'mirror-flip',
    start: { x: -120, y: 0, angle: -8, scaleX: -0.15, scaleY: 1.25, alpha: 0.45 },
    enter: { x: 0, y: 0, angle: 0, scaleX: 1, scaleY: 1, alpha: 1 },
    exit: { x: 120, y: -30, angle: 8, scaleX: -1.05, scaleY: 0.85, alpha: 0 },
    enterDuration: 500,
    holdDuration: 560,
    exitDuration: 440,
    enterEase: 'Back.Out',
    exitEase: 'Cubic.In',
  }),
  freezeRevealMotion({
    id: 'zigzag',
    start: { x: -440, y: -170, angle: -25, scaleX: 0.65, scaleY: 0.65, alpha: 0.65 },
    enter: { x: 0, y: 0, angle: 15, scaleX: 1, scaleY: 1, alpha: 1 },
    exit: { x: 470, y: -150, angle: -40, scaleX: 0.7, scaleY: 0.7, alpha: 0 },
    enterDuration: 560,
    holdDuration: 480,
    exitDuration: 410,
    enterEase: 'Cubic.Out',
    exitEase: 'Back.In',
  }),
  freezeRevealMotion({
    id: 'squash-launch',
    start: { x: 0, y: 180, angle: 0, scaleX: 1.7, scaleY: 0.18, alpha: 0.8 },
    enter: { x: 0, y: 0, angle: 0, scaleX: 1, scaleY: 1, alpha: 1 },
    exit: { x: 0, y: -220, angle: 0, scaleX: 0.18, scaleY: 1.8, alpha: 0 },
    enterDuration: 460,
    holdDuration: 600,
    exitDuration: 420,
    enterEase: 'Bounce.Out',
    exitEase: 'Expo.In',
  }),
]);

export function selectHajimiRevealMotion(randomValue = Math.random()) {
  const normalized = Math.min(
    1 - Number.EPSILON,
    Math.max(0, randomValue),
  );
  return HAJIMI_REVEAL_MOTIONS[
    Math.floor(normalized * HAJIMI_REVEAL_MOTIONS.length)
  ];
}

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
