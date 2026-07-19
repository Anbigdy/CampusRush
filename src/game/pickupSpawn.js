export const PICKUP_SPAWN_FREQUENCY_MULTIPLIER = 1.2;

const BASE_PICKUP_SPAWN_TIMING = Object.freeze({
  initial: 7,
  min: 12,
  max: 18,
});

export const PICKUP_SPAWN_TIMING = Object.freeze({
  initial:
    BASE_PICKUP_SPAWN_TIMING.initial / PICKUP_SPAWN_FREQUENCY_MULTIPLIER,
  min: BASE_PICKUP_SPAWN_TIMING.min / PICKUP_SPAWN_FREQUENCY_MULTIPLIER,
  max: BASE_PICKUP_SPAWN_TIMING.max / PICKUP_SPAWN_FREQUENCY_MULTIPLIER,
});

export const BLIND_BOX_SPAWN_TIMING = Object.freeze({
  initial: 4,
  min: 7,
  max: 10,
});
