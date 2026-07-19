import { existsSync, statSync } from 'node:fs';
import {
  ISEKAI_OBSTACLES,
  NEON_OBSTACLES,
  OBSTACLES,
} from '../src/game/constants.js';
import {
  SUPPORT_SURFACE_MISS_GRACE_FRAMES,
  canBridgeSurfaceMiss,
  canFollowSupportedSurface,
  chooseSurfaceCandidate,
  didLandOnSurface,
} from '../src/game/platformSupport.js';
import {
  singGenericChinese,
  speakGenericChinese,
  stopGenericSpeech,
} from '../src/game/speechSynthesis.js';
import {
  HAKIMI_AUDIO,
  SNOW_PEAK_SONG_SEGMENTS,
  SNOW_PEAK_SUNG_LINE,
} from '../src/game/snowPeakAudio.js';

const failures = [];
const obstacles = [...OBSTACLES, ...ISEKAI_OBSTACLES, ...NEON_OBSTACLES];

for (const obstacle of obstacles) {
  const { body } = obstacle;
  const right = body.offsetX + body.width;
  const bottom = body.offsetY + body.height;
  const expectedOffsetX = (obstacle.width - body.width) / 2;

  if (
    body.offsetX < 0 ||
    body.offsetY < 0 ||
    right > obstacle.width ||
    bottom > obstacle.height
  ) {
    failures.push(`${obstacle.key}: collision body exceeds visual bounds`);
  }
  if (Math.abs(body.offsetX - expectedOffsetX) > 1) {
    failures.push(
      `${obstacle.key}: horizontal body offset is not centered ` +
        `(expected ${expectedOffsetX}, received ${body.offsetX})`,
    );
  }
}

const routeA = { id: 'route-a' };
const routeB = { id: 'route-b' };
const candidates = [
  { route: routeB, segmentIndex: 0, y: 402 },
  { route: routeA, segmentIndex: 1, y: 398 },
  { route: routeA, segmentIndex: 2, y: 401 },
];

const preferredSegment = chooseSurfaceCandidate(candidates, 400, {
  routeId: routeA.id,
  segmentIndex: 1,
});
if (preferredSegment?.segmentIndex !== 1) {
  failures.push('platform support did not retain the preferred segment');
}

const preferredRoute = chooseSurfaceCandidate(candidates, 400, {
  routeId: routeA.id,
  segmentIndex: 99,
});
if (
  preferredRoute?.route.id !== routeA.id ||
  preferredRoute.segmentIndex !== 2
) {
  failures.push('platform support did not retain the preferred route at a seam');
}

const followsSurface = canFollowSupportedSurface({
  wasSupported: true,
  previousContact: { routeId: routeA.id, segmentIndex: 1 },
  candidate: candidates[1],
  velocityY: 0,
  currentFeetY: 400,
  surfaceY: 398,
  maxDistance: 28,
});
if (!followsSurface) {
  failures.push('continuous slope contact was unexpectedly released');
}

if (SUPPORT_SURFACE_MISS_GRACE_FRAMES < 1) {
  failures.push('platform support needs at least one frame of seam grace');
}

if (
  !canBridgeSurfaceMiss({
    wasSupported: true,
    velocityY: 0,
    missFrames: SUPPORT_SURFACE_MISS_GRACE_FRAMES - 1,
  }) ||
  canBridgeSurfaceMiss({
    wasSupported: true,
    velocityY: 0,
    missFrames: SUPPORT_SURFACE_MISS_GRACE_FRAMES,
  })
) {
  failures.push('platform seam grace did not expire at the configured limit');
}

const landingCases = [
  {
    label: 'normal descent crosses the moving slope',
    expected: true,
    input: {
      velocityY: 260,
      lastFeetY: 389,
      currentFeetY: 402,
      previousSurfaceY: 394,
      surfaceY: 399,
      approachTolerance: 4,
      contactEpsilon: 1,
    },
  },
  {
    label: 'fast fall crosses the moving slope',
    expected: true,
    input: {
      velocityY: 820,
      lastFeetY: 370,
      currentFeetY: 425,
      previousSurfaceY: 396,
      surfaceY: 402,
      approachTolerance: 4,
      contactEpsilon: 1,
    },
  },
  {
    label: 'descending player remains visibly above the slope',
    expected: false,
    input: {
      velocityY: 260,
      lastFeetY: 380,
      currentFeetY: 393,
      previousSurfaceY: 397,
      surfaceY: 400,
      approachTolerance: 4,
      contactEpsilon: 1,
    },
  },
  {
    label: 'ascending player cannot land',
    expected: false,
    input: {
      velocityY: -120,
      lastFeetY: 398,
      currentFeetY: 401,
      previousSurfaceY: 399,
      surfaceY: 400,
      approachTolerance: 4,
      contactEpsilon: 1,
    },
  },
];

for (const landingCase of landingCases) {
  if (didLandOnSurface(landingCase.input) !== landingCase.expected) {
    failures.push(`slope landing case failed: ${landingCase.label}`);
  }
}

if (speakGenericChinese('fallback check') !== false) {
  failures.push('speech synthesis did not fail safely without a browser engine');
}
if (singGenericChinese(SNOW_PEAK_SONG_SEGMENTS) !== false) {
  failures.push('song synthesis did not fail safely without a browser engine');
}

const speechEngineDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  'speechSynthesis',
);
const utteranceDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  'SpeechSynthesisUtterance',
);
const queuedUtterances = [];
let speechCancelCount = 0;
class MockUtterance {
  constructor(text) {
    this.text = text;
  }
}
Object.defineProperty(globalThis, 'speechSynthesis', {
  configurable: true,
  value: {
    cancel: () => {
      speechCancelCount += 1;
    },
    getVoices: () => [],
    speak: (utterance) => queuedUtterances.push(utterance),
  },
});
Object.defineProperty(globalThis, 'SpeechSynthesisUtterance', {
  configurable: true,
  value: MockUtterance,
});
try {
  if (
    !singGenericChinese(SNOW_PEAK_SONG_SEGMENTS) ||
    queuedUtterances.length !== SNOW_PEAK_SONG_SEGMENTS.length ||
    queuedUtterances.some(
      (utterance, index) =>
        utterance.text !== SNOW_PEAK_SONG_SEGMENTS[index].text ||
        utterance.pitch !== SNOW_PEAK_SONG_SEGMENTS[index].pitch ||
        utterance.rate !== SNOW_PEAK_SONG_SEGMENTS[index].rate,
    )
  ) {
    failures.push('Snow Peak song was not queued with the intended pitch steps');
  }
  if (!stopGenericSpeech() || speechCancelCount !== 2) {
    failures.push('queued Snow Peak song did not stop cleanly');
  }
} finally {
  if (speechEngineDescriptor) {
    Object.defineProperty(
      globalThis,
      'speechSynthesis',
      speechEngineDescriptor,
    );
  } else {
    delete globalThis.speechSynthesis;
  }
  if (utteranceDescriptor) {
    Object.defineProperty(
      globalThis,
      'SpeechSynthesisUtterance',
      utteranceDescriptor,
    );
  } else {
    delete globalThis.SpeechSynthesisUtterance;
  }
}

if (
  SNOW_PEAK_SONG_SEGMENTS.map((segment) => segment.text)
    .join('')
    .replace('，', '') !== SNOW_PEAK_SUNG_LINE.replace('，', '')
) {
  failures.push('Snow Peak song segments do not preserve the displayed line');
}

const hakimiAssetUrl = new URL(
  `../public/${HAKIMI_AUDIO.assetPath}`,
  import.meta.url,
);
if (!existsSync(hakimiAssetUrl) || statSync(hakimiAssetUrl).size < 1000) {
  failures.push('CC0 Hakimi audio asset is missing or unexpectedly empty');
}

if (failures.length) {
  console.error(JSON.stringify({ failures }, null, 2));
  process.exitCode = 1;
} else {
  console.log(
    JSON.stringify(
      {
        obstaclesChecked: obstacles.length,
        supportChecks: 4 + landingCases.length,
        speechFallbackChecks: 2,
        songSequenceChecks: 2,
        audioAssetsChecked: 1,
        failures: 0,
      },
      null,
      2,
    ),
  );
}
