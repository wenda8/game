import { LANDMARKS } from '../config.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.add
      .text(300, 225, 'loading…', { fontSize: '24px', color: '#333' })
      .setOrigin(1.5);

    this.load.spritesheet('she','public/assets/walk.png', {
      frameWidth: 700,
      frameHeight: 1024,
    });

    this.load.spritesheet('he','public/assets/hewalk.png', {
      frameWidth: 650,
      frameHeight: 1024,
    });

    this.load.image('bg', 'public/assets/bg.png');

    LANDMARKS.forEach((lm) => {
        this.load.image(lm.key, `assets/landmarks/${lm.file}`);
    });
  }

  create() {
    // this.createHeroTexture();
    this.createGroundTexture();
    // LANDMARKS.forEach((lm) => this.createLandmarkTexture(lm.key, lm.color));
    
    if (!this.anims.exists('she-walk')) {
      this.anims.create({
        key: 'she-walk',
        frames: this.anims.generateFrameNumbers('she', { start: 1, end: 4 }),
        frameRate: 8,
        repeat: -1,
      });
    }
      this.anims.create({
        key: 'she-idle',
        frames: [{ key: 'she', frame: 0 }],
        frameRate: 1,
        repeat: -1,
      });

    
    if (!this.anims.exists('he-walk')) {
      this.anims.create({
        key: 'he-walk',
        frames: this.anims.generateFrameNumbers('he', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1,
      });
    }
      this.anims.create({
        key: 'he-idle',
        frames: [{ key: 'he', frame: 0 }],
        frameRate: 1,
        repeat: -1,
      });

    this.scene.start('WalkScene');
  }

  /**
   * 人物精灵图：用 Graphics 画 4 帧，每帧 64×96
   * 拼成一张 256×96 的 texture，然后注册成 spritesheet
   */
  // createHeroTexture() {
  //   const fw = 64;
  //   const fh = 96;
  //   const frames = 4;

  //   const g = this.make.graphics({ x: 0, y: 0, add: false });

  //   for (let i = 0; i < frames; i++) {
  //     const ox = i * fw;

  //     // 身体
  //     g.fillStyle(0x4a6fa5, 1);
  //     g.fillRoundedRect(ox + 20, 34, 24, 36, 6);

  //     // 头
  //     g.fillStyle(0xffe0bd, 1);
  //     g.fillCircle(ox + 32, 26, 14);

  //     // 头发
  //     g.fillStyle(0x3b2a1a, 1);
  //     g.fillEllipse(ox + 32, 16, 28, 16);

  //     // 眼睛
  //     g.fillStyle(0x222222, 1);
  //     g.fillCircle(ox + 27, 26, 2);
  //     g.fillCircle(ox + 37, 26, 2);

  //     // 腿：用不同偏移模拟走路
  //     g.fillStyle(0x2f2f3a, 1);
  //     const legSwing = (i % 2 === 0) ? -6 : 6;
  //     g.fillRect(ox + 24, 70, 6, 20 + legSwing);
  //     g.fillRect(ox + 34, 70, 6, 20 - legSwing);
  //   }

  //   g.generateTexture('hero-sheet', fw * frames, fh);
  //   g.destroy();

  //   // 从生成的 texture 中注册 spritesheet 帧
  //   const tex = this.textures.get('hero-sheet');
  //   const source = tex.getSourceImage();
  //   this.textures.remove('hero');

  //   // Phaser 3 用 addSpriteSheetFromAtlas 较繁琐，这里直接手动添加帧
  //   this.textures.addSpriteSheet('hero', source, { frameWidth: fw, frameHeight: fh });
  //   this.textures.remove('hero-sheet');
  // }

  createGroundTexture() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x8b7355, 1);
    g.fillRect(0, 0, 128, 40);
    g.fillStyle(0x7a6548, 1);
    for (let x = 0; x < 128; x += 16) {
      g.fillRect(x, 0, 2, 40);
    }
    g.generateTexture('ground', 128, 40);
    g.destroy();
  }

  createLandmarkTexture(key, color) {
    const w = 120;
    const h = 160;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    g.fillStyle(color, 1);
    g.fillRoundedRect(10, 30, w - 20, h - 30, 10);
    g.fillStyle(0xffffff, 0.85);
    g.fillRoundedRect(28, 60, 28, 34, 4);
    g.fillRoundedRect(64, 60, 28, 34, 4);
    g.fillRoundedRect(28, 108, 28, 34, 4);
    g.fillRoundedRect(64, 108, 28, 34, 4);
    g.fillStyle(0x333333, 0.9);
    g.fillRoundedRect(46, 150, 28, 10, 4);

    g.generateTexture(key, w, h);
    g.destroy();
  }
}