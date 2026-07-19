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
import { anchorBodyGeometryToFoot } from '../src/game/playerBodyGeometry.js';
import {
  HAKIMI_AUDIO,
  SNOW_PEAK_SUNG_LINE,
  buildHakimiVoiceSequence,
  playHakimiVoice,
  stopHakimiVoice,
} from '../src/game/snowPeakAudio.js';
import { SNOW_PEAK_RANDOM_LINES } from '../src/game/snowPeakDialogue.js';

const failures = [];
const obstacles = [...OBSTACLES, ...ISEKAI_OBSTACLES, ...NEON_OBSTACLES];

if (
  SNOW_PEAK_RANDOM_LINES.length < 8 ||
  new Set(SNOW_PEAK_RANDOM_LINES).size !== SNOW_PEAK_RANDOM_LINES.length ||
  SNOW_PEAK_RANDOM_LINES.some((line) => line.length > 16)
) {
  failures.push(
    'Snow Peak dialogue candidates are sparse, duplicated, or too long',
  );
}

const bodyResizeProbe = {
  position: {
    x: 100,
    y: 270,
    set(x, y) {
      this.x = x;
      this.y = y;
    },
  },
  width: 40,
  height: 30,
  prev: { x: 100, y: 270 },
  prevFrame: { x: 100, y: 275 },
  autoFrame: { x: 100, y: 270 },
  updateCenter() {
    this.center = {
      x: this.position.x + this.width / 2,
      y: this.position.y + this.height / 2,
    };
  },
};
const velocityBeforeResize =
  bodyResizeProbe.position.y - bodyResizeProbe.prevFrame.y;
anchorBodyGeometryToFoot(bodyResizeProbe, {
  previousPositionX: 100,
  previousPositionY: 270,
  centerX: 120,
  bottom: 324,
});
const velocityAfterResize =
  bodyResizeProbe.position.y - bodyResizeProbe.prevFrame.y;
if (
  bodyResizeProbe.position.x !== 100 ||
  bodyResizeProbe.position.y !== 294 ||
  bodyResizeProbe.position.y + bodyResizeProbe.height !== 324 ||
  velocityAfterResize !== velocityBeforeResize
) {
  failures.push('player body resize did not preserve foot position and motion');
}

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

const spokenSequence = buildHakimiVoiceSequence('土木有前景');
const songSequence = buildHakimiVoiceSequence(SNOW_PEAK_SUNG_LINE, {
  delivery: 'song',
});
if (
  spokenSequence.length !== 5 ||
  new Set(spokenSequence.map((syllable) => syllable.rate)).size < 2
) {
  failures.push('Hakimi speech did not create varied cat-language syllables');
}
if (
  songSequence.length !== 10 ||
  new Set(songSequence.map((syllable) => syllable.rate)).size < 4 ||
  songSequence.at(-1).delay >= 2.8
) {
  failures.push('Hakimi song did not create the intended pitched sequence');
}

const scheduledHakimiSources = [];
const mockHakimiScene = {
  cache: {
    audio: {
      exists: () => true,
      get: () => ({ duration: 0.604 }),
    },
  },
  sound: {
    destination: {},
    context: {
      currentTime: 1,
      state: 'running',
      createBufferSource() {
        const source = {
          playbackRate: { setValueAtTime() {} },
          connect() {},
          start() {},
          stop() {
            this.stopped = true;
          },
        };
        scheduledHakimiSources.push(source);
        return source;
      },
      createGain() {
        return {
          gain: {
            setValueAtTime() {},
            exponentialRampToValueAtTime() {},
          },
          connect() {},
        };
      },
    },
  },
};
if (
  !playHakimiVoice(mockHakimiScene, '新闻学已死') ||
  scheduledHakimiSources.length !== 5 ||
  !stopHakimiVoice(mockHakimiScene) ||
  scheduledHakimiSources.some((source) => !source.stopped)
) {
  failures.push('Hakimi voice did not schedule and stop cleanly');
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
        bodyGeometryChecks: 1,
        hakimiVoiceChecks: 3,
        snowPeakDialogueChecks: 1,
        audioAssetsChecked: 1,
        failures: 0,
      },
      null,
      2,
    ),
  );
}
