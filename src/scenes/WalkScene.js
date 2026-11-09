import Hero from '../objects/Hero.js';
import Landmark from '../objects/Landmark.js';
import { GAME_CONFIG, LANDMARKS } from '../config.js';

export default class WalkScene extends Phaser.Scene {
  constructor() {
    super('WalkScene');
  }

  create() {
    const cfg = GAME_CONFIG;
    const groundY = cfg.height - cfg.groundHeight;

    // 地面
    this.ground = this.add
      .tileSprite(0, groundY, cfg.width, cfg.groundHeight, 'ground')
      .setOrigin(0, 0)
      .setDepth(0);

    // 全屏透明输入层（兜底，确保任意位置点击都能触发推进）
    this.inputLayer = this.add
      .zone(0, 0, cfg.width, cfg.height)
      .setOrigin(0, 0)
      .setDepth(1)
      .setInteractive();

    // 人物
    this.hero = new Hero(this, cfg.heroX, groundY + 4);

    // 状态
    this.landmarks = [];
    this.spawnedCount = 0;
    this.distanceSinceSpawn = 0;
    this.isAdvancing = false;

    // 先生成第一个地标
    this.spawnLandmark();

    // 绑定点击：输入层 + 场景级 双保险
    this.inputLayer.on('pointerdown', () => {
      console.log('[inputLayer] pointerdown');
      this.onScreenTap();
    });

    this.input.on('pointerdown', (pointer, currentlyOver) => {
      console.log('[scene] pointerdown, over=', currentlyOver ? currentlyOver.length : 0);
      // 如果点击的是可交互对象（地标），由地标的 onTap 处理，不推进
      if (currentlyOver && currentlyOver.length > 0) return;
      this.onScreenTap();
    });
  }

  spawnLandmark() {
    if (this.spawnedCount >= LANDMARKS.length) return;
    if (this.landmarks.length >= GAME_CONFIG.maxOnScreen) return;

    const cfg = GAME_CONFIG;
    const groundY = cfg.height - cfg.groundHeight;
    const data = LANDMARKS[this.spawnedCount];

    let x = cfg.spawnX;
    if (this.landmarks.length > 0) {
      const rightmost = Math.max(...this.landmarks.map((lm) => lm.getX()));
      x = rightmost + cfg.landmarkGap;
    }

    const lm = new Landmark(this, x, groundY, data);
    this.landmarks.push(lm);
    this.spawnedCount++;
    this.distanceSinceSpawn = 0;

    console.log('[spawn]', data.key, 'at x=', x, 'total spawned=', this.spawnedCount);
  }

  onScreenTap() {
    console.log('[onScreenTap] isAdvancing=', this.isAdvancing,
      'spawned=', this.spawnedCount,
      'landmarks=', this.landmarks.length);

    if (this.isAdvancing) return;
    if (this.spawnedCount >= LANDMARKS.length && this.landmarks.length === 0) return;

    this.isAdvancing = true;
    this.hero.setWalking(true);
    console.log('[onScreenTap] started advancing');
  }

  update(time, delta) {
    if (!this.isAdvancing) return;

    const cfg = GAME_CONFIG;
    const dt = Math.min(delta / 1000, 0.05);       // 限制单帧最大 50ms
    let moveDist = cfg.walkSpeed * dt;

    const remaining = cfg.landmarkGap - this.distanceSinceSpawn;
    if (moveDist > remaining) moveDist = remaining;

    // 移动地标
    this.landmarks.forEach((lm) => lm.moveBy(-moveDist));
    // 地面滚动
    this.ground.tilePositionX += moveDist;
    // 累计
    this.distanceSinceSpawn += moveDist;

    console.log('[update] moveDist=', moveDist.toFixed(2),
      'acc=', this.distanceSinceSpawn.toFixed(2));

    // 走完一个间距
    if (this.distanceSinceSpawn >= cfg.landmarkGap - 0.01) {
      this.spawnLandmark();
      this.distanceSinceSpawn = 0;
      this.isAdvancing = false;
      this.hero.setWalking(false);
      console.log('[update] finished one step');
    }

    // 清理出屏地标
    for (let i = this.landmarks.length - 1; i >= 0; i--) {
      if (this.landmarks[i].isOffScreen()) {
        this.landmarks[i].destroy();
        this.landmarks.splice(i, 1);
      }
    }
  }
}