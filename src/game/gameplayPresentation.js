import Phaser from 'phaser';

const ACTION_STYLES = Object.freeze({
  jump: Object.freeze({ label: '↑', color: 0xff6f61 }),
  doubleJump: Object.freeze({ label: '↑↑', color: 0xff9f43 }),
  crouch: Object.freeze({ label: '↓', color: 0xa66de0 }),
  either: Object.freeze({ label: '↕', color: 0xf4c95d }),
});

const OBSTACLE_PRESENTATION_KEY = 'obstaclePresentation';
const PICKUP_PRESENTATION_KEY = 'pickupPresentation';

function destroyObjects(objects) {
  objects.forEach((object) => {
    if (object?.active) {
      object.destroy();
    }
  });
}

export function decorateObstacle(scene, obstacle, definition, surfaceY) {
  const style = ACTION_STYLES[definition.action] ?? ACTION_STYLES.jump;
  const dangerColor = scene.isIsekaiWorld ? 0xff5f9f : 0xff584d;
  const outline = scene.add
    .image(obstacle.x, obstacle.y, definition.key)
    .setDepth(obstacle.depth - 0.04)
    .setTintFill(dangerColor)
    .setAlpha(0.42)
    .setScale(1.13);
  const shadow = scene.add
    .ellipse(
      obstacle.x,
      surfaceY - 1,
      Math.max(38, definition.width * 0.9),
      definition.placement === 'air' ? 7 : 11,
      0x641c27,
      definition.placement === 'air' ? 0.14 : 0.3,
    )
    .setDepth(obstacle.depth - 0.08);
  const badgeBackground = scene.add
    .circle(
      0,
      0,
      definition.action === 'doubleJump' ? 15 : 13,
      0x14283a,
      0.94,
    )
    .setStrokeStyle(3, style.color, 1);
  const badgeText = scene.add
    .text(0, definition.action === 'doubleJump' ? -1 : 0, style.label, {
      fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
      fontSize: definition.action === 'doubleJump' ? '13px' : '18px',
      fontStyle: 'bold',
      color: '#fff7e3',
    })
    .setOrigin(0.5);
  const badge = scene.add
    .container(obstacle.x, obstacle.y, [badgeBackground, badgeText])
    .setDepth(obstacle.depth + 0.2);
  const presentation = {
    outline,
    shadow,
    badge,
    surfaceY,
    outlineAlpha: 0.42,
    shadowAlpha: definition.placement === 'air' ? 0.14 : 0.3,
  };

  obstacle.setData(OBSTACLE_PRESENTATION_KEY, presentation);
  obstacle.once(Phaser.GameObjects.Events.DESTROY, () => {
    destroyObjects([outline, shadow, badge]);
  });
  updateObstaclePresentation(obstacle);
  return presentation;
}

export function updateObstaclePresentation(obstacle) {
  const presentation = obstacle.getData(OBSTACLE_PRESENTATION_KEY);
  if (!presentation) {
    return;
  }

  const { outline, shadow, badge } = presentation;
  const obstacleAlpha = obstacle.alpha;
  outline
    .setPosition(obstacle.x, obstacle.y)
    .setAngle(obstacle.angle)
    .setScale(
      Math.abs(obstacle.scaleX) * 1.13,
      Math.abs(obstacle.scaleY) * 1.13,
    )
    .setAlpha(presentation.outlineAlpha * obstacleAlpha);
  shadow
    .setPosition(obstacle.x, presentation.surfaceY - 1)
    .setScale(Math.max(0.7, Math.abs(obstacle.scaleX)), 1)
    .setAlpha(presentation.shadowAlpha * obstacleAlpha);

  const visualTop = obstacle.y - obstacle.displayHeight / 2;
  badge
    .setPosition(obstacle.x, Math.max(142, visualTop - 18))
    .setAlpha(obstacleAlpha);
}

export function getObstaclePresentationObjects(obstacle) {
  const presentation = obstacle.getData(OBSTACLE_PRESENTATION_KEY);
  return presentation
    ? [presentation.outline, presentation.shadow, presentation.badge]
    : [];
}

export function decoratePickup(scene, pickup, { color, kind = 'skill' }) {
  const isBundle = kind === 'bundle';
  const isCoin = kind === 'coin';
  const radius = isBundle ? 38 : isCoin ? 18 : 30;
  const glow = scene.add
    .circle(pickup.x, pickup.y, radius, color, isCoin ? 0.12 : 0.17)
    .setStrokeStyle(isCoin ? 1.5 : 2.5, color, isCoin ? 0.6 : 0.9)
    .setDepth(pickup.depth - 0.35);
  const rays = isCoin
    ? null
    : scene.add
        .star(
          pickup.x,
          pickup.y,
          isBundle ? 8 : 4,
          radius * 0.68,
          radius,
          color,
          0.24,
        )
        .setDepth(pickup.depth - 0.42);
  const sparkles = isCoin
    ? []
    : [0, 1].map((index) =>
        scene.add
          .star(pickup.x, pickup.y, 4, 1.5, isBundle ? 5 : 4, 0xffffff, 0.9)
          .setDepth(pickup.depth + 0.1)
          .setAngle(index * 45),
      );
  const presentation = {
    glow,
    rays,
    sparkles,
    radius,
    kind,
    phase: (pickup.x * 0.017 + pickup.y * 0.023) % (Math.PI * 2),
  };

  pickup.setData(PICKUP_PRESENTATION_KEY, presentation);
  pickup.once(Phaser.GameObjects.Events.DESTROY, () => {
    destroyObjects([glow, rays, ...sparkles]);
  });
  updatePickupPresentation(pickup, scene.time.now);
  return presentation;
}

export function updatePickupPresentation(pickup, time) {
  const presentation = pickup.getData(PICKUP_PRESENTATION_KEY);
  if (!presentation) {
    return;
  }

  const seconds = time / 1000;
  const pulse =
    1 +
    Math.sin(seconds * 4.2 + presentation.phase) *
      (presentation.kind === 'coin' ? 0.07 : 0.11);
  presentation.glow
    .setPosition(pickup.x, pickup.y)
    .setScale(pulse)
    .setAlpha((presentation.kind === 'coin' ? 0.72 : 1) * pickup.alpha);
  if (presentation.rays) {
    presentation.rays
      .setPosition(pickup.x, pickup.y)
      .setAngle(seconds * (presentation.kind === 'bundle' ? 42 : 27))
      .setScale(1 + Math.sin(seconds * 3 + presentation.phase) * 0.08)
      .setAlpha(pickup.alpha);
  }
  presentation.sparkles.forEach((sparkle, index) => {
    const angle =
      seconds * (1.8 + index * 0.35) +
      presentation.phase +
      index * Math.PI;
    const orbit = presentation.radius * (index ? 0.72 : 0.9);
    sparkle
      .setPosition(
        pickup.x + Math.cos(angle) * orbit,
        pickup.y + Math.sin(angle) * orbit,
      )
      .setScale(0.82 + Math.sin(seconds * 5 + index) * 0.22)
      .setAlpha(
        (0.7 + Math.sin(seconds * 4 + index) * 0.25) * pickup.alpha,
      );
  });
}
