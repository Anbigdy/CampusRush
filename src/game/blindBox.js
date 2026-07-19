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
    start: { x: 0, y: 0, angle: -1080, scaleX: 0.18, scaleY: 0.18, alpha: 1 },
    enter: { x: 0, y: 0, angle: 1080, scaleX: 1.15, scaleY: 1.15, alpha: 1 },
    exit: { x: 0, y: -80, angle: 2520, scaleX: 2.4, scaleY: 2.4, alpha: 0 },
    enterDuration: 460,
    holdDuration: 440,
    exitDuration: 360,
    enterEase: 'Back.Out',
    exitEase: 'Expo.In',
  }),
  freezeRevealMotion({
    id: 'side-sling',
    start: { x: -920, y: 180, angle: -240, scaleX: 0.35, scaleY: 1.8, alpha: 0.8 },
    enter: { x: 20, y: -8, angle: 35, scaleX: 1.22, scaleY: 0.9, alpha: 1 },
    exit: { x: 980, y: -220, angle: 600, scaleX: 2.1, scaleY: 0.28, alpha: 0 },
    enterDuration: 360,
    holdDuration: 480,
    exitDuration: 330,
    enterEase: 'Back.Out',
    exitEase: 'Expo.In',
  }),
  freezeRevealMotion({
    id: 'meteor-drop',
    start: { x: 360, y: -820, angle: 720, scaleX: 0.28, scaleY: 2.8, alpha: 0.9 },
    enter: { x: -25, y: 18, angle: -35, scaleX: 1.25, scaleY: 0.82, alpha: 1 },
    exit: { x: -420, y: 720, angle: -900, scaleX: 0.3, scaleY: 3.2, alpha: 0 },
    enterDuration: 420,
    holdDuration: 460,
    exitDuration: 350,
    enterEase: 'Bounce.Out',
    exitEase: 'Expo.In',
  }),
  freezeRevealMotion({
    id: 'pendulum',
    start: { x: -560, y: -300, angle: -260, scaleX: 1.6, scaleY: 0.45, alpha: 0.9 },
    enter: { x: 35, y: 0, angle: 28, scaleX: 0.88, scaleY: 1.28, alpha: 1 },
    exit: { x: 620, y: 330, angle: 300, scaleX: 1.9, scaleY: 0.35, alpha: 0 },
    enterDuration: 500,
    holdDuration: 420,
    exitDuration: 420,
    enterEase: 'Elastic.Out',
    exitEase: 'Back.In',
  }),
  freezeRevealMotion({
    id: 'mirror-flip',
    start: { x: -300, y: 0, angle: -180, scaleX: -3.2, scaleY: 0.16, alpha: 0.6 },
    enter: { x: 0, y: 0, angle: 180, scaleX: 1.35, scaleY: 1.35, alpha: 1 },
    exit: { x: 320, y: -120, angle: 900, scaleX: -3.8, scaleY: 0.12, alpha: 0 },
    enterDuration: 400,
    holdDuration: 460,
    exitDuration: 360,
    enterEase: 'Back.Out',
    exitEase: 'Expo.In',
  }),
  freezeRevealMotion({
    id: 'zigzag',
    start: { x: -880, y: -480, angle: -720, scaleX: 2.2, scaleY: 0.28, alpha: 0.75 },
    enter: { x: 35, y: 25, angle: 45, scaleX: 0.82, scaleY: 1.45, alpha: 1 },
    exit: { x: 920, y: -460, angle: 1260, scaleX: 2.6, scaleY: 0.22, alpha: 0 },
    enterDuration: 440,
    holdDuration: 400,
    exitDuration: 340,
    enterEase: 'Back.Out',
    exitEase: 'Back.In',
  }),
  freezeRevealMotion({
    id: 'squash-launch',
    start: { x: 0, y: 360, angle: 0, scaleX: 5.2, scaleY: 0.04, alpha: 0.9 },
    enter: { x: 0, y: -20, angle: 0, scaleX: 0.72, scaleY: 1.75, alpha: 1 },
    exit: { x: 0, y: -580, angle: 0, scaleX: 0.05, scaleY: 5.6, alpha: 0 },
    enterDuration: 380,
    holdDuration: 480,
    exitDuration: 320,
    enterEase: 'Bounce.Out',
    exitEase: 'Expo.In',
  }),
]);

export const HAJIMI_REVEAL_IMPACT = Object.freeze({
  imageSize: 390,
  flashDuration: 180,
  shakeDuration: 320,
  shakeIntensity: 0.025,
  ringScale: 4.8,
  ringDuration: 520,
});

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
