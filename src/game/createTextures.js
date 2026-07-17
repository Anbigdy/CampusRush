import { COLORS } from './constants.js';

function createGraphics(scene) {
  return scene.make.graphics({ x: 0, y: 0, add: false });
}

function saveTexture(scene, key, width, height, draw) {
  if (scene.textures.exists(key)) {
    return;
  }

  const graphics = createGraphics(scene);
  draw(graphics);
  graphics.generateTexture(key, width, height);
  graphics.destroy();
}

function drawCloud(graphics, x, y, scale = 1) {
  graphics.fillStyle(COLORS.white, 0.72);
  graphics.fillCircle(x, y, 18 * scale);
  graphics.fillCircle(x + 20 * scale, y - 8 * scale, 23 * scale);
  graphics.fillCircle(x + 46 * scale, y, 17 * scale);
  graphics.fillRoundedRect(x - 4 * scale, y, 58 * scale, 16 * scale, 8 * scale);
}

function drawTree(graphics, x, groundY, scale = 1) {
  graphics.fillStyle(0x8d6748, 1);
  graphics.fillRoundedRect(x - 5 * scale, groundY - 58 * scale, 10 * scale, 58 * scale, 4);
  graphics.fillStyle(COLORS.grassDark, 1);
  graphics.fillCircle(x - 14 * scale, groundY - 67 * scale, 23 * scale);
  graphics.fillCircle(x + 13 * scale, groundY - 74 * scale, 25 * scale);
  graphics.fillCircle(x + 2 * scale, groundY - 91 * scale, 24 * scale);
  graphics.fillStyle(COLORS.grass, 1);
  graphics.fillCircle(x - 3 * scale, groundY - 80 * scale, 21 * scale);
}

export function createGameTextures(scene) {
  saveTexture(scene, 'player-student', 44, 58, (graphics) => {
    graphics.fillStyle(0x2d4059, 1);
    graphics.fillRoundedRect(10, 2, 24, 22, 10);
    graphics.fillStyle(0xf2c7a5, 1);
    graphics.fillCircle(22, 16, 10);
    graphics.fillStyle(0x26384d, 1);
    graphics.fillRoundedRect(12, 5, 20, 7, 4);
    graphics.fillStyle(COLORS.cream, 1);
    graphics.fillRoundedRect(8, 23, 28, 23, 7);
    graphics.fillStyle(COLORS.navy, 1);
    graphics.fillRoundedRect(9, 28, 7, 17, 3);
    graphics.fillStyle(COLORS.coral, 1);
    graphics.fillTriangle(19, 24, 27, 24, 23, 38);
    graphics.fillStyle(0x355b89, 1);
    graphics.fillRoundedRect(10, 44, 10, 13, 3);
    graphics.fillRoundedRect(25, 44, 10, 13, 3);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRoundedRect(7, 53, 14, 5, 2);
    graphics.fillRoundedRect(24, 53, 14, 5, 2);
  });

  saveTexture(scene, 'obstacle-backpack', 52, 44, (graphics) => {
    graphics.lineStyle(5, 0x6c4733, 1);
    graphics.strokeRoundedRect(15, 2, 22, 19, 9);
    graphics.fillStyle(COLORS.orange, 1);
    graphics.fillRoundedRect(5, 10, 42, 34, 9);
    graphics.fillStyle(0xe9852f, 1);
    graphics.fillRoundedRect(11, 27, 30, 11, 5);
    graphics.fillStyle(COLORS.cream, 1);
    graphics.fillRoundedRect(22, 13, 8, 15, 3);
  });

  saveTexture(scene, 'obstacle-barricade', 62, 68, (graphics) => {
    graphics.fillStyle(0x596777, 1);
    graphics.fillRoundedRect(8, 15, 7, 53, 3);
    graphics.fillRoundedRect(47, 15, 7, 53, 3);
    graphics.fillStyle(COLORS.white, 1);
    graphics.fillRoundedRect(1, 8, 60, 25, 5);
    graphics.fillStyle(COLORS.coral, 1);
    graphics.fillTriangle(3, 29, 18, 8, 31, 8);
    graphics.fillTriangle(31, 33, 46, 8, 60, 8);
    graphics.fillStyle(0x3b4b5b, 1);
    graphics.fillRoundedRect(0, 62, 22, 6, 3);
    graphics.fillRoundedRect(40, 62, 22, 6, 3);
  });

  saveTexture(scene, 'obstacle-puddle', 82, 18, (graphics) => {
    graphics.fillStyle(0x2e9cca, 0.92);
    graphics.fillEllipse(41, 11, 80, 14);
    graphics.fillStyle(0x8de2f5, 0.9);
    graphics.fillEllipse(31, 8, 28, 5);
    graphics.fillEllipse(60, 12, 22, 4);
  });

  saveTexture(scene, 'ground-tile', 160, 90, (graphics) => {
    graphics.fillStyle(COLORS.grass, 1);
    graphics.fillRect(0, 0, 160, 13);
    graphics.fillStyle(COLORS.grassDark, 1);
    for (let x = 4; x < 160; x += 18) {
      graphics.fillTriangle(x, 13, x + 6, 2, x + 10, 13);
    }
    graphics.fillStyle(COLORS.pavement, 1);
    graphics.fillRect(0, 13, 160, 77);
    graphics.lineStyle(2, COLORS.pavementDark, 0.6);
    graphics.lineBetween(0, 49, 160, 49);
    graphics.lineBetween(45, 13, 35, 90);
    graphics.lineBetween(120, 13, 132, 90);
  });

  saveTexture(scene, 'far-scenery', 480, 210, (graphics) => {
    drawCloud(graphics, 48, 38, 0.72);
    drawCloud(graphics, 310, 70, 0.54);
    graphics.fillStyle(0x70adc3, 0.62);
    graphics.fillTriangle(0, 210, 112, 74, 235, 210);
    graphics.fillTriangle(150, 210, 292, 52, 430, 210);
    graphics.fillTriangle(335, 210, 425, 94, 480, 210);
    graphics.fillStyle(0x5e9fb6, 0.44);
    graphics.fillTriangle(40, 210, 188, 100, 320, 210);
  });

  saveTexture(scene, 'campus-scenery', 480, 250, (graphics) => {
    graphics.fillStyle(0xf3d8a7, 1);
    graphics.fillRoundedRect(34, 67, 210, 183, 8);
    graphics.fillStyle(0xd65f58, 1);
    graphics.fillTriangle(20, 70, 139, 7, 258, 70);
    graphics.fillStyle(0xf9ebca, 1);
    graphics.fillRoundedRect(108, 102, 62, 148, 5);
    graphics.fillStyle(0x5d90ad, 1);
    for (let row = 0; row < 3; row += 1) {
      for (let column = 0; column < 4; column += 1) {
        graphics.fillRoundedRect(51 + column * 45, 94 + row * 42, 25, 28, 3);
      }
    }
    graphics.fillStyle(COLORS.navy, 1);
    graphics.fillRoundedRect(124, 185, 30, 65, 4);
    drawTree(graphics, 300, 250, 0.9);
    drawTree(graphics, 407, 250, 0.74);
    graphics.lineStyle(5, 0xffffff, 0.85);
    graphics.lineBetween(245, 225, 480, 225);
    for (let x = 255; x < 480; x += 38) {
      graphics.lineBetween(x, 207, x, 250);
    }
  });
}
