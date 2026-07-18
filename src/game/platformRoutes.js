import Phaser from 'phaser';
import { COLORS, GAMEPLAY } from './constants.js';
import {
  PLATFORM_ROUTE_PATTERNS,
  getSegmentSurfaceY,
  validatePlatformRoutePatterns,
} from './platformRoutePatterns.js';

const ROUTE_START_X = GAMEPLAY.width + 100;
const FIRST_ROUTE_DISTANCE = 1180;
const ROUTE_TRAILING_CLEARANCE = 780;
const ROUTE_DESTROY_X = -140;
const RAMP_STEP_TOLERANCE = 20;
const LANDING_TOLERANCE = 10;
const BUNDLE_PITY_LIMIT = 3;
const PLATFORM_THICKNESS = 24;

function pickWeighted(patterns) {
  const totalWeight = patterns.reduce((sum, pattern) => sum + pattern.weight, 0);
  let roll = Phaser.Math.FloatBetween(0, totalWeight);
  for (const pattern of patterns) {
    roll -= pattern.weight;
    if (roll <= 0) {
      return pattern;
    }
  }
  return patterns.at(-1);
}

export class PlatformRouteManager {
  constructor(scene, {
    player,
    powerUps,
    canSpawnRoute,
    reserveObstacleGap,
    onLand,
  }) {
    this.scene = scene;
    this.player = player;
    this.powerUps = powerUps;
    this.canSpawnRoute = canSpawnRoute;
    this.reserveObstacleGap = reserveObstacleGap;
    this.onLand = onLand;
    this.routes = [];
    this.distanceUntilNextRoute = FIRST_ROUTE_DISTANCE;
    this.lastPatternId = null;
    this.routesSinceBundle = 0;
    this.routeSerial = 0;
    this.supported = false;
    this.supportY = GAMEPLAY.groundY;
    this.lastPlayerY = player.y;

    const validationErrors = validatePlatformRoutePatterns();
    if (validationErrors.length) {
      throw new Error(`Invalid platform routes: ${validationErrors.join('; ')}`);
    }
  }

  update(deltaSeconds, worldSpeed, score) {
    const safeSpeed = Math.max(GAMEPLAY.initialSpeed, worldSpeed);
    const movement = safeSpeed * deltaSeconds;

    this.routes.forEach((route) => {
      route.x -= movement;
      route.container.setX(route.x);
    });

    this.updatePlayerSupport();

    const remainingRoutes = [];
    this.routes.forEach((route) => {
      if (route.x + route.pattern.width < ROUTE_DESTROY_X) {
        route.container.destroy(true);
      } else {
        remainingRoutes.push(route);
      }
    });
    const routeJustFinished = this.routes.length > 0 && remainingRoutes.length === 0;
    this.routes = remainingRoutes;

    if (routeJustFinished) {
      this.distanceUntilNextRoute = safeSpeed * Phaser.Math.FloatBetween(5.5, 8.5);
    }

    if (this.routes.length || score < 120) {
      this.lastPlayerY = this.player.y;
      return;
    }

    this.distanceUntilNextRoute -= movement;
    if (this.distanceUntilNextRoute <= 0) {
      if (this.canSpawnRoute()) {
        this.spawnRoute(this.selectPattern(score));
      } else {
        this.distanceUntilNextRoute = safeSpeed * 0.9;
      }
    }

    this.lastPlayerY = this.player.y;
  }

  selectPattern(score) {
    let available = PLATFORM_ROUTE_PATTERNS.filter(
      (pattern) => pattern.unlockScore <= score && pattern.id !== this.lastPatternId,
    );
    if (!available.length) {
      available = PLATFORM_ROUTE_PATTERNS.filter((pattern) => pattern.unlockScore <= score);
    }

    const bundlePattern = available.find((pattern) => pattern.bundle);
    if (bundlePattern && this.routesSinceBundle >= BUNDLE_PITY_LIMIT) {
      return bundlePattern;
    }
    return pickWeighted(available);
  }

  spawnRoute(pattern) {
    if (!pattern) {
      return false;
    }

    const route = {
      id: `platform-route-${this.routeSerial += 1}`,
      x: ROUTE_START_X,
      pattern,
      container: this.createRouteVisual(pattern),
    };
    route.container.setX(route.x);
    this.routes.push(route);
    this.lastPatternId = pattern.id;
    this.distanceUntilNextRoute = Number.POSITIVE_INFINITY;

    if (pattern.bundle) {
      this.routesSinceBundle = 0;
    } else {
      this.routesSinceBundle += 1;
    }

    this.spawnRewards(route);
    this.reserveObstacleGap(pattern.width + ROUTE_TRAILING_CLEARANCE);
    return true;
  }

  createRouteVisual(pattern) {
    const container = this.scene.add.container(0, 0).setDepth(7);
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    const isIsekai = this.scene.isIsekaiWorld;
    const fillColor = isIsekai ? 0x4b4567 : 0x4f7892;
    const undersideColor = isIsekai ? 0x302b4a : 0x31566f;
    const edgeColor = isIsekai ? 0x8fffe0 : COLORS.cream;
    const accentColor = isIsekai ? 0xb9a5ff : COLORS.orange;

    pattern.segments.forEach((segment, index) => {
      graphics.fillStyle(undersideColor, 0.98);
      graphics.fillPoints([
        { x: segment.x1, y: segment.y1 + 6 },
        { x: segment.x2, y: segment.y2 + 6 },
        { x: segment.x2, y: segment.y2 + PLATFORM_THICKNESS },
        { x: segment.x1, y: segment.y1 + PLATFORM_THICKNESS },
      ], true);
      graphics.fillStyle(fillColor, 1);
      graphics.fillPoints([
        { x: segment.x1, y: segment.y1 },
        { x: segment.x2, y: segment.y2 },
        { x: segment.x2, y: segment.y2 + 10 },
        { x: segment.x1, y: segment.y1 + 10 },
      ], true);
      graphics.lineStyle(4, edgeColor, 0.96);
      graphics.lineBetween(segment.x1, segment.y1, segment.x2, segment.y2);

      const segmentWidth = segment.x2 - segment.x1;
      const markerCount = Math.max(1, Math.floor(segmentWidth / 74));
      for (let marker = 1; marker <= markerCount; marker += 1) {
        const progress = marker / (markerCount + 1);
        const markerX = Phaser.Math.Linear(segment.x1, segment.x2, progress);
        const markerY = Phaser.Math.Linear(segment.y1, segment.y2, progress);
        if (isIsekai) {
          graphics.fillStyle(marker % 2 ? accentColor : edgeColor, 0.72);
          graphics.fillCircle(markerX, markerY + 14, 3);
        } else {
          graphics.lineStyle(2, accentColor, 0.52);
          graphics.lineBetween(markerX - 13, markerY + 12, markerX + 13, markerY + 21);
          graphics.lineBetween(markerX + 13, markerY + 12, markerX - 13, markerY + 21);
        }
      }

      if (index === 0) {
        graphics.fillStyle(accentColor, 1);
        graphics.fillTriangle(
          segment.x1 + 14,
          segment.y1 - 10,
          segment.x1 + 31,
          segment.y1 - 20,
          segment.x1 + 31,
          segment.y1,
        );
      }
    });

    container.add(graphics);

    if (pattern.bundle) {
      const bundleSegment = pattern.segments[pattern.bundle.segment];
      const bundleY = getSegmentSurfaceY(bundleSegment, pattern.bundle.x);
      const badge = this.scene.add
        .text(pattern.bundle.x, bundleY - 102, '★ 特殊道具大礼包', {
          fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#fff7e3',
          stroke: isIsekai ? '#30234f' : '#173c59',
          strokeThickness: 5,
        })
        .setOrigin(0.5)
        .setDepth(10);
      container.add(badge);
      this.scene.tweens.add({
        targets: badge,
        y: badge.y - 7,
        duration: 620,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.InOut',
      });
    }

    return container;
  }

  spawnRewards(route) {
    route.pattern.coinRuns.forEach((run) => {
      const segment = route.pattern.segments[run.segment];
      const usableWidth = segment.x2 - segment.x1 - run.inset * 2;
      for (let index = 0; index < run.count; index += 1) {
        const progress = run.count === 1 ? 0.5 : index / (run.count - 1);
        const localX = segment.x1 + run.inset + usableWidth * progress;
        const surfaceY = getSegmentSurfaceY(segment, localX);
        this.powerUps.spawnRouteCoin(
          route.x + localX,
          surfaceY - run.lift,
          route.id,
        );
      }
    });

    if (route.pattern.bundle) {
      const definition = route.pattern.bundle;
      const segment = route.pattern.segments[definition.segment];
      const surfaceY = getSegmentSurfaceY(segment, definition.x);
      this.powerUps.spawnRewardBundle(
        route.x + definition.x,
        surfaceY - definition.lift,
        route.id,
      );
    }
  }

  findSurfaceAtPlayer() {
    const playerX = this.player.x;
    const candidates = [];
    this.routes.forEach((route) => {
      const localX = playerX - route.x;
      route.pattern.segments.forEach((segment) => {
        if (localX >= segment.x1 - 2 && localX <= segment.x2 + 2) {
          candidates.push({
            route,
            segment,
            y: getSegmentSurfaceY(segment, localX),
          });
        }
      });
    });

    candidates.sort(
      (a, b) => Math.abs(this.player.y - a.y) - Math.abs(this.player.y - b.y),
    );
    return candidates[0] ?? null;
  }

  updatePlayerSupport() {
    const wasSupported = this.supported;
    this.supported = false;
    const candidate = this.findSurfaceAtPlayer();
    if (!candidate || !this.player?.active || !this.player.body?.enable) {
      return;
    }

    const surfaceY = candidate.y;
    const currentY = this.player.y;
    const velocityY = this.player.body.velocity.y;
    const groundContact =
      this.player.body.blocked.down || this.player.body.touching.down;
    const landedFromAbove =
      velocityY >= 0 &&
      this.lastPlayerY <= surfaceY + LANDING_TOLERANCE &&
      currentY >= surfaceY - LANDING_TOLERANCE;
    const followsExistingSurface =
      wasSupported &&
      velocityY >= -1 &&
      Math.abs(currentY - surfaceY) <= RAMP_STEP_TOLERANCE + 8;
    const entersRampFromGround =
      groundContact &&
      velocityY >= 0 &&
      surfaceY <= currentY + 5 &&
      currentY - surfaceY <= RAMP_STEP_TOLERANCE;

    if (!landedFromAbove && !followsExistingSurface && !entersRampFromGround) {
      return;
    }

    this.player.setY(surfaceY);
    this.player.setVelocityY(0);
    this.player.body.updateFromGameObject();
    this.supported = true;
    this.supportY = surfaceY;

    if (!wasSupported) {
      this.onLand?.(this.player.x, surfaceY, candidate.route.pattern.label);
    }
  }

  isPlayerSupported() {
    return this.supported;
  }

  getSupportY() {
    return this.supported ? this.supportY : GAMEPLAY.groundY;
  }

  blocksIndependentPickups() {
    return this.routes.length > 0;
  }

  clearForTransition() {
    this.routes.forEach((route) => route.container.destroy(true));
    this.routes = [];
    this.supported = false;
    this.supportY = GAMEPLAY.groundY;
    this.distanceUntilNextRoute = Number.POSITIVE_INFINITY;
  }

  spawnDebugRoute(patternId) {
    this.routes.forEach((route) => route.container.destroy(true));
    this.routes = [];
    const pattern = PLATFORM_ROUTE_PATTERNS.find((entry) => entry.id === patternId);
    return this.spawnRoute(pattern);
  }

  destroy() {
    this.clearForTransition();
  }
}
