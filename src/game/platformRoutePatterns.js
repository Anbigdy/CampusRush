import { GAMEPLAY } from './constants.js';

const flat = (x1, y, x2) => Object.freeze({ x1, y1: y, x2, y2: y });
const slope = (x1, y1, x2, y2) => Object.freeze({ x1, y1, x2, y2 });
const coins = (segment, count, inset = 32, lift = 34) =>
  Object.freeze({ segment, count, inset, lift });

export const PLATFORM_ROUTE_PATTERNS = Object.freeze([
  Object.freeze({
    id: 'ramp-run',
    label: '连廊坡道',
    unlockScore: 120,
    weight: 27,
    width: 780,
    segments: Object.freeze([
      slope(0, GAMEPLAY.groundY, 220, 365),
      flat(220, 365, 500),
      slope(500, 365, 780, GAMEPLAY.groundY),
    ]),
    coinRuns: Object.freeze([coins(0, 3, 48), coins(1, 4, 42), coins(2, 3, 58)]),
  }),
  Object.freeze({
    id: 'step-climb',
    label: '三级跳台',
    unlockScore: 210,
    weight: 24,
    width: 930,
    segments: Object.freeze([
      flat(40, 365, 285),
      flat(355, 305, 590),
      flat(665, 250, 900),
    ]),
    coinRuns: Object.freeze([coins(0, 3, 42), coins(1, 3, 42), coins(2, 4, 40)]),
  }),
  Object.freeze({
    id: 'rolling-hills',
    label: '双峰坡道',
    unlockScore: 170,
    weight: 21,
    width: 1060,
    segments: Object.freeze([
      slope(0, GAMEPLAY.groundY, 180, 380),
      slope(180, 380, 360, GAMEPLAY.groundY),
      slope(430, GAMEPLAY.groundY, 660, 350),
      flat(660, 350, 810),
      slope(810, 350, 1060, GAMEPLAY.groundY),
    ]),
    coinRuns: Object.freeze([coins(0, 3, 42), coins(1, 3, 42), coins(2, 3, 52), coins(3, 3, 28), coins(4, 3, 56)]),
  }),
  Object.freeze({
    id: 'drop-run',
    label: '空中速降',
    unlockScore: 360,
    weight: 14,
    width: 1040,
    segments: Object.freeze([
      flat(55, 270, 315),
      flat(390, 325, 620),
      flat(695, 375, 880),
      slope(880, 375, 1040, GAMEPLAY.groundY),
    ]),
    coinRuns: Object.freeze([coins(0, 4, 42), coins(1, 3, 38), coins(2, 3, 34), coins(3, 3, 38)]),
  }),
  Object.freeze({
    id: 'summit-bundle',
    label: '礼包峰顶',
    unlockScore: 300,
    weight: 14,
    width: 1260,
    bundle: Object.freeze({ segment: 2, x: 635, lift: 58 }),
    segments: Object.freeze([
      slope(0, GAMEPLAY.groundY, 240, 355),
      flat(240, 355, 430),
      flat(515, 275, 755),
      flat(835, 345, 1010),
      slope(1010, 345, 1260, GAMEPLAY.groundY),
    ]),
    coinRuns: Object.freeze([coins(0, 3, 50), coins(1, 3, 28), coins(2, 4, 38), coins(3, 3, 28), coins(4, 3, 50)]),
  }),
]);

export function getSegmentSurfaceY(segment, x) {
  const width = segment.x2 - segment.x1;
  if (width <= 0) {
    return segment.y1;
  }
  const progress = PhaserMathClamp((x - segment.x1) / width, 0, 1);
  return segment.y1 + (segment.y2 - segment.y1) * progress;
}

function PhaserMathClamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function validatePlatformRoutePatterns() {
  const errors = [];
  const ids = new Set();

  PLATFORM_ROUTE_PATTERNS.forEach((pattern) => {
    if (ids.has(pattern.id)) {
      errors.push(`${pattern.id}: duplicate id`);
    }
    ids.add(pattern.id);

    if (!pattern.segments.length || pattern.width <= 0) {
      errors.push(`${pattern.id}: empty route`);
    }

    pattern.segments.forEach((segment, index) => {
      const width = segment.x2 - segment.x1;
      const rise = Math.abs(segment.y2 - segment.y1);
      const angle = Math.atan2(rise, width) * (180 / Math.PI);
      if (width < 140) {
        errors.push(`${pattern.id}[${index}]: segment too short`);
      }
      if (angle > 29) {
        errors.push(`${pattern.id}[${index}]: slope too steep (${angle.toFixed(1)}deg)`);
      }
      if (Math.min(segment.y1, segment.y2) < 240) {
        errors.push(`${pattern.id}[${index}]: platform exceeds safe double-jump height`);
      }
      if (segment.x1 < 0 || segment.x2 > pattern.width) {
        errors.push(`${pattern.id}[${index}]: segment outside route bounds`);
      }
    });
  });

  return errors;
}
