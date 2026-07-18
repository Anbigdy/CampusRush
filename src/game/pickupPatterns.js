import { GAMEPLAY } from './constants.js';

const COIN_COUNT = 7;
const PLAYER_BODY_CENTER_OFFSET = 27;

export const PICKUP_ENTRY_CLEARANCE = 200;
export const PICKUP_TRAILING_GAP = 220;

export function createJumpArcCoinPattern(worldSpeed) {
  const safeSpeed = Number.isFinite(worldSpeed)
    ? Math.max(GAMEPLAY.initialSpeed, worldSpeed)
    : GAMEPLAY.initialSpeed;
  const flightSeconds =
    (-2 * GAMEPLAY.jumpVelocity) / GAMEPLAY.gravityY;

  return Array.from({ length: COIN_COUNT }, (_value, index) => {
    const time = (flightSeconds * index) / (COIN_COUNT - 1);
    const playerBottomY =
      GAMEPLAY.groundY +
      GAMEPLAY.jumpVelocity * time +
      0.5 * GAMEPLAY.gravityY * time * time;

    return {
      time,
      xOffset: safeSpeed * time,
      y: playerBottomY - PLAYER_BODY_CENTER_OFFSET,
    };
  });
}
