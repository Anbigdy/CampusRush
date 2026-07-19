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
} from '../src/game/platformSupport.js';
import { speakGenericChinese } from '../src/game/speechSynthesis.js';

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

if (speakGenericChinese('fallback check') !== false) {
  failures.push('speech synthesis did not fail safely without a browser engine');
}

if (failures.length) {
  console.error(JSON.stringify({ failures }, null, 2));
  process.exitCode = 1;
} else {
  console.log(
    JSON.stringify(
      {
        obstaclesChecked: obstacles.length,
        supportChecks: 4,
        speechFallbackChecks: 1,
        failures: 0,
      },
      null,
      2,
    ),
  );
}
