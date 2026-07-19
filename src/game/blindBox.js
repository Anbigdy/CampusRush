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

export const HAJIMI_REVEAL_TIER_WEIGHTS = Object.freeze([
  Object.freeze({ id: 'gentle', probability: 0.3 }),
  Object.freeze({ id: 'lively', probability: 0.3 }),
  Object.freeze({ id: 'explosive', probability: 0.4 }),
]);

export const HAJIMI_REVEAL_MOTIONS = Object.freeze([
  freezeRevealMotion({
    id: 'soft-pop',
    tier: 'gentle',
    start: { x: 0, y: 24, angle: -4, scaleX: 0.82, scaleY: 0.82, alpha: 0 },
    enter: { x: 0, y: 0, angle: 2, scaleX: 1, scaleY: 1, alpha: 1 },
    exit: { x: 0, y: -20, angle: 0, scaleX: 0.94, scaleY: 0.94, alpha: 0 },
    enterDuration: 420,
    holdDuration: 680,
    exitDuration: 380,
    enterEase: 'Sine.Out',
    exitEase: 'Sine.In',
  }),
  freezeRevealMotion({
    id: 'float-in',
    tier: 'gentle',
    start: { x: -80, y: 42, angle: -8, scaleX: 0.9, scaleY: 0.9, alpha: 0 },
    enter: { x: 0, y: 0, angle: 3, scaleX: 1.02, scaleY: 1.02, alpha: 1 },
    exit: { x: 68, y: -34, angle: 9, scaleX: 0.96, scaleY: 0.96, alpha: 0 },
    enterDuration: 500,
    holdDuration: 620,
    exitDuration: 420,
    enterEase: 'Quad.Out',
    exitEase: 'Quad.In',
  }),
  freezeRevealMotion({
    id: 'shy-peek',
    tier: 'gentle',
    start: { x: 110, y: 0, angle: 7, scaleX: 0.78, scaleY: 0.96, alpha: 0 },
    enter: { x: 8, y: 0, angle: -3, scaleX: 1, scaleY: 1, alpha: 1 },
    exit: { x: 125, y: 12, angle: 6, scaleX: 0.82, scaleY: 0.98, alpha: 0 },
    enterDuration: 460,
    holdDuration: 700,
    exitDuration: 360,
    enterEase: 'Back.Out',
    exitEase: 'Sine.In',
  }),
  freezeRevealMotion({
    id: 'bounce-sway',
    tier: 'lively',
    start: { x: -260, y: 130, angle: -55, scaleX: 0.55, scaleY: 1.3, alpha: 0.7 },
    enter: { x: 0, y: 0, angle: 12, scaleX: 1.08, scaleY: 0.94, alpha: 1 },
    exit: { x: 280, y: -90, angle: 95, scaleX: 1.25, scaleY: 0.7, alpha: 0 },
    enterDuration: 430,
    holdDuration: 540,
    exitDuration: 360,
    enterEase: 'Back.Out',
    exitEase: 'Quad.In',
  }),
  freezeRevealMotion({
    id: 'corkscrew',
    tier: 'lively',
    start: { x: 0, y: 190, angle: -300, scaleX: 0.42, scaleY: 0.42, alpha: 0.8 },
    enter: { x: 0, y: 0, angle: 20, scaleX: 1.08, scaleY: 1.08, alpha: 1 },
    exit: { x: 0, y: -190, angle: 390, scaleX: 0.7, scaleY: 0.7, alpha: 0 },
    enterDuration: 470,
    holdDuration: 500,
    exitDuration: 390,
    enterEase: 'Back.Out',
    exitEase: 'Back.In',
  }),
  freezeRevealMotion({
    id: 'rubber-slide',
    tier: 'lively',
    start: { x: -360, y: -50, angle: -35, scaleX: 1.7, scaleY: 0.5, alpha: 0.7 },
    enter: { x: 0, y: 0, angle: 8, scaleX: 0.92, scaleY: 1.12, alpha: 1 },
    exit: { x: 390, y: 70, angle: 120, scaleX: 1.65, scaleY: 0.48, alpha: 0 },
    enterDuration: 410,
    holdDuration: 520,
    exitDuration: 350,
    enterEase: 'Back.Out',
    exitEase: 'Expo.In',
  }),
  freezeRevealMotion({
    id: 'vortex',
    tier: 'explosive',
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
    tier: 'explosive',
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
    tier: 'explosive',
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
    tier: 'explosive',
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
    tier: 'explosive',
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
    tier: 'explosive',
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
    tier: 'explosive',
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

export const HAJIMI_REVEAL_EFFECTS = Object.freeze({
  gentle: Object.freeze({
    imageSize: 326,
    flashDuration: 0,
    shakeDuration: 0,
    shakeIntensity: 0,
    ringCount: 1,
    ringScale: 2.1,
    ringDuration: 560,
    labelStartScale: 1.35,
  }),
  lively: Object.freeze({
    imageSize: 352,
    flashDuration: 100,
    shakeDuration: 180,
    shakeIntensity: 0.009,
    ringCount: 1,
    ringScale: 3.2,
    ringDuration: 500,
    labelStartScale: 1.9,
  }),
  explosive: Object.freeze({
    imageSize: 390,
    flashDuration: 180,
    shakeDuration: 320,
    shakeIntensity: 0.025,
    ringCount: 2,
    ringScale: 4.8,
    ringDuration: 520,
    labelStartScale: 2.8,
  }),
});

export function selectHajimiRevealMotion(randomValue = Math.random()) {
  const roll = Math.min(1 - Number.EPSILON, Math.max(0, randomValue));
  let tierStart = 0;

  for (const tier of HAJIMI_REVEAL_TIER_WEIGHTS) {
    const tierEnd = tierStart + tier.probability;
    if (roll < tierEnd) {
      const tierMotions = HAJIMI_REVEAL_MOTIONS.filter(
        (motion) => motion.tier === tier.id,
      );
      const positionWithinTier = (roll - tierStart) / tier.probability;
      return tierMotions[
        Math.min(
          tierMotions.length - 1,
          Math.floor(positionWithinTier * tierMotions.length),
        )
      ];
    }
    tierStart = tierEnd;
  }

  return HAJIMI_REVEAL_MOTIONS.at(-1);
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
