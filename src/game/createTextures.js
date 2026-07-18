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

  saveTexture(scene, 'pickup-coin', 30, 30, (graphics) => {
    graphics.fillStyle(0x7c5320, 0.2);
    graphics.fillCircle(15, 17, 13);
    graphics.fillStyle(0xffc83d, 1);
    graphics.fillCircle(15, 14, 13);
    graphics.lineStyle(2, 0xd8891f, 1);
    graphics.strokeCircle(15, 14, 11);
    graphics.fillStyle(0xfff0a3, 1);
    graphics.fillCircle(11, 10, 3);
    graphics.fillStyle(0xe99b22, 1);
    graphics.fillRoundedRect(13, 7, 4, 14, 2);
  });

  saveTexture(scene, 'pickup-shield', 46, 46, (graphics) => {
    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillCircle(23, 23, 22);
    graphics.fillStyle(0x4ca7d8, 1);
    graphics.fillRoundedRect(5, 5, 36, 36, 10);
    graphics.fillStyle(0xe9f9ff, 1);
    graphics.fillTriangle(23, 9, 11, 15, 23, 38);
    graphics.fillTriangle(23, 9, 35, 15, 23, 38);
    graphics.fillStyle(COLORS.orange, 1);
    graphics.fillCircle(23, 21, 5);
  });

  saveTexture(scene, 'pickup-rush', 46, 46, (graphics) => {
    graphics.fillStyle(0xffffff, 0.92);
    graphics.fillCircle(23, 23, 22);
    graphics.fillStyle(0xff8b3d, 1);
    graphics.fillRoundedRect(7, 7, 32, 32, 9);
    graphics.fillStyle(COLORS.cream, 1);
    graphics.fillRoundedRect(12, 19, 19, 13, 4);
    graphics.lineStyle(4, COLORS.cream, 1);
    graphics.arc(31, 25, 6, -1.4, 1.4);
    graphics.lineStyle(2, COLORS.cream, 0.9);
    graphics.arc(17, 17, 4, 3.4, 5.4);
    graphics.arc(25, 15, 4, 3.4, 5.4);
  });

  saveTexture(scene, 'pickup-magnet', 46, 46, (graphics) => {
    graphics.fillStyle(0xffffff, 0.92);
    graphics.fillCircle(23, 23, 22);
    graphics.fillStyle(0x35b98c, 1);
    graphics.fillRoundedRect(5, 7, 36, 32, 7);
    graphics.fillStyle(0xdffbf0, 1);
    graphics.fillRoundedRect(10, 11, 26, 7, 3);
    graphics.fillStyle(COLORS.navy, 1);
    graphics.fillRoundedRect(11, 22, 8, 12, 3);
    graphics.fillRoundedRect(27, 22, 8, 12, 3);
    graphics.lineStyle(5, COLORS.navy, 1);
    graphics.arc(23, 23, 10, 0, Math.PI);
    graphics.fillStyle(COLORS.coral, 1);
    graphics.fillRect(11, 22, 8, 5);
    graphics.fillRect(27, 22, 8, 5);
  });

  saveTexture(scene, 'pickup-double-score', 46, 46, (graphics) => {
    graphics.fillStyle(0xffffff, 0.92);
    graphics.fillCircle(23, 23, 22);
    graphics.fillStyle(0x9b6bd1, 1);
    graphics.fillRoundedRect(6, 6, 34, 34, 9);
    graphics.fillStyle(COLORS.cream, 1);
    graphics.fillRoundedRect(10, 11, 12, 24, 3);
    graphics.fillRoundedRect(24, 11, 12, 24, 3);
    graphics.lineStyle(2, 0xd9c1f2, 1);
    graphics.lineBetween(23, 12, 23, 35);
    graphics.fillStyle(COLORS.orange, 1);
    graphics.fillCircle(16, 22, 3);
    graphics.fillCircle(30, 22, 3);
  });

  saveTexture(scene, 'pickup-coin-bonus', 46, 46, (graphics) => {
    graphics.fillStyle(0xffffff, 0.92);
    graphics.fillCircle(23, 23, 22);
    graphics.fillStyle(0xe9a72f, 1);
    graphics.fillRoundedRect(5, 6, 36, 34, 9);
    graphics.fillStyle(COLORS.cream, 1);
    graphics.fillRoundedRect(10, 11, 26, 24, 4);
    graphics.fillStyle(COLORS.orange, 1);
    graphics.fillCircle(23, 23, 7);
    graphics.fillStyle(COLORS.cream, 1);
    graphics.fillRoundedRect(21, 17, 4, 12, 2);
    graphics.lineStyle(2, 0xd18a20, 1);
    graphics.lineBetween(13, 15, 33, 15);
    graphics.lineBetween(13, 31, 33, 31);
  });

  saveTexture(scene, 'pickup-bundle', 58, 58, (graphics) => {
    graphics.fillStyle(0x173c59, 0.24);
    graphics.fillEllipse(29, 53, 48, 8);
    graphics.fillStyle(0xffffff, 0.96);
    graphics.fillCircle(29, 28, 27);
    graphics.fillStyle(0xffa640, 1);
    graphics.fillRoundedRect(7, 20, 44, 32, 8);
    graphics.fillStyle(0xff6f61, 1);
    graphics.fillRoundedRect(5, 16, 48, 12, 5);
    graphics.fillRect(25, 16, 8, 36);
    graphics.fillStyle(0xfff7e3, 1);
    graphics.fillTriangle(29, 17, 14, 5, 18, 20);
    graphics.fillTriangle(29, 17, 44, 5, 40, 20);
    graphics.fillStyle(0xffd45f, 1);
    graphics.fillCircle(29, 35, 8);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillTriangle(29, 28, 31, 33, 37, 33);
    graphics.fillTriangle(37, 33, 32, 37, 34, 43);
    graphics.fillTriangle(34, 43, 29, 39, 24, 43);
    graphics.fillTriangle(24, 43, 26, 37, 21, 33);
    graphics.fillTriangle(21, 33, 27, 33, 29, 28);
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

  saveTexture(scene, 'obstacle-cone', 44, 62, (graphics) => {
    graphics.fillStyle(0x2e4053, 0.22);
    graphics.fillEllipse(22, 58, 42, 8);
    graphics.fillStyle(0xe97032, 1);
    graphics.fillRoundedRect(2, 52, 40, 8, 3);
    graphics.fillTriangle(8, 52, 22, 2, 36, 52);
    graphics.fillStyle(0xfff7e3, 1);
    graphics.fillTriangle(13, 35, 17, 22, 27, 22);
    graphics.fillTriangle(13, 35, 27, 22, 31, 35);
    graphics.lineStyle(2, 0xc95729, 0.9);
    graphics.lineBetween(8, 52, 22, 2);
    graphics.lineBetween(22, 2, 36, 52);
  });

  saveTexture(scene, 'obstacle-books', 70, 34, (graphics) => {
    graphics.fillStyle(0x24394b, 0.18);
    graphics.fillEllipse(35, 31, 68, 6);
    graphics.fillStyle(0x356d89, 1);
    graphics.fillRoundedRect(3, 23, 63, 9, 3);
    graphics.fillStyle(0xe9f9ff, 1);
    graphics.fillRect(9, 24, 53, 5);
    graphics.fillStyle(COLORS.coral, 1);
    graphics.fillRoundedRect(9, 12, 58, 11, 3);
    graphics.fillStyle(0xfff7e3, 1);
    graphics.fillRect(14, 14, 48, 6);
    graphics.fillStyle(COLORS.orange, 1);
    graphics.fillRoundedRect(1, 2, 55, 11, 3);
    graphics.fillStyle(0xfff7e3, 1);
    graphics.fillRect(7, 4, 44, 6);
    graphics.lineStyle(2, 0xb15d30, 0.7);
    graphics.lineBetween(8, 3, 8, 12);
  });

  saveTexture(scene, 'obstacle-stacked-crates', 92, 154, (graphics) => {
    graphics.fillStyle(0x173c59, 0.2);
    graphics.fillEllipse(46, 150, 90, 8);

    const drawCrate = (x, y, width, height, color) => {
      graphics.fillStyle(color, 1);
      graphics.fillRoundedRect(x, y, width, height, 5);
      graphics.lineStyle(3, 0x684b35, 0.82);
      graphics.strokeRoundedRect(x, y, width, height, 5);
      graphics.lineBetween(x + 7, y + 7, x + width - 7, y + height - 7);
      graphics.lineBetween(x + width - 7, y + 7, x + 7, y + height - 7);
    };

    drawCrate(2, 104, 88, 48, 0xc28a52);
    drawCrate(12, 56, 68, 48, 0xd7a260);
    drawCrate(24, 10, 48, 46, 0xe0b16e);

    graphics.fillStyle(COLORS.cream, 1);
    graphics.fillTriangle(46, 16, 35, 31, 57, 31);
    graphics.fillTriangle(46, 34, 37, 46, 55, 46);
  });

  saveTexture(scene, 'obstacle-book-cart', 108, 148, (graphics) => {
    graphics.fillStyle(0x173c59, 0.2);
    graphics.fillEllipse(54, 144, 104, 8);
    graphics.fillStyle(0x315870, 1);
    graphics.fillRoundedRect(7, 102, 94, 31, 7);
    graphics.fillStyle(0x203f55, 1);
    graphics.fillCircle(25, 137, 9);
    graphics.fillCircle(83, 137, 9);
    graphics.fillStyle(0xdde9ec, 1);
    graphics.fillCircle(25, 137, 4);
    graphics.fillCircle(83, 137, 4);

    const bookColors = [COLORS.coral, COLORS.orange, 0x4ca7d8, 0x62b85f];
    [
      [13, 83, 78, 19],
      [20, 63, 72, 19],
      [11, 43, 68, 19],
      [27, 23, 66, 19],
      [19, 3, 58, 19],
    ].forEach(([x, y, width, height], index) => {
      graphics.fillStyle(bookColors[index % bookColors.length], 1);
      graphics.fillRoundedRect(x, y, width, height, 4);
      graphics.fillStyle(COLORS.cream, 0.95);
      graphics.fillRect(x + 7, y + 5, width - 13, height - 9);
      graphics.fillStyle(bookColors[index % bookColors.length], 1);
      graphics.fillRect(x + 4, y + 3, 5, height - 6);
    });

    graphics.fillStyle(COLORS.navy, 1);
    graphics.fillTriangle(87, 8, 78, 20, 96, 20);
    graphics.fillTriangle(87, 25, 80, 35, 94, 35);
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

  saveTexture(scene, 'obstacle-low-banner', 78, 330, (graphics) => {
    graphics.lineStyle(5, 0x315870, 0.9);
    graphics.lineBetween(14, 0, 20, 26);
    graphics.lineBetween(64, 0, 58, 26);
    graphics.fillStyle(0x173c59, 1);
    graphics.fillRoundedRect(4, 22, 70, 272, 8);
    graphics.fillStyle(COLORS.coral, 1);
    graphics.fillRoundedRect(9, 28, 60, 260, 6);
    graphics.fillStyle(0xffd26a, 1);
    graphics.fillRect(9, 72, 60, 17);
    graphics.fillRect(9, 226, 60, 17);
    graphics.fillStyle(COLORS.cream, 1);
    graphics.fillCircle(39, 144, 19);
    graphics.fillTriangle(39, 176, 25, 153, 53, 153);
    graphics.fillStyle(0x173c59, 1);
    graphics.fillTriangle(39, 194, 29, 177, 49, 177);
    graphics.fillStyle(COLORS.white, 0.78);
    graphics.fillRoundedRect(18, 253, 42, 5, 2);
    graphics.fillRoundedRect(24, 265, 30, 5, 2);
  });

  saveTexture(scene, 'obstacle-low-branch', 104, 220, (graphics) => {
    graphics.lineStyle(17, 0x76513a, 1);
    graphics.lineBetween(-8, 26, 112, 72);
    graphics.lineStyle(11, 0x8e6444, 1);
    graphics.lineBetween(49, 49, 67, 134);
    graphics.lineBetween(78, 60, 91, 125);
    graphics.fillStyle(0x2f7547, 1);
    graphics.fillCircle(16, 42, 30);
    graphics.fillCircle(46, 62, 34);
    graphics.fillCircle(80, 78, 31);
    graphics.fillCircle(93, 112, 25);
    graphics.fillCircle(67, 128, 29);
    graphics.fillStyle(0x62b85f, 1);
    graphics.fillCircle(28, 68, 22);
    graphics.fillCircle(68, 91, 23);
    graphics.fillCircle(82, 143, 23);
    graphics.fillStyle(0xa8db74, 0.9);
    graphics.fillCircle(19, 49, 8);
    graphics.fillCircle(60, 78, 8);
    graphics.fillCircle(84, 131, 7);
    graphics.lineStyle(4, 0x76513a, 1);
    graphics.lineBetween(66, 132, 66, 178);
    graphics.fillStyle(COLORS.orange, 1);
    graphics.fillEllipse(66, 175, 10, 6);
  });

  saveTexture(scene, 'story-truck', 330, 150, (graphics) => {
    graphics.fillStyle(0x0b1520, 0.28);
    graphics.fillEllipse(166, 143, 320, 13);

    graphics.fillStyle(0x304150, 1);
    graphics.fillRoundedRect(112, 24, 212, 102, 8);
    graphics.fillStyle(0x415969, 1);
    graphics.fillRect(126, 34, 186, 11);
    graphics.lineStyle(3, 0x1d2d3a, 0.85);
    graphics.strokeRoundedRect(112, 24, 212, 102, 8);
    for (let x = 138; x < 306; x += 34) {
      graphics.lineBetween(x, 47, x, 113);
    }

    graphics.fillStyle(0xb72731, 1);
    graphics.fillRoundedRect(18, 47, 107, 79, 12);
    graphics.fillTriangle(18, 47, 86, 47, 18, 93);
    graphics.fillStyle(0xd83a40, 1);
    graphics.fillRoundedRect(8, 88, 126, 38, 9);
    graphics.fillStyle(0xa7d8e6, 1);
    graphics.fillRoundedRect(33, 56, 45, 31, 5);
    graphics.fillStyle(0xeafaff, 0.65);
    graphics.fillTriangle(37, 59, 70, 59, 37, 79);
    graphics.fillStyle(0x172938, 1);
    graphics.fillRoundedRect(12, 101, 28, 20, 4);
    graphics.lineStyle(3, 0xd4dce0, 1);
    graphics.lineBetween(13, 106, 33, 106);
    graphics.lineBetween(13, 112, 33, 112);
    graphics.fillStyle(0xfff2a8, 1);
    graphics.fillCircle(12, 94, 7);
    graphics.fillStyle(0xffffff, 0.45);
    graphics.fillCircle(10, 92, 3);

    [61, 270].forEach((x) => {
      graphics.fillStyle(0x14202a, 1);
      graphics.fillCircle(x, 128, 19);
      graphics.fillStyle(0x83919b, 1);
      graphics.fillCircle(x, 128, 9);
      graphics.fillStyle(0xd7e0e4, 1);
      graphics.fillCircle(x, 128, 4);
    });

    graphics.fillStyle(0xffcf4a, 1);
    graphics.fillRoundedRect(162, 66, 112, 33, 6);
    graphics.fillStyle(0x1a2b38, 1);
    graphics.fillRoundedRect(171, 73, 94, 19, 4);
    graphics.fillStyle(0xfff3c4, 1);
    graphics.fillTriangle(181, 83, 191, 75, 191, 91);
    graphics.fillTriangle(205, 83, 215, 75, 215, 91);
    graphics.fillRoundedRect(226, 79, 29, 7, 3);
  });

  saveTexture(scene, 'story-portal', 240, 240, (graphics) => {
    graphics.fillStyle(0x160d35, 0.35);
    graphics.fillCircle(120, 120, 110);
    graphics.lineStyle(13, 0x7f5cff, 0.36);
    graphics.strokeCircle(120, 120, 96);
    graphics.lineStyle(8, 0xbfa7ff, 0.82);
    graphics.strokeCircle(120, 120, 78);
    graphics.lineStyle(4, 0x8fffe0, 0.92);
    graphics.strokeCircle(120, 120, 61);
    graphics.fillStyle(0xf7f2ff, 0.86);
    graphics.fillCircle(120, 120, 48);
    graphics.fillStyle(0xb9a4ff, 0.38);
    graphics.fillCircle(105, 105, 30);
    [
      [120, 17], [186, 40], [220, 112], [194, 190],
      [120, 223], [47, 198], [19, 121], [46, 46],
    ].forEach(([x, y], index) => {
      graphics.fillStyle(index % 2 ? 0x8fffe0 : 0xe5d7ff, 0.95);
      graphics.fillCircle(x, y, index % 2 ? 4 : 6);
    });
  });

  saveTexture(scene, 'obstacle-slime', 64, 44, (graphics) => {
    graphics.fillStyle(0x11142a, 0.24);
    graphics.fillEllipse(32, 41, 60, 7);
    graphics.fillStyle(0x70d6a4, 1);
    graphics.fillEllipse(32, 27, 60, 32);
    graphics.fillTriangle(8, 29, 21, 5, 34, 28);
    graphics.fillStyle(0xb8f5d3, 0.72);
    graphics.fillEllipse(21, 18, 15, 10);
    graphics.fillStyle(0x18263a, 1);
    graphics.fillCircle(24, 28, 3);
    graphics.fillCircle(43, 28, 3);
    graphics.lineStyle(2, 0x355e55, 1);
    graphics.arc(34, 31, 7, 0.2, 2.8);
  });

  saveTexture(scene, 'obstacle-rune-stone', 62, 72, (graphics) => {
    graphics.fillStyle(0x101429, 0.23);
    graphics.fillEllipse(31, 69, 60, 7);
    graphics.fillStyle(0x667586, 1);
    graphics.fillTriangle(7, 68, 15, 13, 29, 2);
    graphics.fillTriangle(7, 68, 29, 2, 54, 68);
    graphics.fillStyle(0x8495a5, 1);
    graphics.fillTriangle(16, 61, 21, 18, 29, 10);
    graphics.lineStyle(4, 0x8fffe0, 0.9);
    graphics.lineBetween(31, 23, 23, 37);
    graphics.lineBetween(23, 37, 34, 45);
    graphics.lineBetween(34, 45, 27, 58);
    graphics.fillStyle(0xb9fff0, 0.7);
    graphics.fillCircle(23, 37, 4);
  });

  saveTexture(scene, 'obstacle-crystal-spire', 92, 156, (graphics) => {
    graphics.fillStyle(0x101429, 0.25);
    graphics.fillEllipse(46, 152, 88, 8);
    graphics.fillStyle(0x51408f, 1);
    graphics.fillTriangle(6, 150, 31, 51, 51, 150);
    graphics.fillStyle(0x745bd0, 1);
    graphics.fillTriangle(24, 151, 54, 5, 75, 151);
    graphics.fillStyle(0x9a85ed, 0.92);
    graphics.fillTriangle(47, 136, 55, 21, 65, 137);
    graphics.fillStyle(0x5de6cb, 0.84);
    graphics.fillTriangle(56, 151, 76, 67, 89, 151);
    graphics.lineStyle(3, 0xe4dcff, 0.72);
    graphics.lineBetween(54, 6, 54, 128);
    graphics.lineBetween(31, 52, 19, 135);
  });

  saveTexture(scene, 'obstacle-magic-orb', 58, 38, (graphics) => {
    graphics.lineStyle(3, 0xa992ff, 0.38);
    graphics.strokeEllipse(29, 19, 55, 23);
    graphics.fillStyle(0x745bd0, 0.3);
    graphics.fillCircle(29, 19, 18);
    graphics.fillStyle(0xc5b6ff, 0.9);
    graphics.fillCircle(29, 19, 13);
    graphics.fillStyle(0xf8f4ff, 1);
    graphics.fillCircle(24, 14, 5);
    graphics.fillStyle(0x8fffe0, 0.9);
    graphics.fillCircle(42, 7, 3);
    graphics.fillCircle(9, 27, 2);
  });

  saveTexture(scene, 'obstacle-shadow-bat', 112, 220, (graphics) => {
    graphics.fillStyle(0x252044, 1);
    graphics.fillTriangle(56, 34, 2, 3, 16, 62);
    graphics.fillTriangle(56, 34, 110, 3, 96, 62);
    graphics.fillTriangle(11, 22, 31, 31, 18, 49);
    graphics.fillTriangle(101, 22, 81, 31, 94, 49);
    graphics.fillEllipse(56, 38, 39, 48);
    graphics.fillTriangle(44, 23, 49, 3, 57, 24);
    graphics.fillTriangle(55, 24, 64, 3, 68, 25);
    graphics.fillStyle(0xff6f9f, 1);
    graphics.fillCircle(49, 33, 3);
    graphics.fillCircle(64, 33, 3);
    graphics.lineStyle(3, 0x5b4a93, 0.72);
    graphics.lineBetween(38, 58, 27, 123);
    graphics.lineBetween(74, 58, 84, 123);
    graphics.fillStyle(0xa992ff, 0.32);
    graphics.fillCircle(27, 125, 8);
    graphics.fillCircle(84, 125, 8);
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

  saveTexture(scene, 'isekai-sky', 32, 450, (graphics) => {
    const bands = [
      0x17122f, 0x1d183d, 0x251e4c, 0x2e275b, 0x393265,
      0x49406f, 0x5a5078, 0x706483, 0x887991, 0xa08c9d,
    ];
    bands.forEach((color, index) => {
      graphics.fillStyle(color, 1);
      graphics.fillRect(0, index * 45, 32, 46);
    });
  });

  saveTexture(scene, 'isekai-far', 640, 230, (graphics) => {
    [
      [43, 28, 2], [102, 74, 1.5], [176, 39, 2], [254, 89, 1.4],
      [341, 35, 1.8], [421, 67, 1.5], [516, 24, 2], [594, 83, 1.6],
    ].forEach(([x, y, radius], index) => {
      graphics.fillStyle(index % 2 ? 0xb9a5ff : 0x8fffe0, 0.78);
      graphics.fillCircle(x, y, radius);
    });

    graphics.fillStyle(0x312b55, 0.84);
    graphics.fillTriangle(0, 230, 118, 78, 244, 230);
    graphics.fillTriangle(134, 230, 292, 51, 438, 230);
    graphics.fillTriangle(362, 230, 520, 83, 640, 230);
    graphics.fillStyle(0x4d426e, 0.66);
    graphics.fillTriangle(34, 230, 202, 116, 374, 230);
    graphics.fillTriangle(338, 230, 487, 126, 638, 230);

    graphics.fillStyle(0x1e1b38, 0.93);
    graphics.fillRect(482, 107, 112, 123);
    graphics.fillRect(463, 82, 32, 148);
    graphics.fillRect(582, 91, 29, 139);
    graphics.fillTriangle(457, 82, 479, 48, 501, 82);
    graphics.fillTriangle(577, 91, 596, 57, 616, 91);
    graphics.fillTriangle(497, 107, 539, 69, 580, 107);
    graphics.fillStyle(0xf6d982, 0.76);
    [
      [475, 103], [475, 131], [592, 112], [592, 141],
      [511, 131], [540, 131], [568, 131], [511, 161], [568, 161],
    ].forEach(([x, y]) => graphics.fillRoundedRect(x, y, 7, 11, 2));
  });

  saveTexture(scene, 'isekai-scenery', 640, 270, (graphics) => {
    graphics.fillStyle(0x223c3d, 1);
    graphics.fillRect(0, 246, 640, 24);

    for (let x = 12; x < 640; x += 56) {
      const height = 72 + ((x * 5) % 52);
      graphics.fillStyle(x % 112 === 12 ? 0x274b43 : 0x31564a, 1);
      graphics.fillTriangle(x - 22, 250, x, 250 - height, x + 24, 250);
      graphics.fillTriangle(x - 17, 222, x, 250 - height - 28, x + 18, 222);
      graphics.fillStyle(0x18352f, 1);
      graphics.fillRect(x - 3, 226, 6, 29);
    }

    graphics.fillStyle(0x8b6b5a, 1);
    graphics.fillRoundedRect(92, 164, 128, 89, 5);
    graphics.fillStyle(0x563a4c, 1);
    graphics.fillTriangle(75, 166, 156, 112, 236, 166);
    graphics.fillStyle(0xb08a66, 1);
    graphics.fillRoundedRect(268, 180, 116, 73, 5);
    graphics.fillStyle(0x654153, 1);
    graphics.fillTriangle(253, 182, 326, 132, 399, 182);
    graphics.fillStyle(0xeed58e, 0.92);
    [
      [111, 185], [143, 185], [179, 185], [286, 201], [350, 201],
    ].forEach(([x, y]) => {
      graphics.fillRoundedRect(x, y, 18, 22, 3);
      graphics.lineStyle(2, 0x765a4e, 0.9);
      graphics.lineBetween(x + 9, y, x + 9, y + 22);
    });
    graphics.fillStyle(0x3b2b3a, 1);
    graphics.fillRoundedRect(146, 213, 26, 40, 4);
    graphics.fillRoundedRect(312, 219, 24, 34, 4);

    graphics.fillStyle(0x273b46, 1);
    graphics.fillRoundedRect(439, 133, 10, 120, 3);
    graphics.fillStyle(0x9b7bd8, 1);
    graphics.fillCircle(444, 132, 15);
    graphics.fillStyle(0xe9ddff, 0.7);
    graphics.fillCircle(439, 127, 5);

    graphics.lineStyle(4, 0x9f8566, 1);
    graphics.lineBetween(405, 235, 640, 235);
    for (let x = 415; x < 640; x += 34) {
      graphics.lineBetween(x, 218, x, 255);
    }
  });

  saveTexture(scene, 'isekai-ground', 240, 90, (graphics) => {
    graphics.fillStyle(0x19372f, 1);
    graphics.fillRect(0, 0, 240, 16);
    graphics.fillStyle(0x3f7357, 1);
    graphics.fillRect(0, 0, 240, 11);
    for (let x = 3; x < 240; x += 18) {
      graphics.fillStyle(x % 36 === 3 ? 0x72b36b : 0x4e8c62, 1);
      graphics.fillTriangle(x, 13, x + 5, 1, x + 11, 13);
    }
    graphics.fillStyle(0x3a3747, 1);
    graphics.fillRect(0, 16, 240, 74);
    graphics.fillStyle(0x585465, 1);
    graphics.fillRect(0, 22, 240, 68);
    graphics.lineStyle(2, 0x797388, 0.62);
    graphics.lineBetween(0, 55, 240, 55);
    graphics.lineBetween(48, 22, 35, 90);
    graphics.lineBetween(137, 22, 151, 90);
    graphics.lineBetween(220, 22, 209, 90);
    graphics.lineStyle(2, 0x8fffe0, 0.38);
    graphics.arc(91, 67, 13, 0, Math.PI * 2);
    graphics.lineBetween(80, 67, 102, 67);
    graphics.lineBetween(91, 56, 91, 78);
  });

  saveTexture(scene, 'neon-ground', 240, 90, (graphics) => {
    graphics.fillStyle(0x071323, 1);
    graphics.fillRect(0, 0, 240, 90);
    graphics.fillStyle(0x142e45, 1);
    graphics.fillRect(0, 0, 240, 15);
    graphics.fillStyle(0x35f2df, 1);
    graphics.fillRect(0, 0, 240, 4);
    graphics.fillStyle(0x1f4961, 1);
    for (let x = 8; x < 240; x += 48) {
      graphics.fillRoundedRect(x, 21, 34, 8, 2);
      graphics.fillStyle(x % 96 ? 0xff4fa3 : 0xffc857, 0.9);
      graphics.fillRect(x + 5, 23, 7, 3);
      graphics.fillStyle(0x1f4961, 1);
    }
    graphics.lineStyle(2, 0x21445c, 0.9);
    graphics.lineBetween(0, 54, 240, 54);
    graphics.lineBetween(58, 15, 42, 90);
    graphics.lineBetween(167, 15, 183, 90);
    graphics.lineStyle(2, 0xff4fa3, 0.42);
    graphics.lineBetween(0, 82, 240, 82);
  });

  saveTexture(scene, 'neon-reactor', 96, 158, (graphics) => {
    graphics.fillStyle(0x050a18, 0.42);
    graphics.fillEllipse(48, 153, 90, 10);
    graphics.fillStyle(0x111f36, 1);
    graphics.fillRoundedRect(10, 22, 76, 132, 8);
    graphics.fillStyle(0x27465c, 1);
    graphics.fillRoundedRect(17, 30, 62, 116, 5);
    graphics.fillStyle(0x081827, 1);
    graphics.fillRoundedRect(27, 47, 42, 74, 8);
    graphics.fillStyle(0x6836c7, 0.9);
    graphics.fillCircle(48, 84, 22);
    graphics.fillStyle(0x37f4df, 0.96);
    graphics.fillCircle(48, 84, 14);
    graphics.fillStyle(0xe6fffb, 0.95);
    graphics.fillCircle(43, 78, 5);
    graphics.lineStyle(4, 0xff4fa3, 0.86);
    graphics.strokeRoundedRect(21, 39, 54, 92, 8);
    graphics.lineStyle(3, 0x35f2df, 0.95);
    graphics.lineBetween(17, 35, 79, 35);
    graphics.lineBetween(17, 139, 79, 139);
    [20, 76].forEach((x) => {
      graphics.fillStyle(0xffc857, 1);
      graphics.fillRect(x - 3, 8, 6, 20);
      graphics.fillTriangle(x - 7, 10, x + 7, 10, x, 0);
    });
  });

  saveTexture(scene, 'neon-energy-orb', 64, 44, (graphics) => {
    graphics.lineStyle(3, 0xff4fa3, 0.58);
    graphics.strokeEllipse(32, 22, 61, 25);
    graphics.fillStyle(0x6f39d8, 0.48);
    graphics.fillCircle(32, 22, 19);
    graphics.fillStyle(0x35f2df, 0.96);
    graphics.fillCircle(32, 22, 12);
    graphics.fillStyle(0xe7fffb, 1);
    graphics.fillRect(28, 13, 7, 7);
    graphics.fillStyle(0xffc857, 1);
    graphics.fillRect(6, 29, 4, 4);
    graphics.fillRect(53, 7, 4, 4);
  });

  saveTexture(scene, 'neon-gate', 210, 284, (graphics) => {
    graphics.fillStyle(0x050817, 0.36);
    graphics.fillRoundedRect(7, 5, 196, 274, 18);
    graphics.fillStyle(0x14223d, 1);
    graphics.fillRoundedRect(19, 8, 172, 276, 15);
    graphics.fillStyle(0x213c59, 1);
    graphics.fillRoundedRect(30, 20, 150, 264, 12);
    graphics.fillStyle(0x061425, 1);
    graphics.fillRoundedRect(48, 44, 114, 240, 56);
    graphics.lineStyle(8, 0xff4fa3, 0.9);
    graphics.strokeRoundedRect(39, 31, 132, 253, 18);
    graphics.lineStyle(5, 0x35f2df, 1);
    graphics.strokeRoundedRect(50, 47, 110, 237, 52);
    graphics.lineStyle(2, 0xe8fffb, 0.74);
    graphics.strokeRoundedRect(60, 61, 90, 223, 44);
    for (let y = 67; y < 272; y += 26) {
      graphics.fillStyle(y % 52 === 15 ? 0xffc857 : 0x35f2df, 0.76);
      graphics.fillRect(19, y, 13, 5);
      graphics.fillRect(178, y + 9, 13, 5);
    }
    graphics.fillStyle(0xff4fa3, 0.9);
    graphics.fillTriangle(86, 20, 105, 3, 124, 20);
    graphics.fillStyle(0xe9fffb, 0.9);
    graphics.fillCircle(105, 18, 5);
  });

  saveTexture(scene, 'neon-pickup-coin', 30, 30, (graphics) => {
    graphics.fillStyle(0x102238, 0.36);
    graphics.fillCircle(15, 17, 13);
    graphics.fillStyle(0x35f2df, 1);
    graphics.fillRoundedRect(3, 3, 24, 24, 7);
    graphics.lineStyle(2, 0xe7fffb, 0.9);
    graphics.strokeRoundedRect(6, 6, 18, 18, 4);
    graphics.fillStyle(0xff4fa3, 1);
    graphics.fillRect(12, 8, 6, 14);
    graphics.fillStyle(0xffffff, 0.94);
    graphics.fillRect(13, 8, 2, 5);
  });

  const drawNeonPickup = (key, color, symbolDrawer) => {
    saveTexture(scene, key, 46, 46, (graphics) => {
      graphics.fillStyle(0x071323, 0.96);
      graphics.fillRoundedRect(3, 3, 40, 40, 9);
      graphics.lineStyle(3, color, 1);
      graphics.strokeRoundedRect(4, 4, 38, 38, 8);
      graphics.fillStyle(color, 0.22);
      graphics.fillCircle(23, 23, 15);
      symbolDrawer(graphics);
      graphics.fillStyle(0xffffff, 0.82);
      graphics.fillRect(10, 9, 6, 2);
    });
  };

  drawNeonPickup('neon-pickup-shield', 0x35f2df, (graphics) => {
    graphics.fillStyle(0xdffffa, 1);
    graphics.fillTriangle(23, 10, 12, 16, 23, 36);
    graphics.fillTriangle(23, 10, 34, 16, 23, 36);
    graphics.fillStyle(0x35f2df, 1);
    graphics.fillCircle(23, 22, 4);
  });
  drawNeonPickup('neon-pickup-rush', 0xff4fa3, (graphics) => {
    graphics.fillStyle(0xfff1f8, 1);
    graphics.fillTriangle(25, 8, 13, 25, 23, 25);
    graphics.fillTriangle(21, 38, 34, 19, 23, 19);
  });
  drawNeonPickup('neon-pickup-magnet', 0x8c6dff, (graphics) => {
    graphics.lineStyle(7, 0xf3eeff, 1);
    graphics.arc(23, 22, 11, 0, Math.PI);
    graphics.fillStyle(0xff4fa3, 1);
    graphics.fillRect(9, 21, 7, 10);
    graphics.fillStyle(0x35f2df, 1);
    graphics.fillRect(30, 21, 7, 10);
  });
  drawNeonPickup('neon-pickup-double-score', 0xffc857, (graphics) => {
    graphics.fillStyle(0xfff5d4, 1);
    graphics.fillRoundedRect(10, 14, 11, 18, 3);
    graphics.fillRoundedRect(25, 14, 11, 18, 3);
    graphics.fillStyle(0x17243a, 1);
    graphics.fillRect(14, 20, 3, 7);
    graphics.fillRect(29, 20, 3, 7);
  });
  drawNeonPickup('neon-pickup-coin-bonus', 0x35f2df, (graphics) => {
    graphics.fillStyle(0xffc857, 1);
    graphics.fillCircle(19, 23, 9);
    graphics.fillCircle(28, 23, 9);
    graphics.fillStyle(0x071323, 1);
    graphics.fillRect(17, 17, 3, 12);
    graphics.fillRect(27, 17, 3, 12);
  });
  drawNeonPickup('neon-pickup-bundle', 0xff4fa3, (graphics) => {
    graphics.fillStyle(0x35f2df, 1);
    graphics.fillRoundedRect(9, 15, 28, 21, 4);
    graphics.fillStyle(0xffc857, 1);
    graphics.fillRect(20, 15, 6, 21);
    graphics.fillRect(9, 21, 28, 5);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(23, 12, 5);
  });
}
