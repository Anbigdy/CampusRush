import { GAMEPLAY } from './constants.js';
import { verifyProceduralRoute } from './routeReachability.js';

const MIN_SURFACE_Y = 242;
const MAX_ELEVATED_Y = 395;
const GENERATION_ATTEMPTS = 28;

const RHYTHMS = Object.freeze([
  'progressive',
  'double-peak',
  'endurance',
  'front-peak',
  'rolling',
]);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hashSeed(value) {
  let hash = 2166136261;
  const text = String(value);
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed) {
  let state = hashSeed(seed);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function randomBetween(random, min, max) {
  return min + (max - min) * random();
}

function randomInt(random, min, max) {
  return Math.floor(randomBetween(random, min, max + 1));
}

function flat(x1, y, x2) {
  return { x1: Math.round(x1), y1: Math.round(y), x2: Math.round(x2), y2: Math.round(y) };
}

function slope(x1, y1, x2, y2) {
  return {
    x1: Math.round(x1),
    y1: Math.round(y1),
    x2: Math.round(x2),
    y2: Math.round(y2),
  };
}

function rhythmDifficulty(rhythm, progress, baseDifficulty) {
  let offset = 0;
  let role = 'build';

  if (rhythm === 'progressive') {
    offset = -0.18 + progress * 0.38;
    if (progress > 0.52 && progress < 0.68) {
      offset -= 0.3;
      role = 'recovery';
    }
  } else if (rhythm === 'double-peak') {
    const firstPeak = Math.exp(-((progress - 0.28) ** 2) / 0.012);
    const secondPeak = Math.exp(-((progress - 0.78) ** 2) / 0.018);
    offset = 0.2 * Math.max(firstPeak, secondPeak) - 0.06;
    if (progress > 0.46 && progress < 0.63) {
      offset = -0.34;
      role = 'recovery';
    }
  } else if (rhythm === 'endurance') {
    offset = 0.02 + Math.sin(progress * Math.PI * 3) * 0.05;
    role = 'endurance';
  } else if (rhythm === 'front-peak') {
    offset = progress < 0.38 ? 0.18 : -0.16 + progress * 0.12;
    if (progress > 0.42 && progress < 0.62) {
      role = 'recovery';
    }
  } else {
    offset = Math.sin(progress * Math.PI * 4) * 0.16;
    role = progress > 0.48 && progress < 0.62 ? 'recovery' : 'build';
    if (role === 'recovery') {
      offset -= 0.24;
    }
  }

  if (progress > 0.8) {
    role = 'climax';
    offset += 0.12;
  }

  return {
    difficulty: clamp(baseDifficulty + offset, 0.12, 0.94),
    role,
  };
}

export function calculateRouteDifficulty({
  worldSpeed,
  isIsekaiWorld,
  performanceAdjustment = 0,
}) {
  const speedProgress = clamp(
    (worldSpeed - GAMEPLAY.initialSpeed) /
      (GAMEPLAY.maxSpeed - GAMEPLAY.initialSpeed),
    0,
    1,
  );
  return clamp(
    0.18 + speedProgress * 0.64 + (isIsekaiWorld ? 0.1 : 0) + performanceAdjustment,
    0.15,
    0.96,
  );
}

function addCoinRuns(pattern, random) {
  const targetCoins = pattern.isLong
    ? randomInt(random, 22, 35)
    : randomInt(random, 10, 18);
  const hazardClearance = 82;
  const eligible = pattern.segments.flatMap((segment, index) => {
    const segmentStart = segment.x1 + 30;
    const segmentEnd = segment.x2 - 30;
    if (segmentEnd - segmentStart < 70) {
      return [];
    }

    const hazards = pattern.hazards
      .filter((hazard) => hazard.segment === index)
      .sort((a, b) => a.x - b.x);
    const intervals = [];
    let intervalStart = segmentStart;
    hazards.forEach((hazard) => {
      const safeEnd = Math.min(segmentEnd, hazard.x - hazardClearance);
      if (safeEnd - intervalStart >= 70) {
        intervals.push({ segment: index, startX: intervalStart, endX: safeEnd });
      }
      intervalStart = Math.max(intervalStart, hazard.x + hazardClearance);
    });
    if (segmentEnd - intervalStart >= 70) {
      intervals.push({ segment: index, startX: intervalStart, endX: segmentEnd });
    }
    return intervals;
  });
  const coinRuns = [];
  let remaining = targetCoins;
  for (let index = eligible.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(random, 0, index);
    [eligible[index], eligible[swapIndex]] = [eligible[swapIndex], eligible[index]];
  }

  for (const entry of eligible) {
    if (remaining <= 0) {
      break;
    }
    const width = entry.endX - entry.startX;
    const capacity = Math.max(1, Math.floor(width / 54) + 1);
    const count = Math.min(remaining, capacity, randomInt(random, 2, 4));
    coinRuns.push({
      segment: entry.segment,
      count,
      startX: Math.round(entry.startX),
      endX: Math.round(entry.endX),
      lift: randomInt(random, 32, 42),
    });
    remaining -= count;
  }

  pattern.coinRuns = coinRuns;
}

function addHazard(pattern, segmentIndex, random, difficulty, phaseIndex) {
  const segment = pattern.segments[segmentIndex];
  const width = segment.x2 - segment.x1;
  if (
    segment.y1 !== segment.y2 ||
    width < 270 ||
    difficulty < 0.34 ||
    random() > 0.34 + difficulty * 0.28
  ) {
    return;
  }

  pattern.hazards.push({
    segment: segmentIndex,
    x: Math.round(randomBetween(random, segment.x1 + 115, segment.x2 - 100)),
    variant: randomInt(random, 0, 4),
    phase: phaseIndex,
  });
}

function createRouteCandidate({
  seed,
  score,
  worldSpeed,
  isIsekaiWorld,
  performanceAdjustment,
  forceBundle,
}) {
  const random = createRandom(seed);
  const difficulty = calculateRouteDifficulty({
    worldSpeed,
    isIsekaiWorld,
    performanceAdjustment,
  });
  const longUnlocked = score >= 300;
  const isLong = longUnlocked && random() < 0.3 + difficulty * 0.18;
  const targetDuration = isLong
    ? randomBetween(random, 8, 14)
    : randomBetween(random, 3.6, 6.5);
  const targetWidth = clamp(
    worldSpeed * targetDuration,
    isLong ? 2400 : 900,
    isLong ? 5600 : 2100,
  );
  const rhythm = RHYTHMS[randomInt(random, 0, RHYTHMS.length - 1)];
  const bodyPhaseCount = clamp(
    Math.round((targetWidth - 650) / (isLong ? 470 : 360)),
    isLong ? 5 : 3,
    isLong ? 10 : 5,
  );
  const pattern = {
    id: `procedural-${hashSeed(seed).toString(16)}`,
    label: isLong ? '程序生成高空路线' : '程序生成挑战路线',
    source: 'procedural',
    seed: String(seed),
    unlockScore: 120,
    weight: 1,
    difficulty,
    rhythm,
    isLong,
    segments: [],
    segmentDifficulties: [],
    phases: [],
    hazards: [],
    coinRuns: [],
  };

  let x = 0;
  let y = GAMEPLAY.groundY;
  const entryY = randomInt(
    random,
    Math.round(365 - difficulty * 24),
    388,
  );
  const entryAngle = randomBetween(random, 15, 24);
  const entryLength = clamp(
    (GAMEPLAY.groundY - entryY) /
      Math.tan((entryAngle * Math.PI) / 180),
    190,
    330,
  );
  pattern.segments.push(slope(x, y, x + entryLength, entryY));
  pattern.segmentDifficulties.push(0.12);
  pattern.phases.push({
    role: 'entry',
    difficulty: 0.12,
    startX: 0,
    endX: Math.round(x + entryLength),
  });
  x += entryLength;
  y = entryY;

  const entryFlatWidth = randomBetween(random, 190, 310);
  pattern.segments.push(flat(x, y, x + entryFlatWidth));
  pattern.segmentDifficulties.push(0.18);
  x += entryFlatWidth;

  for (let phaseIndex = 0; phaseIndex < bodyPhaseCount; phaseIndex += 1) {
    const phaseStartX = x;
    const progress = (phaseIndex + 0.5) / bodyPhaseCount;
    const phase = rhythmDifficulty(rhythm, progress, difficulty);
    const roll = random();
    let newSegmentIndex = pattern.segments.length - 1;

    if (phase.role === 'recovery') {
      const width = randomBetween(random, isLong ? 360 : 280, isLong ? 580 : 430);
      pattern.segments.push(flat(x, y, x + width));
      pattern.segmentDifficulties.push(Math.min(0.3, phase.difficulty));
      x += width;
      newSegmentIndex = pattern.segments.length - 1;
    } else if (roll < 0.34) {
      const direction =
        y < 285 ? 1 : y > 380 ? -1 : random() < 0.54 ? -1 : 1;
      const heightChange = randomBetween(
        random,
        34,
        58 + phase.difficulty * 54,
      );
      const targetY = clamp(
        y + direction * heightChange,
        MIN_SURFACE_Y,
        MAX_ELEVATED_Y,
      );
      const angle = randomBetween(random, 13, 19 + phase.difficulty * 8);
      const length = clamp(
        Math.abs(targetY - y) / Math.tan((angle * Math.PI) / 180),
        145,
        330,
      );
      pattern.segments.push(slope(x, y, x + length, targetY));
      pattern.segmentDifficulties.push(phase.difficulty);
      x += length;
      y = targetY;
      const flatWidth = randomBetween(random, 180, isLong ? 390 : 310);
      pattern.segments.push(flat(x, y, x + flatWidth));
      pattern.segmentDifficulties.push(phase.difficulty);
      x += flatWidth;
      newSegmentIndex = pattern.segments.length - 1;
    } else if (roll < 0.76) {
      const previousSegment = pattern.segments.at(-1);
      const previousWidth = previousSegment.x2 - previousSegment.x1;
      if (previousWidth < 190) {
        const extension = 210 - previousWidth;
        previousSegment.x2 += extension;
        x += extension;
      }

      const gap = randomBetween(
        random,
        48 + phase.difficulty * 28,
        92 + phase.difficulty * 115,
      );
      let targetY = y;
      if (random() < 0.66) {
        const direction =
          phase.role === 'climax'
            ? -1
            : y < 280
              ? 1
              : random() < 0.56
                ? -1
                : 1;
        const heightChange = randomBetween(
          random,
          28,
          56 + phase.difficulty * 92,
        );
        targetY = clamp(
          y + direction * heightChange,
          MIN_SURFACE_Y,
          MAX_ELEVATED_Y,
        );
      }
      const platformWidth = randomBetween(
        random,
        190 - phase.difficulty * 34,
        isLong ? 420 : 330,
      );
      x += gap;
      pattern.segments.push(flat(x, targetY, x + platformWidth));
      pattern.segmentDifficulties.push(phase.difficulty);
      x += platformWidth;
      y = targetY;
      newSegmentIndex = pattern.segments.length - 1;
    } else {
      const width = randomBetween(random, 270, isLong ? 520 : 390);
      pattern.segments.push(flat(x, y, x + width));
      pattern.segmentDifficulties.push(phase.difficulty);
      x += width;
      newSegmentIndex = pattern.segments.length - 1;
      addHazard(pattern, newSegmentIndex, random, phase.difficulty, phaseIndex);
    }

    pattern.phases.push({
      role: phase.role,
      difficulty: phase.difficulty,
      startX: Math.round(phaseStartX),
      endX: Math.round(x),
    });
  }

  const exitStartX = x;
  if (Math.abs(y - GAMEPLAY.groundY) > 3) {
    const exitAngle = randomBetween(random, 15, 24);
    const exitLength = clamp(
      Math.abs(GAMEPLAY.groundY - y) /
        Math.tan((exitAngle * Math.PI) / 180),
      180,
      390,
    );
    pattern.segments.push(slope(x, y, x + exitLength, GAMEPLAY.groundY));
    pattern.segmentDifficulties.push(0.14);
    x += exitLength;
    y = GAMEPLAY.groundY;
  }
  pattern.segments.push(flat(x, y, x + randomBetween(random, 170, 260)));
  pattern.segmentDifficulties.push(0.12);
  x = pattern.segments.at(-1).x2;
  pattern.phases.push({
    role: 'exit',
    difficulty: 0.12,
    startX: Math.round(exitStartX),
    endX: Math.round(x),
  });
  pattern.width = Math.round(x);

  const bundleEligible = score >= 300 && (forceBundle || random() < 0.09 + difficulty * 0.12);
  if (bundleEligible) {
    const candidates = pattern.segments
      .map((segment, index) => ({ segment, index }))
      .filter(({ segment }) =>
        segment.y1 === segment.y2 &&
        segment.x2 - segment.x1 >= 190 &&
        segment.y1 <= 345,
      )
      .sort((a, b) => a.segment.y1 - b.segment.y1);
    const target = candidates[0];
    if (target) {
      pattern.bundle = {
        segment: target.index,
        x: Math.round((target.segment.x1 + target.segment.x2) / 2),
        lift: 58,
      };
      pattern.hazards = pattern.hazards.filter(
        (hazard) => hazard.segment !== target.index,
      );
    }
  }

  addCoinRuns(pattern, random);
  pattern.signature = pattern.segments
    .map((segment, index) => {
      const gap = index ? Math.max(0, segment.x1 - pattern.segments[index - 1].x2) : 0;
      const type = segment.y1 === segment.y2 ? (gap > 3 ? 'G' : 'F') : 'S';
      return `${type}${Math.round(Math.min(segment.y1, segment.y2) / 30)}`;
    })
    .join('-');

  return pattern;
}

export function generateProceduralRoute(options) {
  const speeds = [
    options.worldSpeed,
    Math.min(GAMEPLAY.maxSpeed, options.worldSpeed + 90),
    GAMEPLAY.maxSpeed,
  ];
  const rejected = [];

  for (let attempt = 0; attempt < GENERATION_ATTEMPTS; attempt += 1) {
    const attemptSeed = `${options.seed}:${attempt}`;
    const pattern = createRouteCandidate({ ...options, seed: attemptSeed });
    if (options.forceBundle && !pattern.bundle) {
      rejected.push({ attempt, reason: 'bundle-peak-unavailable' });
      continue;
    }
    if (options.recentSignatures?.includes(pattern.signature)) {
      rejected.push({ attempt, reason: 'recent-signature' });
      continue;
    }
    const verification = verifyProceduralRoute(pattern, speeds);
    if (verification.reachable) {
      pattern.verification = verification;
      pattern.generationAttempt = attempt + 1;
      return { pattern, rejected };
    }
    rejected.push({ attempt, reason: verification.errors[0] ?? 'unknown' });
  }

  return { pattern: null, rejected };
}
