import Phaser from 'phaser';
import { COLORS, GAMEPLAY } from './constants.js';
import {
  PICKUP_TRAILING_GAP,
  createJumpArcCoinPattern,
} from './pickupPatterns.js';
import {
  decoratePickup,
  updatePickupPresentation,
} from './gameplayPresentation.js';
import { selectBlindBoxOutcome } from './blindBox.js';
import { HAJIMI_ASSETS } from './hajimiAssets.js';
import { PICKUP_SPAWN_TIMING } from './pickupSpawn.js';
import { playHakimiMeow } from './snowPeakAudio.js';
import { isSoundEnabled, playSound } from './soundEffects.js';

export const POWER_UPS = Object.freeze({
  shield: Object.freeze({
    id: 'shield',
    texture: 'pickup-shield',
    label: '校徽护盾',
    shortLabel: '护盾',
    duration: Number.POSITIVE_INFINITY,
    color: 0x4ca7d8,
  }),
  rush: Object.freeze({
    id: 'rush',
    texture: 'pickup-rush',
    label: '早八咖啡',
    shortLabel: '冲刺',
    duration: 5,
    color: 0xff8b3d,
  }),
  magnet: Object.freeze({
    id: 'magnet',
    texture: 'pickup-magnet',
    label: '磁力学生卡',
    shortLabel: '磁力',
    duration: 8,
    color: 0x35b98c,
  }),
  doubleScore: Object.freeze({
    id: 'doubleScore',
    texture: 'pickup-double-score',
    label: '双倍学分',
    shortLabel: '双倍',
    duration: 10,
    color: 0x9b6bd1,
  }),
  blindBox: Object.freeze({
    id: 'blindBox',
    texture: 'pickup-blind-box',
    label: '校园盲盒',
    shortLabel: '盲盒',
    color: 0xf15f5f,
  }),
});

const ACTIVE_EFFECT_ORDER = Object.freeze([
  'shield',
  'rush',
  'magnet',
  'doubleScore',
]);
const PICKUP_ORDER = Object.freeze([...ACTIVE_EFFECT_ORDER, 'blindBox']);
const TIMED_REWARD_IDS = Object.freeze(['rush', 'magnet', 'doubleScore']);

const FONT_FAMILY = 'Arial, "Microsoft YaHei", sans-serif';
const COIN_VALUE = 10;
const MAGNET_RADIUS = 220;

export class PowerUpManager {
  constructor(scene, {
    player,
    addScore,
    isSpawnSafe,
    reserveObstacleGap,
    initialState,
  }) {
    this.scene = scene;
    this.player = player;
    this.addScore = addScore;
    this.isSpawnSafe = isSpawnSafe;
    this.reserveObstacleGap = reserveObstacleGap;
    this.activeEffects = new Map();
    this.rushGraceRemaining = 0;
    this.invalidCoinRemaining = 0;
    this.skillSpawnRemaining = PICKUP_SPAWN_TIMING.initial;
    this.coinSpawnRemaining = 2.4;

    this.skillPickups = scene.physics.add.group({
      allowGravity: false,
      immovable: true,
    });
    this.coins = scene.physics.add.group({ allowGravity: false });

    scene.physics.add.overlap(
      player,
      this.skillPickups,
      this.collectSkill,
      undefined,
      this,
    );
    scene.physics.add.overlap(
      player,
      this.coins,
      this.collectCoin,
      undefined,
      this,
    );

    this.createHud();
    this.createPlayerEffects();
    this.restoreState(initialState);
  }

  createHud() {
    this.hudEntries = new Map();

    ACTIVE_EFFECT_ORDER.forEach((id) => {
      const definition = POWER_UPS[id];
      const background = this.scene.add
        .rectangle(0, 0, 96, 28, COLORS.navyDark, 0.9)
        .setStrokeStyle(2, definition.color, 1);
      const label = this.scene.add
        .text(0, -2, '', {
          fontFamily: FONT_FAMILY,
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#fff7e3',
        })
        .setOrigin(0.5);
      const progress = this.scene.add
        .rectangle(-44, 12, 88, 3, definition.color, 1)
        .setOrigin(0, 0.5);
      const container = this.scene.add
        .container(0, 0, [background, label, progress])
        .setDepth(50)
        .setVisible(false);

      this.hudEntries.set(id, { container, label, progress });
    });

    const toastBackground = this.scene.add
      .rectangle(0, 0, 410, 38, COLORS.navyDark, 0.9)
      .setStrokeStyle(2, COLORS.cream, 0.9);
    this.toastText = this.scene.add
      .text(0, 0, '', {
        fontFamily: FONT_FAMILY,
        fontSize: '16px',
        fontStyle: 'bold',
        color: '#fff7e3',
      })
      .setOrigin(0.5);
    this.toast = this.scene.add
      .container(GAMEPLAY.width / 2, 108, [toastBackground, this.toastText])
      .setDepth(55)
      .setAlpha(0);
  }

  createPlayerEffects() {
    this.shieldAura = this.scene.add
      .circle(0, 0, 43, 0x64c7ef, 0.12)
      .setStrokeStyle(3, 0xb8ecff, 0.9)
      .setDepth(7)
      .setVisible(false);
    this.rushGlow = this.scene.add
      .ellipse(0, 0, 84, 66, 0xffa640, 0.18)
      .setStrokeStyle(2, 0xffe3a1, 0.72)
      .setDepth(7)
      .setVisible(false);
    this.rushTrails = [0, 1, 2].map((index) =>
      this.scene.add
        .rectangle(0, 0, 24 + index * 12, 4, 0xffd56b, 0.76 - index * 0.16)
        .setOrigin(1, 0.5)
        .setDepth(7)
        .setVisible(false),
    );
  }

  updateTimers(deltaSeconds) {
    this.rushGraceRemaining = Math.max(
      0,
      this.rushGraceRemaining - deltaSeconds,
    );

    const expired = [];
    this.activeEffects.forEach((remaining, id) => {
      if (!Number.isFinite(remaining)) {
        return;
      }
      const nextRemaining = remaining - deltaSeconds;
      if (nextRemaining <= 0) {
        expired.push(id);
      } else {
        this.activeEffects.set(id, nextRemaining);
      }
    });

    expired.forEach((id) => {
      this.activeEffects.delete(id);
      if (id === 'rush') {
        this.rushGraceRemaining = 0.4;
      }
    });

    this.updateHud();
    this.updatePlayerEffects();
  }

  updatePickups(deltaSeconds, worldSpeed) {
    this.skillSpawnRemaining -= deltaSeconds;
    this.coinSpawnRemaining -= deltaSeconds;

    if (this.skillSpawnRemaining <= 0) {
      if (this.isSpawnSafe() && this.isPickupEntryClear()) {
        this.spawnSkill();
        this.skillSpawnRemaining = Phaser.Math.FloatBetween(
          PICKUP_SPAWN_TIMING.min,
          PICKUP_SPAWN_TIMING.max,
        );
      } else {
        this.skillSpawnRemaining = 1;
      }
    }

    if (this.coinSpawnRemaining <= 0) {
      if (this.isSpawnSafe() && this.isPickupEntryClear()) {
        this.spawnCoinCluster(worldSpeed);
        this.coinSpawnRemaining = Phaser.Math.FloatBetween(3, 5);
      } else {
        this.coinSpawnRemaining = 0.8;
      }
    }

    this.skillPickups.children.iterate((pickup) => {
      if (!pickup?.active) {
        return;
      }
      updatePickupPresentation(pickup, this.scene.time.now);
      pickup.setVelocityX(-worldSpeed);
      if (pickup.x < -70) {
        pickup.destroy();
      }
    });

    const magnetActive = this.isActive('magnet');
    this.coins.children.iterate((coin) => {
      if (!coin?.active) {
        return;
      }

      updatePickupPresentation(coin, this.scene.time.now);

      const distance = Phaser.Math.Distance.Between(
        coin.x,
        coin.y,
        this.player.x,
        this.player.y - this.player.displayHeight / 2,
      );
      if (magnetActive && distance <= MAGNET_RADIUS) {
        this.scene.physics.moveToObject(coin, this.player, 620);
      } else {
        coin.setVelocity(-worldSpeed, 0);
      }

      if (coin.x < -50 || coin.y > GAMEPLAY.height + 50) {
        coin.destroy();
      }
    });
  }

  isPickupEntryClear() {
    const entryX = GAMEPLAY.width - 170;
    let isClear = true;

    [this.skillPickups, this.coins].forEach((group) => {
      group.children.iterate((pickup) => {
        if (pickup?.active && pickup.x > entryX) {
          isClear = false;
        }
      });
    });

    return isClear;
  }

  spawnSkill() {
    const id = Phaser.Utils.Array.GetRandom(PICKUP_ORDER);
    const definition = POWER_UPS[id];
    const pickup = this.skillPickups.create(
      GAMEPLAY.width + 36,
      GAMEPLAY.groundY - 43,
      definition.texture,
    );
    pickup.setDepth(9);
    pickup.setData('powerUpId', id);
    pickup.body.setCircle(20, 3, 3);
    decoratePickup(this.scene, pickup, { color: definition.color });
    this.reserveObstacleGap(PICKUP_TRAILING_GAP);

    this.scene.tweens.add({
      targets: pickup,
      scale: 1.12,
      duration: 420,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
  }

  spawnCoinCluster(worldSpeed) {
    const pattern = createJumpArcCoinPattern(worldSpeed);
    const startX = GAMEPLAY.width + 28;
    const clusterId = this.scene.time.now;

    pattern.forEach(({ time, xOffset, y }) => {
      const coin = this.createCoin(startX + xOffset, y);
      coin.setData('clusterId', clusterId);
      coin.setData('jumpTime', time);
    });

    const arcWidth = pattern.at(-1)?.xOffset ?? 0;
    this.reserveObstacleGap(arcWidth + PICKUP_TRAILING_GAP);
  }

  createCoin(x, y) {
    const coin = this.coins.create(x, y, 'pickup-coin');
    coin.setDepth(9);
    coin.body.setCircle(13, 2, 2);
    decoratePickup(this.scene, coin, { color: 0xffc83d, kind: 'coin' });
    this.scene.tweens.add({
      targets: coin,
      scaleX: 0.72,
      duration: 260,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
    return coin;
  }

  spawnRouteCoin(x, y, routeId) {
    const coin = this.createCoin(x, y);
    coin.setData('routeId', routeId);
    coin.setData('routeReward', true);
    return coin;
  }

  spawnRewardBundle(x, y, routeId) {
    const pickup = this.skillPickups.create(x, y, 'pickup-bundle');
    pickup.setDepth(10);
    pickup.setData('rewardBundle', true);
    pickup.setData('routeId', routeId);
    pickup.setData('routeReward', true);
    pickup.body.setCircle(25, 4, 4);
    decoratePickup(this.scene, pickup, {
      color: 0xffa640,
      kind: 'bundle',
    });
    this.scene.tweens.add({
      targets: pickup,
      scale: 1.13,
      angle: 3,
      duration: 480,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.InOut',
    });
    return pickup;
  }

  collectSkill(_player, pickup) {
    if (!pickup?.active) {
      return;
    }

    const isRewardBundle = pickup.getData('rewardBundle');
    const id = pickup.getData('powerUpId');
    pickup.destroy();
    if (isRewardBundle) {
      playSound(this.scene, 'bundle');
      this.activateRewardBundle();
    } else {
      playSound(this.scene, 'powerUp');
      this.activate(id);
    }
  }

  collectCoin(_player, coin) {
    if (!coin?.active) {
      return;
    }

    const x = coin.x;
    const y = coin.y;
    coin.destroy();
    playSound(this.scene, 'coin');
    if (this.invalidCoinRemaining > 0) {
      this.invalidCoinRemaining -= 1;
      this.showScorePopup(x, y, '校园卡欠费', '#ff7b72');
      return;
    }
    const points = COIN_VALUE * this.getScoreMultiplier();
    this.addScore(points, x, y, `+${points}`);
  }

  activate(id) {
    if (id === 'blindBox') {
      this.openBlindBox();
      return;
    }

    const definition = POWER_UPS[id];
    if (!definition) {
      return;
    }

    this.activeEffects.set(id, definition.duration);
    if (id === 'rush') {
      this.rushGraceRemaining = 0;
    }
    this.showToast(`获得：${definition.label}`);
    this.updateHud();
    this.updatePlayerEffects();
  }

  activateRewardBundle() {
    const bonusPool = Phaser.Utils.Array.Shuffle([
      ...TIMED_REWARD_IDS,
    ]).slice(0, 2);
    const rewardIds = ['shield', ...bonusPool];
    rewardIds.forEach((id) => {
      this.activeEffects.set(id, POWER_UPS[id].duration);
    });
    if (bonusPool.includes('rush')) {
      this.rushGraceRemaining = 0;
    }

    const points = 50 * this.getScoreMultiplier();
    this.addScore(points, this.player.x, this.player.y - 90, `礼包 +${points}`);
    const rewardNames = bonusPool.map((id) => POWER_UPS[id].shortLabel).join(' + ');
    this.showToast(`大礼包：永久护盾 + ${rewardNames} · +${points}`);
    this.updateHud();
    this.updatePlayerEffects();
  }

  openBlindBox() {
    const outcome = selectBlindBoxOutcome();

    if (outcome === 'hakimi') {
      this.showHajimiReveal();
      this.showToast('盲盒：哈基米！');
      return;
    }

    if (outcome === 'score') {
      const points = 60 * this.getScoreMultiplier();
      this.addScore(points, this.player.x, this.player.y - 86, `盲盒 +${points}`);
      this.showToast(`盲盒：奖学金到账 +${points}`);
      return;
    }

    if (outcome === 'skill') {
      const rewardId = Phaser.Utils.Array.GetRandom(TIMED_REWARD_IDS);
      const reward = POWER_UPS[rewardId];
      this.activeEffects.set(rewardId, reward.duration);
      if (rewardId === 'rush') {
        this.rushGraceRemaining = 0;
      }
      this.showToast(`盲盒：获得${reward.label}`);
      this.updateHud();
      this.updatePlayerEffects();
      return;
    }

    if (outcome === 'debt') {
      this.invalidCoinRemaining += 5;
      this.showToast('盲盒：校园卡欠费，接下来 5 枚金币无效');
      return;
    }

    this.showToast('盲盒：谢谢参与');
  }

  showHajimiReveal() {
    this.clearHajimiReveal();
    const texture = Phaser.Utils.Array.GetRandom(HAJIMI_ASSETS).key;
    const centerX = GAMEPLAY.width / 2;
    const centerY = GAMEPLAY.height / 2;
    const shadow = this.scene.add
      .rectangle(10, 12, 326, 326, COLORS.navyDark, 0.38)
      .setStrokeStyle(0);
    const panel = this.scene.add
      .rectangle(0, 0, 326, 326, COLORS.cream, 1)
      .setStrokeStyle(7, 0xffd45f, 1);
    const image = this.scene.add
      .image(0, 0, texture)
      .setDisplaySize(300, 300);
    const label = this.scene.add
      .text(0, 188, '哈基米！', {
        fontFamily: FONT_FAMILY,
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#fff7e3',
        stroke: '#173c59',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.hajimiReveal = this.scene.add
      .container(centerX, centerY, [
        shadow,
        panel,
        image,
        label,
      ])
      .setDepth(120)
      .setScale(0.18)
      .setAngle(-7)
      .setAlpha(0);

    playHakimiMeow(this.scene, isSoundEnabled());
    this.scene.tweens.add({
      targets: this.hajimiReveal,
      scaleX: 1,
      scaleY: 1,
      angle: 4,
      alpha: 1,
      duration: 360,
      ease: 'Back.Out',
      onComplete: () => {
        if (!this.hajimiReveal) {
          return;
        }
        this.scene.tweens.add({
          targets: this.hajimiReveal,
          scaleX: 1.18,
          scaleY: 1.18,
          angle: -3,
          alpha: 0,
          delay: 720,
          duration: 460,
          ease: 'Sine.In',
          onComplete: () => this.clearHajimiReveal(),
        });
      },
    });
  }

  clearHajimiReveal() {
    if (!this.hajimiReveal) {
      return;
    }
    this.scene.tweens.killTweensOf(this.hajimiReveal);
    this.hajimiReveal.destroy(true);
    this.hajimiReveal = null;
  }

  showToast(message) {
    this.scene.tweens.killTweensOf(this.toast);
    this.toastText.setText(message);
    this.toast.setPosition(GAMEPLAY.width / 2, 108).setAlpha(1);
    this.scene.tweens.add({
      targets: this.toast,
      y: 94,
      alpha: 0,
      delay: 850,
      duration: 280,
      ease: 'Sine.In',
    });
  }

  showScorePopup(x, y, text, color = '#ffd166') {
    const popup = this.scene.add
      .text(x, y, text, {
        fontFamily: FONT_FAMILY,
        fontSize: '18px',
        fontStyle: 'bold',
        color,
        stroke: '#173c59',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(60);

    this.scene.tweens.add({
      targets: popup,
      y: y - 42,
      alpha: 0,
      duration: 720,
      ease: 'Sine.Out',
      onComplete: () => popup.destroy(),
    });
  }

  updateHud() {
    const visibleIds = ACTIVE_EFFECT_ORDER.filter((id) => this.isActive(id));
    this.hudEntries.forEach(({ container }) => container.setVisible(false));

    visibleIds.forEach((id, index) => {
      const definition = POWER_UPS[id];
      const entry = this.hudEntries.get(id);
      const row = Math.floor(index / 3);
      const rowStart = row * 3;
      const itemsInRow = Math.min(3, visibleIds.length - rowStart);
      const column = index - rowStart;
      const totalWidth = itemsInRow * 96 + (itemsInRow - 1) * 7;
      const x =
        GAMEPLAY.width / 2 - totalWidth / 2 + 48 + column * (96 + 7);
      const y = 22 + row * 34;
      const remaining = this.activeEffects.get(id);
      const isPermanent = !Number.isFinite(remaining);

      entry.container.setPosition(x, y).setVisible(true);
      entry.label.setText(
        isPermanent
          ? `${definition.shortLabel} 待命`
          : `${definition.shortLabel} ${remaining.toFixed(1)}`,
      );
      entry.progress.setDisplaySize(
        isPermanent
          ? 88
          : Math.max(1, 88 * (remaining / definition.duration)),
        3,
      );
      entry.container.setAlpha(
        !isPermanent && remaining <= 2 && Math.floor(remaining * 6) % 2
          ? 0.48
          : 1,
      );
    });
  }

  updatePlayerEffects() {
    const centerY = this.player.y - this.player.displayHeight / 2;
    const shieldActive = this.isActive('shield');
    const rushActive = this.isActive('rush');

    this.shieldAura
      .setPosition(this.player.x, centerY)
      .setVisible(shieldActive);
    if (shieldActive) {
      const pulse = 1 + Math.sin(this.scene.time.now / 150) * 0.035;
      this.shieldAura.setScale(pulse);
    }

    this.rushGlow
      .setPosition(this.player.x, centerY)
      .setVisible(rushActive);
    this.rushTrails.forEach((trail, index) => {
      trail
        .setVisible(rushActive)
        .setPosition(
          this.player.x - 30 - index * 18,
          centerY - 18 + index * 18,
        );
    });

    this.player.anims.timeScale = rushActive ? 1.55 : 1;
  }

  isActive(id) {
    return (this.activeEffects.get(id) ?? 0) > 0;
  }

  getWorldSpeedMultiplier(worldSpeed = GAMEPLAY.initialSpeed) {
    if (this.isActive('rush')) {
      return Math.min(1.4, GAMEPLAY.rushMaxSpeed / worldSpeed);
    }
    return 1;
  }

  getScoreMultiplier() {
    return this.isActive('doubleScore') ? 2 : 1;
  }

  isRushProtected() {
    return this.isActive('rush') || this.rushGraceRemaining > 0;
  }

  consumeShield() {
    if (!this.isActive('shield')) {
      return false;
    }

    this.activeEffects.delete('shield');
    this.showToast('护盾挡下障碍！');
    this.updateHud();
    this.updatePlayerEffects();
    return true;
  }

  getTransitionState() {
    return {
      activeEffects: [...this.activeEffects.entries()],
      rushGraceRemaining: this.rushGraceRemaining,
      invalidCoinRemaining: this.invalidCoinRemaining,
      skillSpawnRemaining: this.skillSpawnRemaining,
      coinSpawnRemaining: this.coinSpawnRemaining,
    };
  }

  restoreState(state) {
    if (!state) {
      return;
    }
    this.activeEffects = new Map(
      (state.activeEffects ?? []).filter(
        ([id, remaining]) =>
          ACTIVE_EFFECT_ORDER.includes(id) && remaining > 0,
      ),
    );
    this.rushGraceRemaining = Math.max(0, state.rushGraceRemaining ?? 0);
    this.invalidCoinRemaining = Math.max(0, state.invalidCoinRemaining ?? 0);
    this.skillSpawnRemaining = Math.max(
      0.8,
      state.skillSpawnRemaining ?? PICKUP_SPAWN_TIMING.initial,
    );
    this.coinSpawnRemaining = Math.max(0.5, state.coinSpawnRemaining ?? 2.4);
    this.updateHud();
    this.updatePlayerEffects();
  }

  stop() {
    this.activeEffects.clear();
    this.rushGraceRemaining = 0;
    this.invalidCoinRemaining = 0;
    this.clearHajimiReveal();
    this.player.anims.timeScale = 1;
    this.updateHud();
    this.updatePlayerEffects();
  }

  clearForTransition({ preserveEffects = false } = {}) {
    if (!preserveEffects) {
      this.stop();
    }
    [this.skillPickups, this.coins].forEach((group) => {
      group.getChildren().forEach((pickup) => {
        this.scene.tweens.killTweensOf(pickup);
      });
      group.clear(true, true);
    });
    this.toast.setAlpha(0);
    this.clearHajimiReveal();
  }
}
