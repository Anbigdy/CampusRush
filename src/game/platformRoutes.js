import Phaser from 'phaser';
import { COLORS, GAMEPLAY } from './constants.js';
import {
  PLATFORM_ROUTE_PATTERNS,
  getSegmentSurfaceY,
  validatePlatformRoutePatterns,
} from './platformRoutePatterns.js';
import {
  canBridgeSurfaceMiss,
  canFollowSupportedSurface,
  chooseSurfaceCandidate,
  didLandOnSurface,
} from './platformSupport.js';
import { generateProceduralRoute } from './proceduralRouteGenerator.js';

const ROUTE_START_X = GAMEPLAY.width + 100;
const FIRST_ROUTE_DISTANCE = 1180;
const ROUTE_TRAILING_CLEARANCE = 780;
const ROUTE_DESTROY_X = -140;
const RAMP_STEP_TOLERANCE = 20;
const LANDING_APPROACH_TOLERANCE = 4;
const LANDING_CONTACT_EPSILON = 1;
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
    spawnRouteHazard,
    onRouteComplete,
  }) {
    this.scene = scene;
    this.player = player;
    this.powerUps = powerUps;
    this.canSpawnRoute = canSpawnRoute;
    this.reserveObstacleGap = reserveObstacleGap;
    this.onLand = onLand;
    this.spawnRouteHazard = spawnRouteHazard;
    this.onRouteComplete = onRouteComplete;
    this.routes = [];
    this.distanceUntilNextRoute = FIRST_ROUTE_DISTANCE;
    this.lastPatternId = null;
    this.routesSinceBundle = 0;
    this.routeSerial = 0;
    this.routeSeedBase = `${scene.worldMode}-${Date.now()}-${Phaser.Math.Between(1000, 9999)}`;
    this.recentSignatures = [];
    this.performanceAdjustment = 0;
    this.lastGeneration = null;
    this.supported = false;
    this.supportY = GAMEPLAY.groundY;
    this.supportContact = null;
    this.supportMissFrames = 0;
    this.lastPlayerFeetY = player.body?.bottom ?? player.y;

    const validationErrors = validatePlatformRoutePatterns();
    if (validationErrors.length) {
      throw new Error(`Invalid platform routes: ${validationErrors.join('; ')}`);
    }
  }

  update(deltaSeconds, worldSpeed, score) {
    const safeSpeed = Math.max(GAMEPLAY.initialSpeed, worldSpeed);
    const movement = safeSpeed * deltaSeconds;

    this.routes.forEach((route) => {
      route.previousX = route.x;
      route.x -= movement;
      route.container.setX(route.x);
    });

    this.updatePlayerSupport();
    this.updateRouteProgress();

    const remainingRoutes = [];
    this.routes.forEach((route) => {
      if (route.x + route.pattern.width < ROUTE_DESTROY_X) {
        if (this.supportContact?.routeId === route.id) {
          this.forceReleaseSupport();
        }
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
      this.lastPlayerFeetY = this.getPlayerFeetY();
      return;
    }

    this.distanceUntilNextRoute -= movement;
    if (this.distanceUntilNextRoute <= 0) {
      if (this.canSpawnRoute()) {
        this.spawnRoute(this.selectPattern(score, safeSpeed));
      } else {
        this.distanceUntilNextRoute = safeSpeed * 0.9;
      }
    }

    this.lastPlayerFeetY = this.getPlayerFeetY();
  }

  selectPattern(score, worldSpeed) {
    const forceBundle = this.routesSinceBundle >= BUNDLE_PITY_LIMIT;
    const generation = generateProceduralRoute({
      seed: `${this.routeSeedBase}:${this.routeSerial + 1}:${Math.floor(score)}`,
      score,
      worldSpeed,
      isIsekaiWorld: this.scene.isIsekaiWorld || this.scene.isNeonWorld,
      performanceAdjustment: this.performanceAdjustment,
      forceBundle,
      recentSignatures: this.recentSignatures,
    });
    this.lastGeneration = generation;
    if (generation.pattern) {
      return generation.pattern;
    }

    let available = PLATFORM_ROUTE_PATTERNS.filter(
      (pattern) => pattern.unlockScore <= score && pattern.id !== this.lastPatternId,
    );
    if (!available.length) {
      available = PLATFORM_ROUTE_PATTERNS.filter((pattern) => pattern.unlockScore <= score);
    }

    const bundlePattern = available.find((pattern) => pattern.bundle);
    if (bundlePattern && forceBundle) {
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
      previousX: ROUTE_START_X,
      pattern,
      container: this.createRouteVisual(pattern),
      entered: false,
      fell: false,
      completionAwarded: false,
    };
    route.container.setX(route.x);
    this.routes.push(route);
    this.lastPatternId = pattern.id;
    if (pattern.signature) {
      this.recentSignatures.push(pattern.signature);
      this.recentSignatures = this.recentSignatures.slice(-5);
    }
    this.distanceUntilNextRoute = Number.POSITIVE_INFINITY;

    if (pattern.bundle) {
      this.routesSinceBundle = 0;
    } else {
      this.routesSinceBundle += 1;
    }

    this.spawnRewards(route);
    this.spawnHazards(route);
    this.reserveObstacleGap(pattern.width + ROUTE_TRAILING_CLEARANCE);
    return true;
  }

  createRouteVisual(pattern) {
    const container = this.scene.add.container(0, 0).setDepth(7);
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
    const isIsekai = this.scene.isIsekaiWorld;
    const isNeon = this.scene.isNeonWorld;
    const fillColor = isNeon ? 0x17384f : isIsekai ? 0x4b4567 : 0x4f7892;
    const undersideColor = isNeon ? 0x071323 : isIsekai ? 0x302b4a : 0x31566f;
    const edgeColor = isNeon ? 0x35f2df : isIsekai ? 0x8fffe0 : COLORS.cream;
    const accentColor = isNeon ? 0xff4fa3 : isIsekai ? 0xb9a5ff : COLORS.orange;

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
        if (isIsekai || isNeon) {
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

    if (pattern.source === 'procedural' && pattern.isLong) {
      const routeLabel = this.scene.add
        .text(70, Math.min(...pattern.segments.map((segment) => Math.min(segment.y1, segment.y2))) - 58, '高空路线', {
          fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
          fontSize: '13px',
          fontStyle: 'bold',
          color: '#fff7e3',
          backgroundColor: isNeon ? '#071323' : isIsekai ? '#493877' : '#173c59',
          padding: { x: 9, y: 5 },
        })
        .setOrigin(0.5)
        .setDepth(10);
      container.add(routeLabel);
    }

    if (pattern.bundle) {
      const bundleSegment = pattern.segments[pattern.bundle.segment];
      const bundleY = getSegmentSurfaceY(bundleSegment, pattern.bundle.x);
      const badge = this.scene.add
        .text(pattern.bundle.x, bundleY - 102, '★ 特殊道具大礼包', {
          fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
          fontSize: '15px',
          fontStyle: 'bold',
          color: '#fff7e3',
          stroke: isNeon ? '#071323' : isIsekai ? '#30234f' : '#173c59',
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
      const startX = run.startX ?? segment.x1 + run.inset;
      const endX = run.endX ?? segment.x2 - run.inset;
      const usableWidth = endX - startX;
      for (let index = 0; index < run.count; index += 1) {
        const progress = run.count === 1 ? 0.5 : index / (run.count - 1);
        const localX = startX + usableWidth * progress;
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

  spawnHazards(route) {
    route.pattern.hazards?.forEach((hazard) => {
      const segment = route.pattern.segments[hazard.segment];
      const surfaceY = getSegmentSurfaceY(segment, hazard.x);
      this.spawnRouteHazard?.(
        route.x + hazard.x,
        surfaceY,
        route.id,
        hazard.variant,
      );
    });
  }

  findSurfaceAtPlayer(preferredContact = null) {
    const playerX = this.player.x;
    const playerFeetY = this.getPlayerFeetY();
    const candidates = [];
    this.routes.forEach((route) => {
      const localX = playerX - route.x;
      const previousLocalX = playerX - (route.previousX ?? route.x);
      route.pattern.segments.forEach((segment, segmentIndex) => {
        if (localX >= segment.x1 - 2 && localX <= segment.x2 + 2) {
          const wasOverSegment =
            previousLocalX >= segment.x1 - 2 &&
            previousLocalX <= segment.x2 + 2;
          candidates.push({
            route,
            segment,
            segmentIndex,
            y: getSegmentSurfaceY(segment, localX),
            previousY: wasOverSegment
              ? getSegmentSurfaceY(segment, previousLocalX)
              : null,
          });
        }
      });
    });

    return chooseSurfaceCandidate(
      candidates,
      playerFeetY,
      preferredContact,
    );
  }

  updatePlayerSupport() {
    const wasSupported = this.supported;
    const previousContact = this.supportContact;
    if (!this.player?.active || !this.player.body?.enable) {
      this.forceReleaseSupport();
      return;
    }

    const candidate = this.findSurfaceAtPlayer(previousContact);
    if (!candidate) {
      const canBridgeBriefSurfaceMiss = canBridgeSurfaceMiss({
        wasSupported,
        velocityY: this.player.body.velocity.y,
        missFrames: this.supportMissFrames,
      });
      if (canBridgeBriefSurfaceMiss) {
        this.supportMissFrames += 1;
        this.player.setVelocityY(0);
        this.player.body.allowGravity = false;
        return;
      }
      this.forceReleaseSupport();
      return;
    }

    this.supportMissFrames = 0;
    const surfaceY = candidate.y;
    const currentFeetY = this.getPlayerFeetY();
    const velocityY = this.player.body.velocity.y;
    const groundContact =
      this.player.body.blocked.down || this.player.body.touching.down;
    const landedFromAbove = didLandOnSurface({
      velocityY,
      lastFeetY: this.lastPlayerFeetY,
      currentFeetY,
      previousSurfaceY: candidate.previousY,
      surfaceY,
      approachTolerance: LANDING_APPROACH_TOLERANCE,
      contactEpsilon: LANDING_CONTACT_EPSILON,
    });
    const followsExistingSurface = canFollowSupportedSurface({
      wasSupported,
      previousContact,
      candidate,
      velocityY,
      currentFeetY,
      surfaceY,
      maxDistance: RAMP_STEP_TOLERANCE + 8,
    });
    const entersRampFromGround =
      groundContact &&
      velocityY >= 0 &&
      surfaceY <= currentFeetY + 5 &&
      currentFeetY - surfaceY <= RAMP_STEP_TOLERANCE;

    if (!landedFromAbove && !followsExistingSurface && !entersRampFromGround) {
      if (wasSupported) {
        this.forceReleaseSupport();
      }
      return;
    }

    // The sprite origin is at its feet. Pin the rendered feet directly to the
    // surface and pause gravity while supported so Arcade Physics cannot pull
    // the body down and force a visible correction on every frame.
    this.player.setY(surfaceY);
    this.player.setVelocityY(0);
    this.player.body.allowGravity = false;
    this.player.body.updateFromGameObject();
    this.supported = true;
    this.supportY = surfaceY;
    this.supportContact = {
      routeId: candidate.route.id,
      segmentIndex: candidate.segmentIndex,
    };
    candidate.route.entered = true;

    if (!wasSupported) {
      this.onLand?.(this.player.x, surfaceY, candidate.route.pattern.label);
    }
  }

  getPlayerFeetY() {
    return this.player?.body?.bottom ?? this.player?.y ?? GAMEPLAY.groundY;
  }

  updateRouteProgress() {
    const groundContact =
      this.player.body.blocked.down || this.player.body.touching.down;
    this.routes.forEach((route) => {
      if (!route.entered || route.fell || route.completionAwarded) {
        return;
      }
      const localX = this.player.x - route.x;
      if (localX >= route.pattern.width - 125) {
        route.completionAwarded = true;
        const points = route.pattern.isLong
          ? Math.round(50 + route.pattern.difficulty * 50)
          : Math.round(20 + (route.pattern.difficulty ?? 0.4) * 30);
        this.performanceAdjustment = Phaser.Math.Clamp(
          this.performanceAdjustment + 0.035,
          -0.12,
          0.12,
        );
        this.onRouteComplete?.(points, route.pattern);
      } else if (
        localX > 70 &&
        groundContact &&
        !this.supported
      ) {
        route.fell = true;
        this.performanceAdjustment = Phaser.Math.Clamp(
          this.performanceAdjustment - 0.045,
          -0.12,
          0.12,
        );
      }
    });
  }

  isPlayerSupported() {
    return this.supported;
  }

  getSupportY() {
    return this.supported ? this.supportY : GAMEPLAY.groundY;
  }

  forceReleaseSupport() {
    this.supported = false;
    this.supportY = GAMEPLAY.groundY;
    this.supportContact = null;
    this.supportMissFrames = 0;
    if (this.player?.body) {
      this.player.body.allowGravity = true;
    }
    this.lastPlayerFeetY = this.getPlayerFeetY();
  }

  blocksIndependentPickups() {
    return this.routes.length > 0;
  }

  clearForTransition() {
    this.routes.forEach((route) => route.container.destroy(true));
    this.routes = [];
    this.forceReleaseSupport();
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
