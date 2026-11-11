import Hero from '../objects/Hero.js';
import Landmark from '../objects/Landmark.js';
import { GAME_CONFIG, LANDMARKS } from '../config.js';
import QuizUI from '../objects/QuizUI.js';


export default class WalkScene extends Phaser.Scene {
  constructor() {
    super('WalkScene');
  }

  create() {
    const cfg = GAME_CONFIG;
    const groundY = cfg.height - cfg.groundHeight;
    // background
    this.bg = this.add.image(0, 0, 'bg').setOrigin(0,0).setDepth(-10);
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
    this.she = new Hero(this, cfg.heroX, groundY + 4, 'she');
    this.he = null;
    this.isJoining = false;

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

    this.quizUI = new QuizUI(this);
    this.isAnswering = false; // 👈 新增：是否正在答题的状态锁
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

  triggerHeJoin(landmarkData){
    const cfg = GAME_CONFIG;
    const groundY = cfg.height - cfg.groundHeight;
    this.isJoining = true;

    this.he = new Hero(this, cfg.width+100, groundY+4, 'he');
    this.he.setFlipX(false);
    this.he.setWalking(true);
    
    const targetX = this.she.sprite.x + 200;
    
    this.tweens.add({
      targets: this.he.sprite,
      x: targetX,
      duration: 1500,
      ease: 'Linear',
      onComplete: () => {
        // 男主到达，两人停下
        this.he.setWalking(false);
        this.she.setWalking(false);

        this.she.sprite.setDepth(60);
        this.he.sprite.setDepth(50);

        this.time.delayedCall(1000, () => {
          // 触发答题
          if (landmarkData && landmarkData.data.question) {
            this.askQuestion(landmarkData.data);
          } else {
            this.spawnLandmark();
          }
          this.he.setFlipX(true);
          this.isJoining = false;
          this.spawnLandmark();

        });
        
      }
    });
  }

  onScreenTap() {
    if (this.isAdvancing || this.isJoining || this.isAnswering) return;  // 如果正在答题，或者正在移动，直接打断
    console.log('[onScreenTap] isAdvancing=', this.isAdvancing,
      'spawned=', this.spawnedCount,
      'landmarks=', this.landmarks.length);

    if (this.isAdvancing) return;
    if (this.spawnedCount >= LANDMARKS.length && this.landmarks.length === 0) return;
    if (this.isAdvancing || this.isJoining) return;

    this.isAdvancing = true;
    this.she.setWalking(true);
    if (this.he){
      this.he.setWalking(true);
    }
    console.log('[onScreenTap] started advancing');
  }

  // 统一出题方法
  askQuestion(questionData) {
    this.isAnswering = true; // 锁住屏幕移动
    
    // 在题目前面加上“男生：”
    const modifiedData = {
      ...questionData,
      question: `男生：${questionData.question}`
    };

    this.quizUI.show(modifiedData, 
      // 答对的回调
      () => {
        this.isAnswering = false; // 解锁
        this.spawnLandmark();     // 继续生成新地标
      },
      // 答错的回调（会在 QuizUI 里直接重启）
      () => {}
    );
  }

  update(time, delta) {
    if (this.isJoining || this.isAnswering) return;
    if (!this.isAdvancing) return;

    const cfg = GAME_CONFIG;
    const dt = Math.min(delta / 1000, 0.05);
    let moveDist = cfg.walkSpeed * dt;

    const remaining = cfg.landmarkGap - this.distanceSinceSpawn;
    if (moveDist > remaining) moveDist = remaining;

    // 移动地标和背景
    this.landmarks.forEach((lm) => lm.moveBy(-moveDist));
    this.bg.x -= moveDist * 1;
    this.distanceSinceSpawn += moveDist;

    // 走完一个间距，到达地标
    if (this.distanceSinceSpawn >= cfg.landmarkGap - 0.01) {
      this.distanceSinceSpawn = 0;
      this.isAdvancing = false;
      
      this.she.setWalking(false);
      if (this.he) this.he.setWalking(false);

      const currentLandmark = this.landmarks[0]; 

      // 逻辑分支
      if (!this.he) {
        // 男主还没出现，触发男主出场并提问
        this.triggerHeJoin(currentLandmark); 
      } else {
        // 男主已经在场，直接触发答题（由男主提问）
        if (currentLandmark && currentLandmark.data.question) {
          this.askQuestion(currentLandmark.data);
        } else {
          this.spawnLandmark(); // 如果没配题目，直接继续
        }
      }
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
