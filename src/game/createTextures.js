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

function drawCloud(graphics, x, y, scale = 1, alpha = 0.82) {
  graphics.fillStyle(COLORS.white, alpha);
  graphics.fillCircle(x, y, 18 * scale);
  graphics.fillCircle(x + 22 * scale, y - 10 * scale, 25 * scale);
  graphics.fillCircle(x + 50 * scale, y, 19 * scale);
  graphics.fillRoundedRect(x - 6 * scale, y, 67 * scale, 18 * scale, 9 * scale);
  graphics.fillStyle(0xd7f2fb, alpha * 0.55);
  graphics.fillEllipse(x + 27 * scale, y + 11 * scale, 52 * scale, 7 * scale);
}

function drawTree(graphics, x, groundY, scale = 1) {
  graphics.fillStyle(0x805f43, 1);
  graphics.fillRoundedRect(x - 5 * scale, groundY - 65 * scale, 10 * scale, 65 * scale, 4);
  graphics.fillStyle(0x347b4a, 1);
  graphics.fillCircle(x - 18 * scale, groundY - 73 * scale, 24 * scale);
  graphics.fillCircle(x + 16 * scale, groundY - 78 * scale, 27 * scale);
  graphics.fillCircle(x, groundY - 99 * scale, 27 * scale);
  graphics.fillStyle(0x65b965, 1);
  graphics.fillCircle(x - 4 * scale, groundY - 86 * scale, 23 * scale);
  graphics.fillStyle(0xa8db74, 0.86);
  graphics.fillCircle(x - 12 * scale, groundY - 97 * scale, 8 * scale);
}

function drawWindow(graphics, x, y, lit = false) {
  graphics.fillStyle(lit ? 0xffe39a : 0x74b6d2, 1);
  graphics.fillRoundedRect(x, y, 24, 30, 3);
  graphics.lineStyle(2, 0xeaf8ff, 0.8);
  graphics.lineBetween(x + 12, y + 1, x + 12, y + 29);
  graphics.lineBetween(x + 1, y + 15, x + 23, y + 15);
}

function drawStudent(graphics, pose) {
  const runForward = pose === 'run-forward';
  const jumping = pose === 'jump';

  graphics.fillStyle(0x284b68, 1);
  graphics.fillRoundedRect(5, 22, 17, 31, 7);
  graphics.fillStyle(0x1c344a, 1);
  graphics.fillRoundedRect(2, 28, 7, 20, 3);

  graphics.lineStyle(7, 0xf1bd98, 1);
  if (jumping) {
    graphics.lineBetween(20, 30, 10, 41);
    graphics.lineBetween(42, 30, 51, 39);
  } else if (runForward) {
    graphics.lineBetween(20, 30, 11, 43);
    graphics.lineBetween(42, 30, 51, 21);
  } else {
    graphics.lineBetween(20, 30, 11, 22);
    graphics.lineBetween(42, 30, 51, 43);
  }

  graphics.lineStyle(9, 0x315a86, 1);
  if (jumping) {
    graphics.lineBetween(26, 50, 19, 60);
    graphics.lineBetween(36, 50, 47, 58);
  } else if (runForward) {
    graphics.lineBetween(27, 49, 17, 64);
    graphics.lineBetween(36, 49, 48, 58);
  } else {
    graphics.lineBetween(27, 49, 14, 57);
    graphics.lineBetween(36, 49, 44, 65);
  }

  graphics.fillStyle(0xffffff, 1);
  if (jumping) {
    graphics.fillRoundedRect(10, 58, 15, 6, 3);
    graphics.fillRoundedRect(43, 55, 15, 6, 3);
  } else if (runForward) {
    graphics.fillRoundedRect(9, 63, 17, 6, 3);
    graphics.fillRoundedRect(43, 56, 15, 6, 3);
  } else {
    graphics.fillRoundedRect(7, 55, 17, 6, 3);
    graphics.fillRoundedRect(39, 64, 17, 6, 3);
  }

  graphics.fillStyle(COLORS.cream, 1);
  graphics.fillRoundedRect(17, 22, 29, 29, 8);
  graphics.lineStyle(2, COLORS.navy, 0.8);
  graphics.strokeRoundedRect(17, 22, 29, 29, 8);
  graphics.fillStyle(COLORS.navy, 1);
  graphics.fillRoundedRect(17, 26, 5, 21, 2);
  graphics.fillStyle(COLORS.coral, 1);
  graphics.fillTriangle(28, 23, 36, 23, 32, 39);

  graphics.fillStyle(0xf2c39f, 1);
  graphics.fillCircle(32, 14, 12);
  graphics.fillStyle(0x24394b, 1);
  graphics.fillRoundedRect(20, 4, 24, 10, 6);
  graphics.fillTriangle(20, 10, 27, 8, 23, 19);
  graphics.fillCircle(28, 14, 1.5);
  graphics.fillCircle(37, 14, 1.5);
  graphics.lineStyle(1.5, 0xb66f63, 1);
  graphics.lineBetween(30, 19, 36, 19);

  graphics.fillStyle(COLORS.orange, 1);
  graphics.fillRoundedRect(4, 30, 5, 8, 2);
}

function drawCrouchingStudent(graphics) {
  graphics.fillStyle(0x284b68, 1);
  graphics.fillRoundedRect(5, 40, 18, 25, 7);
  graphics.fillStyle(0x1c344a, 1);
  graphics.fillRoundedRect(2, 46, 7, 16, 3);

  graphics.lineStyle(8, 0x315a86, 1);
  graphics.lineBetween(27, 59, 18, 66);
  graphics.lineBetween(39, 59, 49, 66);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRoundedRect(10, 64, 17, 6, 3);
  graphics.fillRoundedRect(42, 64, 16, 6, 3);

  graphics.fillStyle(COLORS.cream, 1);
  graphics.fillRoundedRect(17, 45, 30, 19, 8);
  graphics.lineStyle(2, COLORS.navy, 0.8);
  graphics.strokeRoundedRect(17, 45, 30, 19, 8);
  graphics.fillStyle(COLORS.coral, 1);
  graphics.fillTriangle(29, 46, 36, 46, 33, 58);

  graphics.lineStyle(7, 0xf1bd98, 1);
  graphics.lineBetween(19, 49, 11, 58);
  graphics.lineBetween(45, 49, 53, 58);

  graphics.fillStyle(0xf2c39f, 1);
  graphics.fillCircle(32, 38, 11);
  graphics.fillStyle(0x24394b, 1);
  graphics.fillRoundedRect(21, 29, 23, 9, 6);
  graphics.fillTriangle(21, 36, 27, 34, 23, 43);
  graphics.fillCircle(29, 39, 1.4);
  graphics.fillCircle(37, 39, 1.4);
  graphics.lineStyle(1.5, 0xb66f63, 1);
  graphics.lineBetween(30, 44, 36, 44);

  graphics.fillStyle(COLORS.orange, 1);
  graphics.fillRoundedRect(4, 48, 5, 8, 2);
}

export function createGameTextures(scene) {
  saveTexture(scene, 'sky-gradient', 32, 450, (graphics) => {
    const bands = [
      0x72c7ee, 0x7bcef1, 0x85d4f3, 0x90d9f4, 0x9bdff5,
      0xa9e5f7, 0xbaebf8, 0xcdf1fa, 0xddf6fc, 0xeafaff,
    ];
    bands.forEach((color, index) => {
      graphics.fillStyle(color, 1);
      graphics.fillRect(0, index * 45, 32, 46);
    });
  });

  saveTexture(scene, 'player-run-1', 60, 70, (graphics) => {
    drawStudent(graphics, 'run-forward');
  });
  saveTexture(scene, 'player-run-2', 60, 70, (graphics) => {
    drawStudent(graphics, 'run-back');
  });
  saveTexture(scene, 'player-jump', 60, 70, (graphics) => {
    drawStudent(graphics, 'jump');
  });
  saveTexture(scene, 'player-crouch', 60, 70, (graphics) => {
    drawCrouchingStudent(graphics);
  });

  saveTexture(scene, 'obstacle-backpack', 52, 44, (graphics) => {
    graphics.lineStyle(5, 0x6b4434, 1);
    graphics.strokeRoundedRect(15, 2, 22, 20, 9);
    graphics.fillStyle(0x8b5039, 1);
    graphics.fillRoundedRect(2, 15, 8, 25, 4);
    graphics.fillStyle(COLORS.orange, 1);
    graphics.fillRoundedRect(6, 9, 41, 35, 9);
    graphics.fillStyle(0xf18d32, 1);
    graphics.fillRoundedRect(11, 26, 31, 13, 5);
    graphics.lineStyle(2, 0xd86d29, 0.9);
    graphics.strokeRoundedRect(11, 26, 31, 13, 5);
    graphics.fillStyle(COLORS.cream, 1);
    graphics.fillRoundedRect(22, 11, 8, 17, 3);
    graphics.fillCircle(26, 33, 2);
  });

  saveTexture(scene, 'obstacle-barricade', 62, 68, (graphics) => {
    graphics.fillStyle(0x425568, 1);
    graphics.fillRoundedRect(8, 16, 7, 52, 3);
    graphics.fillRoundedRect(47, 16, 7, 52, 3);
    graphics.fillStyle(0xfffbef, 1);
    graphics.fillRoundedRect(1, 7, 60, 27, 6);
    graphics.fillStyle(COLORS.coral, 1);
    graphics.fillTriangle(3, 31, 19, 7, 32, 7);
    graphics.fillTriangle(31, 34, 47, 7, 60, 7);
    graphics.lineStyle(2, 0xd74f47, 0.75);
    graphics.strokeRoundedRect(1, 7, 60, 27, 6);
    graphics.fillStyle(0x2b3d4e, 1);
    graphics.fillRoundedRect(0, 62, 22, 6, 3);
    graphics.fillRoundedRect(40, 62, 22, 6, 3);
    graphics.fillStyle(0xffd34e, 1);
    graphics.fillCircle(31, 49, 5);
  });

  saveTexture(scene, 'obstacle-puddle', 82, 18, (graphics) => {
    graphics.fillStyle(0x207eaa, 0.38);
    graphics.fillEllipse(41, 13, 82, 11);
    graphics.fillStyle(0x2fa7d3, 0.92);
    graphics.fillEllipse(41, 10, 78, 14);
    graphics.fillStyle(0x9eeaf6, 0.95);
    graphics.fillEllipse(30, 7, 30, 5);
    graphics.fillEllipse(60, 11, 22, 4);
    graphics.lineStyle(1.5, 0xd5f7fb, 0.75);
    graphics.strokeEllipse(43, 10, 47, 8);
    graphics.fillStyle(0x7dbb57, 1);
    graphics.fillTriangle(68, 3, 76, 1, 73, 7);
  });

  saveTexture(scene, 'obstacle-basketball', 56, 36, (graphics) => {
    graphics.lineStyle(3, 0xffc66b, 0.72);
    graphics.lineBetween(35, 10, 54, 10);
    graphics.lineBetween(39, 18, 55, 18);
    graphics.lineBetween(35, 26, 51, 26);
    graphics.fillStyle(0xf08a24, 1);
    graphics.fillCircle(16, 18, 16);
    graphics.lineStyle(2, 0x7d3e24, 0.9);
    graphics.strokeCircle(16, 18, 15);
    graphics.lineBetween(1, 18, 31, 18);
    graphics.lineBetween(16, 3, 16, 33);
    graphics.arc(4, 18, 13, -1.1, 1.1);
    graphics.arc(28, 18, 13, 2.05, 4.25);
    graphics.fillStyle(0xffbf54, 0.72);
    graphics.fillCircle(10, 10, 4);
  });

  saveTexture(scene, 'ground-tile', 240, 90, (graphics) => {
    graphics.fillStyle(COLORS.grassDark, 1);
    graphics.fillRect(0, 0, 240, 16);
    graphics.fillStyle(COLORS.grass, 1);
    graphics.fillRect(0, 0, 240, 11);
    for (let x = 2; x < 240; x += 17) {
      graphics.fillStyle(x % 34 === 2 ? 0x9bd873 : 0x5daa5c, 1);
      graphics.fillTriangle(x, 13, x + 5, 1, x + 10, 13);
    }
    graphics.fillStyle(0xf7f0df, 1);
    graphics.fillRect(0, 16, 240, 13);
    graphics.fillStyle(COLORS.pavement, 1);
    graphics.fillRect(0, 29, 240, 61);
    graphics.lineStyle(2, COLORS.pavementDark, 0.65);
    graphics.lineBetween(0, 59, 240, 59);
    graphics.lineBetween(58, 29, 46, 90);
    graphics.lineBetween(178, 29, 191, 90);
    graphics.fillStyle(0xf4c35e, 0.72);
    graphics.fillEllipse(110, 42, 8, 4);
    graphics.fillStyle(0xb66f4e, 0.54);
    graphics.fillEllipse(222, 75, 6, 3);
  });

  saveTexture(scene, 'far-scenery', 640, 230, (graphics) => {
    drawCloud(graphics, 42, 38, 0.74, 0.78);
    drawCloud(graphics, 350, 69, 0.56, 0.62);
    graphics.fillStyle(0x6daac0, 0.42);
    graphics.fillTriangle(0, 230, 115, 86, 245, 230);
    graphics.fillTriangle(155, 230, 326, 58, 485, 230);
    graphics.fillTriangle(400, 230, 540, 94, 640, 230);
    graphics.fillStyle(0x5797ae, 0.3);
    graphics.fillTriangle(34, 230, 213, 112, 386, 230);
    graphics.fillStyle(0x5c91a7, 0.22);
    for (let x = 18; x < 640; x += 42) {
      const height = 24 + ((x * 7) % 44);
      graphics.fillRect(x, 230 - height, 28, height);
      graphics.fillStyle(0xd9f1f8, 0.35);
      graphics.fillRect(x + 7, 214 - height, 4, 6);
      graphics.fillStyle(0x5c91a7, 0.22);
    }
    graphics.lineStyle(2, 0x477e94, 0.55);
    graphics.arc(565, 49, 8, 3.5, 5.9);
    graphics.arc(580, 45, 8, 3.5, 5.9);
  });

  saveTexture(scene, 'campus-scenery', 640, 270, (graphics) => {
    graphics.fillStyle(0x4d9d5b, 1);
    graphics.fillRect(0, 252, 640, 18);

    graphics.fillStyle(0xf2d29f, 1);
    graphics.fillRoundedRect(26, 80, 326, 172, 7);
    graphics.fillStyle(0xdf725d, 1);
    graphics.fillTriangle(12, 82, 188, 24, 366, 82);
    graphics.fillStyle(0xf8e5bd, 1);
    graphics.fillRoundedRect(145, 50, 86, 202, 5);
    graphics.fillStyle(0xd75e54, 1);
    graphics.fillTriangle(134, 53, 188, 6, 242, 53);
    graphics.fillStyle(COLORS.navy, 1);
    graphics.fillCircle(188, 88, 22);
    graphics.fillStyle(COLORS.cream, 1);
    graphics.fillCircle(188, 88, 17);
    graphics.lineStyle(2, COLORS.navy, 1);
    graphics.lineBetween(188, 88, 188, 77);
    graphics.lineBetween(188, 88, 198, 92);

    for (let row = 0; row < 3; row += 1) {
      for (let column = 0; column < 6; column += 1) {
        const x = 45 + column * 49;
        const y = 105 + row * 44;
        if (x > 135 && x < 235) {
          continue;
        }
        drawWindow(graphics, x, y, row === 0 && column % 2 === 0);
      }
    }

    graphics.fillStyle(COLORS.navy, 1);
    graphics.fillRoundedRect(169, 181, 38, 71, 4);
    graphics.fillStyle(0x8fc4d8, 1);
    graphics.fillRoundedRect(177, 190, 10, 54, 2);
    graphics.fillRoundedRect(190, 190, 10, 54, 2);
    graphics.fillStyle(COLORS.coral, 1);
    graphics.fillRoundedRect(121, 63, 134, 22, 6);
    graphics.fillStyle(COLORS.white, 1);
    graphics.fillRoundedRect(142, 70, 91, 5, 2);

    drawTree(graphics, 401, 260, 0.92);
    drawTree(graphics, 530, 260, 0.76);

    graphics.fillStyle(0x30495c, 1);
    graphics.fillRoundedRect(461, 150, 5, 105, 2);
    graphics.fillStyle(0xffda70, 1);
    graphics.fillCircle(463, 150, 11);
    graphics.fillStyle(0xfff3bd, 0.7);
    graphics.fillCircle(459, 146, 4);

    graphics.lineStyle(5, 0xf7f5e9, 0.92);
    graphics.lineBetween(352, 232, 640, 232);
    for (let x = 364; x < 640; x += 40) {
      graphics.lineBetween(x, 211, x, 260);
    }

    graphics.fillStyle(0x49718b, 1);
    graphics.fillRoundedRect(559, 214, 57, 8, 3);
    graphics.fillRoundedRect(565, 221, 5, 31, 2);
    graphics.fillRoundedRect(605, 221, 5, 31, 2);
  });
}
