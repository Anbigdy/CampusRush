import { GAMEPLAY } from '../src/game/constants.js';
import { generateProceduralRoute } from '../src/game/proceduralRouteGenerator.js';
import { verifyProceduralRoute } from '../src/game/routeReachability.js';

const speeds = [
  GAMEPLAY.initialSpeed,
  360,
  420,
  480,
  GAMEPLAY.maxSpeed,
];
const casesPerSpeed = 60;
const failures = [];
const rhythms = new Set();
let generated = 0;
let longRoutes = 0;
let minCoins = Number.POSITIVE_INFINITY;
let minInputWindow = Number.POSITIVE_INFINITY;

for (const worldSpeed of speeds) {
  for (let index = 0; index < casesPerSpeed; index += 1) {
    const forceBundle = index % 11 === 0;
    const result = generateProceduralRoute({
      seed: `validation-${worldSpeed}-${index}`,
      score: 350 + index * 17,
      worldSpeed,
      isIsekaiWorld: index % 4 === 0,
      performanceAdjustment: [-0.12, 0, 0.12][index % 3],
      forceBundle,
      recentSignatures: [],
    });
    const pattern = result.pattern;
    if (!pattern) {
      failures.push(
        `speed ${worldSpeed}, case ${index}: generation failed (${result.rejected.at(-1)?.reason})`,
      );
      continue;
    }

    generated += 1;
    longRoutes += Number(pattern.isLong);
    rhythms.add(pattern.rhythm);
    minCoins = Math.min(
      minCoins,
      pattern.coinRuns.reduce((sum, run) => sum + run.count, 0),
    );

    if (forceBundle && !pattern.bundle) {
      failures.push(`speed ${worldSpeed}, case ${index}: bundle pity failed`);
    }

    pattern.coinRuns.forEach((run) => {
      pattern.hazards
        .filter((hazard) => hazard.segment === run.segment)
        .forEach((hazard) => {
          if (run.startX <= hazard.x + 81 && run.endX >= hazard.x - 81) {
            failures.push(
              `speed ${worldSpeed}, case ${index}: coin run overlaps a hazard`,
            );
          }
        });
    });

    const verification = verifyProceduralRoute(pattern, [
      worldSpeed,
      Math.min(GAMEPLAY.maxSpeed, worldSpeed + 90),
      GAMEPLAY.maxSpeed,
    ]);
    if (!verification.reachable) {
      failures.push(
        `speed ${worldSpeed}, case ${index}: ${verification.errors[0]}`,
      );
    }
    minInputWindow = Math.min(
      minInputWindow,
      verification.minimumInputWindow,
    );
  }
}

const summary = {
  cases: speeds.length * casesPerSpeed,
  generated,
  longRoutes,
  rhythms: [...rhythms].sort(),
  minCoins,
  minInputWindowSeconds: Number(minInputWindow.toFixed(3)),
  failures: failures.length,
};

console.log(JSON.stringify(summary, null, 2));
if (failures.length) {
  console.error(failures.slice(0, 12).join('\n'));
  process.exitCode = 1;
}
