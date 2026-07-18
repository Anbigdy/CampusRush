import { GAMEPLAY } from './constants.js';

const SAMPLE_SECONDS = 1 / 60;
const DOUBLE_JUMP_SAMPLE_SECONDS = 1 / 30;

function descendingCrossingTime(startY, startVelocity, targetY) {
  const discriminant =
    startVelocity * startVelocity +
    2 * GAMEPLAY.gravityY * (targetY - startY);
  if (discriminant < 0) {
    return null;
  }
  const time =
    (-startVelocity + Math.sqrt(discriminant)) / GAMEPLAY.gravityY;
  return time > 0 ? time : null;
}

function positionAt(startY, velocity, time) {
  return (
    startY +
    velocity * time +
    0.5 * GAMEPLAY.gravityY * time * time
  );
}

function velocityAt(velocity, time) {
  return velocity + GAMEPLAY.gravityY * time;
}

function minimumInputWindow(difficulty) {
  if (difficulty >= 0.72) {
    return 0.12;
  }
  if (difficulty >= 0.46) {
    return 0.16;
  }
  return 0.2;
}

function recordLanding(records, leadTime, landingTime, action, detail = {}) {
  records.push({ leadTime, landingTime, action, ...detail });
}

export function solvePlatformTransition(
  fromSegment,
  toSegment,
  worldSpeed,
  difficulty = 0.5,
) {
  const gap = toSegment.x1 - fromSegment.x2;
  const fromWidth = fromSegment.x2 - fromSegment.x1;
  const toWidth = toSegment.x2 - toSegment.x1;
  const startY = fromSegment.y2;
  const targetY = toSegment.y1;

  if (gap < -2) {
    return { reachable: false, reason: 'overlapping-segments' };
  }
  if (gap <= 2) {
    const heightMismatch = Math.abs(startY - targetY);
    return {
      reachable: heightMismatch <= 3,
      reason: heightMismatch <= 3 ? 'continuous' : 'vertical-step-without-gap',
      inputWindow: Number.POSITIVE_INFINITY,
      witness: { action: 'run' },
    };
  }

  const safeSpeed = Math.max(GAMEPLAY.initialSpeed, worldSpeed);
  const maximumLeadTime = Math.min(0.52, (fromWidth * 0.78) / safeSpeed);
  const records = [];
  const successfulLeadTimes = new Set();

  for (
    let leadTime = 0;
    leadTime <= maximumLeadTime + SAMPLE_SECONDS / 2;
    leadTime += SAMPLE_SECONDS
  ) {
    const roundedLead = Number(leadTime.toFixed(4));
    const landingWindowStart = leadTime + gap / safeSpeed;
    const landingWindowEnd = leadTime + (gap + toWidth) / safeSpeed;
    const singleLanding = descendingCrossingTime(
      startY,
      GAMEPLAY.jumpVelocity,
      targetY,
    );

    if (
      singleLanding !== null &&
      singleLanding >= landingWindowStart &&
      singleLanding <= landingWindowEnd
    ) {
      successfulLeadTimes.add(roundedLead);
      recordLanding(records, leadTime, singleLanding, 'jump');
    }

    const latestDoubleJump = Math.min(0.78, landingWindowEnd - 0.04);
    for (
      let doubleTime = 0.12;
      doubleTime <= latestDoubleJump;
      doubleTime += DOUBLE_JUMP_SAMPLE_SECONDS
    ) {
      const secondStartY = positionAt(
        startY,
        GAMEPLAY.jumpVelocity,
        doubleTime,
      );
      if (secondStartY >= GAMEPLAY.groundY + 4) {
        continue;
      }
      const secondFlight = descendingCrossingTime(
        secondStartY,
        GAMEPLAY.doubleJumpVelocity,
        targetY,
      );
      if (secondFlight === null) {
        continue;
      }
      const landingTime = doubleTime + secondFlight;
      if (
        landingTime >= landingWindowStart &&
        landingTime <= landingWindowEnd
      ) {
        successfulLeadTimes.add(roundedLead);
        recordLanding(records, leadTime, landingTime, 'doubleJump', {
          secondJumpTime: doubleTime,
        });
      }
    }

    if (targetY > startY + 28) {
      const latestFastFall = Math.min(0.72, landingWindowEnd - 0.03);
      for (
        let fastFallTime = 0.18;
        fastFallTime <= latestFastFall;
        fastFallTime += DOUBLE_JUMP_SAMPLE_SECONDS
      ) {
        const fastFallStartY = positionAt(
          startY,
          GAMEPLAY.jumpVelocity,
          fastFallTime,
        );
        const naturalVelocity = velocityAt(
          GAMEPLAY.jumpVelocity,
          fastFallTime,
        );
        const fastFallVelocity = Math.max(
          naturalVelocity,
          GAMEPLAY.fastFallVelocity,
        );
        const fastFallFlight = descendingCrossingTime(
          fastFallStartY,
          fastFallVelocity,
          targetY,
        );
        if (fastFallFlight === null) {
          continue;
        }
        const landingTime = fastFallTime + fastFallFlight;
        if (
          landingTime >= landingWindowStart &&
          landingTime <= landingWindowEnd
        ) {
          successfulLeadTimes.add(roundedLead);
          recordLanding(records, leadTime, landingTime, 'fastFall', {
            fastFallTime,
          });
        }
      }
    }
  }

  const inputWindow = successfulLeadTimes.size * SAMPLE_SECONDS;
  const requiredWindow = minimumInputWindow(difficulty);
  const preferredWitness =
    records.find((record) => record.action === 'jump') ??
    records.find((record) => record.action === 'doubleJump') ??
    records[0];

  return {
    reachable: records.length > 0 && inputWindow >= requiredWindow,
    reason:
      records.length === 0
        ? 'no-landing-solution'
        : inputWindow < requiredWindow
          ? 'input-window-too-small'
          : 'verified',
    inputWindow,
    requiredWindow,
    witness: preferredWitness,
    solutionCount: records.length,
  };
}

export function verifyProceduralRoute(pattern, speeds) {
  const errors = [];
  const witnesses = [];
  const uniqueSpeeds = [...new Set(
    speeds
      .filter(Number.isFinite)
      .map((speed) => Math.round(Math.max(GAMEPLAY.initialSpeed, speed))),
  )];

  pattern.segments.forEach((segment, index) => {
    const width = segment.x2 - segment.x1;
    const rise = Math.abs(segment.y2 - segment.y1);
    const angle = Math.atan2(rise, width) * (180 / Math.PI);
    if (width < 120) {
      errors.push(`segment-${index}:too-short`);
    }
    if (angle > 29) {
      errors.push(`segment-${index}:slope-${angle.toFixed(1)}`);
    }
    if (Math.min(segment.y1, segment.y2) < 238) {
      errors.push(`segment-${index}:too-high`);
    }
  });

  uniqueSpeeds.forEach((speed) => {
    for (let index = 1; index < pattern.segments.length; index += 1) {
      const fromSegment = pattern.segments[index - 1];
      const toSegment = pattern.segments[index];
      const difficulty = pattern.segmentDifficulties?.[index] ?? pattern.difficulty;
      const result = solvePlatformTransition(
        fromSegment,
        toSegment,
        speed,
        difficulty,
      );
      witnesses.push({ speed, transition: index - 1, ...result });
      if (!result.reachable) {
        errors.push(
          `speed-${speed}:transition-${index - 1}:${result.reason}`,
        );
      }
    }
  });

  pattern.hazards?.forEach((hazard, index) => {
    const segment = pattern.segments[hazard.segment];
    if (!segment || segment.y1 !== segment.y2) {
      errors.push(`hazard-${index}:not-on-flat`);
      return;
    }
    const runIn = hazard.x - segment.x1;
    const runOut = segment.x2 - hazard.x;
    if (runIn < 105 || runOut < 90) {
      errors.push(`hazard-${index}:insufficient-clearance`);
    }
  });

  return {
    reachable: errors.length === 0,
    errors,
    witnesses,
    minimumInputWindow: Math.min(
      ...witnesses
        .filter((witness) => Number.isFinite(witness.inputWindow))
        .map((witness) => witness.inputWindow),
      Number.POSITIVE_INFINITY,
    ),
  };
}
