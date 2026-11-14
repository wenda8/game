// import Hero from '../objects/Hero.js';
// import Landmark from '../objects/Landmark.js';
// import { GAME_CONFIG, LANDMARKS } from '../config.js';
// import QuizUI from '../objects/QuizUI.js';
// import AlbumUI from '../objects/AlbumUI.js';
// import DialogueUI from '../objects/DialogueUI.js';

// export default class WalkScene extends Phaser.Scene {
//   constructor() {
//     super('WalkScene');
//   }

//   create() {
//     const cfg = GAME_CONFIG;
//     const groundY = cfg.height - cfg.groundHeight;
//     // background
//     this.bg = this.add.image(0, 0, 'bg2').setOrigin(0,0).setDepth(-10);
//     // 地面
//     this.ground = this.add
//       .tileSprite(0, groundY, cfg.width, cfg.groundHeight, 'ground')
//       .setOrigin(0, 0)
//       .setDepth(0);

//     // 全屏透明输入层（兜底，确保任意位置点击都能触发推进）
//     this.inputLayer = this.add
//       .zone(0, 0, cfg.width, cfg.height)
//       .setOrigin(0, 0)
//       .setDepth(1)
//       .setInteractive();

//     // 人物
//     this.she = new Hero(this, cfg.heroX, groundY + 4, 'she');
//     this.he = null;
//     this.isJoining = false;

//     //相册
//     this.albumUI = new AlbumUI(this);
//     this.dialogueUI = new DialogueUI(this);

//     // 状态
//     this.landmarks = [];
//     this.spawnedCount = 0;
//     this.distanceSinceSpawn = 0;
//     this.isAdvancing = false;

//     // 先生成第一个地标
//     this.spawnLandmark();

//     // 绑定点击：输入层 + 场景级 双保险
//     this.inputLayer.on('pointerdown', () => {
//       console.log('[inputLayer] pointerdown');
//       this.onScreenTap();
//     });

//     this.input.on('pointerdown', (pointer, currentlyOver) => {
//       console.log('[scene] pointerdown, over=', currentlyOver ? currentlyOver.length : 0);
//       // 如果点击的是可交互对象（地标），由地标的 onTap 处理，不推进
//       if (currentlyOver && currentlyOver.length > 0) return;
//       this.onScreenTap();
//     });

//     this.quizUI = new QuizUI(this);
//     this.isAnswering = false; // 👈 新增：是否正在答题的状态锁
//   }

//   spawnLandmark() {
//     if (this.spawnedCount >= LANDMARKS.length) return;
//     if (this.landmarks.length >= GAME_CONFIG.maxOnScreen) return;

//     const cfg = GAME_CONFIG;
//     const groundY = cfg.height - cfg.groundHeight;
//     const data = LANDMARKS[this.spawnedCount];

//     let x = cfg.spawnX;
//     if (this.landmarks.length > 0) {
//       const rightmost = Math.max(...this.landmarks.map((lm) => lm.getX()));
//       x = rightmost + cfg.landmarkGap;
//     }

//     const lm = new Landmark(this, x, groundY, data);
//     this.landmarks.push(lm);
//     this.spawnedCount++;
//     this.distanceSinceSpawn = 0;

//     console.log('[spawn]', data.key, 'at x=', x, 'total spawned=', this.spawnedCount);
//   }

//   triggerHeJoin(landmarkData){
//     const cfg = GAME_CONFIG;
//     const groundY = cfg.height - cfg.groundHeight;
//     this.isJoining = true;

//     this.he = new Hero(this, cfg.width+100, groundY+4, 'he');
//     this.he.setFlipX(false);
//     this.he.setWalking(true);
    
//     const targetX = this.she.sprite.x + 200;
    
//     this.tweens.add({
//       targets: this.he.sprite,
//       x: targetX,
//       duration: 1500,
//       ease: 'Linear',
//       onComplete: () => {
//         // 男主到达，两人停下
//         this.he.setWalking(false);
//         this.she.setWalking(false);

//         this.she.sprite.setDepth(60);
//         this.he.sprite.setDepth(50);


//         this.time.delayedCall(1000, () => {
//           // 触发答题
//           if (landmarkData && landmarkData.data.question) {
//             this.askQuestion(landmarkData.data, () =>{
//               this.he.setFlipX(true);
//               this.isJoining = false;
//               this.spawnLandmark();
//             });
//           } else {
//             this.spawnLandmark();
//           }
          

//         });
        
//       }
//     });
//   }

//   onScreenTap() {
//     if (this.isAdvancing || this.isJoining || this.isAnswering) return;  // 如果正在答题，或者正在移动，直接打断
//     console.log('[onScreenTap] isAdvancing=', this.isAdvancing,
//       'spawned=', this.spawnedCount,
//       'landmarks=', this.landmarks.length);

//     if (this.isAdvancing) return;
//     if (this.spawnedCount >= LANDMARKS.length && this.landmarks.length === 0) return;
//     if (this.isAdvancing || this.isJoining) return;

//     this.isAdvancing = true;
//     this.she.setWalking(true);
//     if (this.he){
//       this.he.setWalking(true);
//     }
//     console.log('[onScreenTap] started advancing');
//   }

//   // 统一出题方法
//   askQuestion(questionData, onCorrectCallback) {
//     this.isAnswering = true; // 锁住屏幕移动
//     this.he.setFlipX(false);
//     this.quizUI.show(questionData, (selectedOptionIndex) => {
//       if (questionData.followUp) {
//         const nextQ = questionData.followUp;
//         const filteredOptions = nextQ.options.filter((_,idx) => idx !== selectedOptionIndex);
//         let newAnswerIndex;
//         if (Array.isArray(nextQ.answer)) {
//           const remainingCorrectText = nextQ.options.find((_,idx) => nextQ.answer.includes(idx) && idx !== selectedOptionIndex);
//           newAnswerIndex = filteredOptions.indexOf(remainingCorrectText);
//         }else{
//           const correctText = nextQ.options[nextQ.answer];
//           newAnswerIndex = filteredOptions.indexOf(correctText);
//         }
        
//         const nextData = {
//           question: nextQ.question,
//           options: filteredOptions,
//           answer: newAnswerIndex
//         }
//         this.askQuestion(nextData, onCorrectCallback);
//       }else{
//         this.isAnswering = false; // 解锁
//         if(onCorrectCallback) onCorrectCallback();
//         this.spawnLandmark();     // 继续生成新地标
//       };
//       // 答错的回调（会在 QuizUI 里直接重启）
//       () => {}
//     }
//     );
//   }

//   update(time, delta) {
//     if (this.isJoining || this.isAnswering) return;
//     if (!this.isAdvancing) return;

//     const cfg = GAME_CONFIG;
//     const dt = Math.min(delta / 1000, 0.05);
//     let moveDist = cfg.walkSpeed * dt;

//     const remaining = cfg.landmarkGap - this.distanceSinceSpawn;
//     if (moveDist > remaining) moveDist = remaining;

//     // 移动地标和背景
//     this.landmarks.forEach((lm) => lm.moveBy(-moveDist));
//     this.bg.x -= moveDist * 1;
//     this.distanceSinceSpawn += moveDist;

//     // 走完一个间距，到达地标
//     if (this.distanceSinceSpawn >= cfg.landmarkGap - 0.01) {
//       this.distanceSinceSpawn = 0;
//       this.isAdvancing = false;
      
//       this.she.setWalking(false);
//       if (this.he) this.he.setWalking(false);

//       const currentLandmark = this.landmarks[0]; 
//       if(currentLandmark) {
//         this.landmarks.shift();
//       }

//       // 逻辑分支
//       if (!this.he) {
//         // 男主还没出现，触发男主出场并提问
//         this.triggerHeJoin(currentLandmark); 
//       } else {
//         // 男主已经在场，直接触发答题（由男主提问）
//         if (currentLandmark && currentLandmark.data.question) {
//           this.askQuestion(currentLandmark.data, () => {
//             this.he.setFlipX(true);
//             this.isJoining = false;
//             this.spawnLandmark();
//           });
//         } else {
//           this.spawnLandmark(); // 如果没配题目，直接继续
//         }
//       }
//     }

//     // 清理出屏地标
//     for (let i = this.landmarks.length - 1; i >= 0; i--) {
//       if (this.landmarks[i].isOffScreen()) {
//         this.landmarks[i].destroy();
//         this.landmarks.splice(i, 1);
//       }
//     }
//   }
// }


// import Hero from '../objects/Hero.js';
// import QuizUI from '../objects/QuizUI.js';
// import DialogueUI from '../objects/DialogueUI.js';
// import AlbumUI from '../objects/AlbumUI.js';
// import { GAME_CONFIG, LANDMARKS } from '../config.js';
// import { GameStore } from '../GameStore.js';

// export default class WalkScene extends Phaser.Scene {
//   constructor() {
//     super('WalkScene');
//   }

//   init(data) {
//     this.landmarkIndex = data && data.index !== undefined ? data.index : 0;
//   }

//   create() {
//     const cfg = GAME_CONFIG;
//     const groundY = cfg.height - cfg.groundHeight;

//     const currentData = LANDMARKS[this.landmarkIndex];
//     let bgKey = (currentData && currentData.bg) ? currentData.bg : 'bg'; 

//     // 背景和地面
//     this.bg = this.add.image(0, 0, bgKey).setOrigin(0, 0).setDepth(-10).setDisplaySize(cfg.width, cfg.height);
//     this.ground = this.add.tileSprite(0, groundY, cfg.width, cfg.groundHeight, 'ground').setOrigin(0, 0).setDepth(0);

//     // UI
//     this.albumUI = new AlbumUI(this);
//     this.quizUI = new QuizUI(this);
//     this.dialogueUI = new DialogueUI(this);
//     this.isAnswering = false;

//     if (this.landmarkIndex >= LANDMARKS.length) {
//       this.showGameEnd();
//       return;
//     }

//     this.cameras.main.fadeIn(600, 0, 0, 0);

//     // 地标放中间偏右
//     this.landmark = this.add.image(cfg.width * 0.7, groundY, currentData.file).setOrigin(0.5, 1).setDepth(10);
//     if (currentData.scale) this.landmark.setScale(currentData.scale);

//     // ==========================================
//     // 第一幕的专属开场：女主先出场，男主在右侧外等候
//     // ==========================================
//     this.she = new Hero(this, -150, groundY + 4, 'she');
//     this.she.sprite.setDepth(50);
    
//     if (this.landmarkIndex === 0) {
//       // 第一幕，男主在屏幕右侧外等待
//       this.he = new Hero(this, cfg.width + 150, groundY + 4, 'he');
//       this.he.sprite.setDepth(40);
//     } else {
//       // 第二幕及以后，男主跟着女主一起在左侧外准备进场
//       this.he = new Hero(this, -50, groundY + 4, 'he');
//       this.he.sprite.setDepth(40);
//     }

//     this.playEnterAnimation(currentData);
//   }

  
//   // 入场动画
//   playEnterAnimation(currentData) {
//     const centerX = GAME_CONFIG.width * 0.35; 
//     const hecenterX = centerX + 90;

//     if (this.landmarkIndex === 0) {
//       // 第一幕：女主站定后，男主从右侧走进来
//       // 女主进场
//       this.she.setWalking(true);
//       this.tweens.add({
//         targets: this.she.sprite,
//         x: centerX,
//         duration: 2000,
//         ease: 'Linear',
//         onComplete: () => {
//           this.she.setWalking(false);
//           this.playHeEnterFirstScene(currentData, centerX);
//         }
//       });
//     } else {
//       // 第二幕及以后：一起
//       this.he.setWalking(true);
//       this.she.setWalking(true);
      
//       this.he.setFlipX(true); 
//       this.tweens.add({
//         targets: this.he.sprite,
//         x: centerX + 200, // 停在女主右边
//         duration: 2000,
//         ease: 'Linear',
//         onComplete: () => {
//           this.she.setWalking(false);
//           this.he.setWalking(false);
//           this.he.setFlipX(true); // 转向女主
//           this.triggerInteraction(currentData);
//         }
//       });
//       }

//       this.tweens.add({
//         targets: this.she.sprite,
//         x: centerX,
//         duration: 2000,
//         ease: 'Linear',
//       });
//     }


//   // 第一幕男主从右边出场的专属逻辑
//   playHeEnterFirstScene(currentData, centerX) {
//     this.he.setWalking(true);
//     this.he.setFlipX(false);
//     this.tweens.add({
//       targets: this.he.sprite,
//       x: centerX + 200,
//       duration: 1500,
//       ease: 'Linear',
//       onComplete: () => {
//         this.he.setWalking(false);
//         // 到达后立即触发互动（男主发问）
//         this.triggerInteraction(currentData);
//       }
//     });
//   }


//   // 触发互动
//   triggerInteraction(currentData, onCorrectCallback) {
//     this.isAnswering = true;

//     if (currentData.dialogue) {
//       this.he.setFlipX(false)
//       this.dialogueUI.show(currentData.dialogue, () => {
//         this.isAnswering = false;
//         if (currentData.photo) this.albumUI.addPhoto(currentData.photo);
//         this.playExitAnimation();
//       });
//     } else if (currentData.question) {
//       this.he.setFlipX(false)
//       this.time.delayedCall(400, () => {
//         this.quizUI.show(currentData, 
//           (selectedidx) => {
//             if (currentData.followUp) {
//               const nextQ = currentData.followUp;
//               const filteredOptions = nextQ.options.filter((_,idx) => idx !== selectedidx);
//               let newAnswerIndex;
//               if (Array.isArray(nextQ.answer)) {
//                 const remainingCorrectText = nextQ.options.find((_,idx) => nextQ.answer.includes(idx) && idx !== selectedidx);
//                 newAnswerIndex = filteredOptions.indexOf(remainingCorrectText);
//               }else{
//                 const correctText = nextQ.options[nextQ.answer];
//                 newAnswerIndex = filteredOptions.indexOf(correctText);
//               }
              
//               const nextData = {
//                 question: nextQ.question,
//                 options: filteredOptions,
//                 answer: newAnswerIndex
//               }
//               this.triggerInteraction(nextData, onCorrectCallback);
//             }else{
//               this.isAnswering = false;
//               if(onCorrectCallback) onCorrectCallback();
//               this.playExitAnimation();
//             }
//           },
//           () => {
//             this.cameras.main.fadeOut(500, 0, 0, 0);
//             this.cameras.main.once('camerafadeoutcomplete', () => {
//               // this.scene.restart({ index: 0 });
//               this.resetAndRestart();
//             });
//           }
//         );
//       });
//     } else {
//       this.isAnswering = false;
//       this.playExitAnimation();
//     }
//   }

//   resetAndRestart(){
//     this.isAnswering = true;
//     GameStore.photos = [];

//   }

//   // 退场动画（两人一起往右走）
//   playExitAnimation() {
//     this.isAnswering = true; 

//     const targets = [this.she.sprite];
    
//     // 两人一起朝右走
//     this.she.setWalking(true);
//     this.she.setFlipX(false); 

//     if (this.he) {
//       this.he.setWalking(true);
//       this.he.setFlipX(true);
//       targets.push(this.he.sprite);
//     }

//     this.tweens.add({
//       targets: targets,
//       x: '+=600',
//       duration: 2000,
//       ease: 'Linear',
//       onComplete: () => {
//         this.cameras.main.fadeOut(600, 0, 0, 0);
//         this.cameras.main.once('camerafadeoutcomplete', () => {
//           this.scene.restart({ index: this.landmarkIndex + 1 });
//         });
//       }
//     });
//   }

//   showGameEnd() {
//     this.cameras.main.fadeIn(1000, 0, 0, 0);
//     const { width, height } = this.scale;
//     this.add.text(width / 2, height / 2, '旅途结束\n感谢游玩！', {
//       fontSize: '32px', color: '#fff', align: 'center', backgroundColor: '#000000aa', padding: { x: 20, y: 20 }
//     }).setOrigin(0.5).setDepth(10000);
//   }
// }



import Hero from '../objects/Hero.js';
import QuizUI from '../objects/QuizUI.js';
import DialogueUI from '../objects/DialogueUI.js';
import AlbumUI from '../objects/AlbumUI.js';
import { GAME_CONFIG, LANDMARKS } from '../config.js';
import { GameStore } from '../GameStore.js';

export default class WalkScene extends Phaser.Scene {
  constructor() {
    super('WalkScene');
  }

  init(data) {
    this.landmarkIndex = data && data.index !== undefined ? data.index : 0;
  }

  create() {
    const cfg = GAME_CONFIG;
    const groundY = cfg.height - cfg.groundHeight;

    const currentData = LANDMARKS[this.landmarkIndex];
    let bgKey = (currentData && currentData.bg) ? currentData.bg : 'bg'; 

    // 背景和地面
    this.bg = this.add.image(0, 0, bgKey).setOrigin(0, 0).setDepth(-10).setDisplaySize(cfg.width, cfg.height);
    this.ground = this.add.tileSprite(0, groundY, cfg.width, cfg.groundHeight, 'ground').setOrigin(0, 0).setDepth(0);

    // UI
    this.albumUI = new AlbumUI(this);
    this.quizUI = new QuizUI(this);
    this.dialogueUI = new DialogueUI(this);
    this.isAnswering = false;

    if (this.landmarkIndex >= LANDMARKS.length) {
      this.showGameEnd();
      return;
    }

    this.cameras.main.fadeIn(600, 0, 0, 0);

    // 地标放中间偏右
    this.landmark = this.add.image(cfg.width * 0.7, groundY, currentData.file).setOrigin(0.5, 1).setDepth(10);
    if (currentData.scale) this.landmark.setScale(currentData.scale);

    // 人物初始位置
    this.she = new Hero(this, -250, groundY + 4, 'she');
    this.she.sprite.setDepth(50);
    
    if (this.landmarkIndex === 0) {
      this.he = new Hero(this, cfg.width + 150, groundY + 4, 'he');
      this.he.sprite.setDepth(40);
    } else {
      this.he = new Hero(this, -150, groundY + 4, 'he');
      this.he.sprite.setDepth(40);
    }

    // 👇 初始化点击状态机
    this.step = 0; 
    this.isWaitingForTap = false; 

    // 延迟 0.5 秒，防止上一幕结束时的点击穿透
    this.time.delayedCall(500, () => {
      this.isWaitingForTap = true;
      this.showHint('点击屏幕开始');
    });

    // 绑定场景点击事件
    this.input.on('pointerdown', () => {
      if (!this.isWaitingForTap || this.isAnswering) return;
      this.isWaitingForTap = false; // 锁定，防止连点
      this.step++;
      this.updateStep(currentData);
    });
  }

  // 点击状态机：控制剧情一步步走
  updateStep(currentData) {
    switch (this.step) {
      case 1:
        // 第一步点击：人物开始进场
        this.hideHint();
        this.playEnterAnimation(currentData);
        break;
        
      case 2:
        // 第二步点击（进场结束后）：触发对话或提问
        this.triggerInteraction(currentData);
        break;

      case 3:
        // 第三步点击（互动结束后）：人物退场
        this.playExitAnimation();
        break;

      default:
        break;
    }
  }

  showHint(text) {
    if (this.hintTxt) this.hintTxt.destroy();
    const { width, height} = this.scale;
    const hintY = height - 20;
    this.hintTxt = this.add.text(GAME_CONFIG.width / 2, hintY, text, {
      fontSize: '20px', color: '#ffffff', backgroundColor: '#000000aa', padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setDepth(100);
    this.tweens.add({ targets: this.hintTxt, alpha: 0.3, yoyo: true, repeat: -1, duration: 800 });
  }

  hideHint() {
    if (this.hintTxt) {
      this.hintTxt.destroy();
      this.hintTxt = null;
    }
  }

  // 入场动画
  playEnterAnimation(currentData) {
    const centerX = GAME_CONFIG.width * 0.35; 

    if (this.landmarkIndex === 0) {
      // 第一幕
      this.she.setWalking(true);
      this.tweens.add({
        targets: this.she.sprite,
        x: centerX,
        duration: 2000,
        ease: 'Linear',
        onComplete: () => {
          this.she.setWalking(false);
          this.playHeEnterFirstScene(currentData, centerX);
        }
      });
    } else {
      // 第二幕及以后
      this.he.setWalking(true);
      this.she.setWalking(true);
      
      this.he.setFlipX(true); 
      this.tweens.add({
        targets: this.he.sprite,
        x: centerX + 200,
        duration: 2000,
        ease: 'Linear',
        onComplete: () => {
          this.she.setWalking(false);
          this.he.setWalking(false);
          // 👇 进场结束，允许玩家点击开始互动
          this.isWaitingForTap = true;
          this.showHint('点击屏幕继续...');
        }
      });

      this.tweens.add({
        targets: this.she.sprite,
        x: centerX,
        duration: 2000,
        ease: 'Linear',
      });
    }
  }

  // 第一幕男主从右边出场的专属逻辑
  playHeEnterFirstScene(currentData, centerX) {
    this.he.setWalking(true);
    this.he.setFlipX(false);
    this.tweens.add({
      targets: this.he.sprite,
      x: centerX + 200,
      duration: 1500,
      ease: 'Linear',
      onComplete: () => {
        this.he.setWalking(false);
        // 👇 进场结束，允许玩家点击开始互动
        this.isWaitingForTap = true;
        this.showHint('点击屏幕继续...');
      }
    });
  }

  // 触发互动
  triggerInteraction(currentData, onCorrectCallback) {
    this.hideHint();
    this.isAnswering = true;

    if (currentData.dialogue) {
      this.he.setFlipX(false);
      this.dialogueUI.show(currentData.dialogue, () => {
        if (currentData.dialogue) {
          
          if (currentData.photo) this.albumUI.addPhoto(currentData.photo);
          if (currentData.question) {
            this.time.delayedCall(300, () => {
              this.showQuiz(currentData, onCorrectCallback);
            });
          }else{
            this.isAnswering = false;
            this.isWaitingForTap = true;
            this.showHint('点击屏幕继续...');
          }
        }
      });
    } else if (currentData.question) {
      this.he.setFlipX(false);
      this.showQuiz(currentData, onCorrectCallback);
    } else {
      this.isAnswering = false;
      // 没配题也没对话，直接允许点击离开
      this.isWaitingForTap = true;
      this.showHint('点击屏幕继续...');
    }
  }

  showQuiz(currentData, onCorrectCallback) {
    this.time.delayedCall(400, () => {
        this.quizUI.show(currentData, 
          (selectedidx) => {
            if (currentData.followUp) {
              const nextQ = currentData.followUp;
              const filteredOptions = nextQ.options.filter((_,idx) => idx !== selectedidx);
              let newAnswerIndex;
              if (Array.isArray(nextQ.answer)) {
                const remainingCorrectText = nextQ.options.find((_,idx) => nextQ.answer.includes(idx) && idx !== selectedidx);
                newAnswerIndex = filteredOptions.indexOf(remainingCorrectText);
              }else{
                const correctText = nextQ.options[nextQ.answer];
                newAnswerIndex = filteredOptions.indexOf(correctText);
              }
              
              const nextData = {
                question: nextQ.question,
                options: filteredOptions,
                answer: newAnswerIndex
              }
              this.triggerInteraction(nextData, onCorrectCallback);
            }else{
              this.isAnswering = false;
              if(onCorrectCallback) onCorrectCallback();
              
              // 👇 答题结束，允许点击退场
              this.isWaitingForTap = true;
              this.showHint('点击屏幕继续...');
            }
          },
          () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
              this.resetAndRestart();
            });
          }
        );
      });
  }

  resetAndRestart() {
    this.isAnswering = true;
    GameStore.photos = []; // 清空全局相册
    this.scene.stop(); 
    this.scene.start('WalkScene', { index: 0 });
  }

  // 退场动画（两人一起往右走）
  playExitAnimation() {
    this.hideHint();
    this.isAnswering = true; 
    this.isWaitingForTap = false; // 彻底锁住，不让点

    const targets = [this.she.sprite];
    
    // 两人一起朝右走
    this.she.setWalking(true);
    this.she.setFlipX(false); 

    if (this.he) {
      this.he.setWalking(true);
      this.he.setFlipX(true);
      targets.push(this.he.sprite);
    }

    this.tweens.add({
      targets: targets,
      x: '+=600',
      duration: 2000,
      ease: 'Linear',
      onComplete: () => {
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.restart({ index: this.landmarkIndex + 1 });
        });
      }
    });
  }

  showGameEnd() {
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2, '旅途结束\n感谢游玩！', {
      fontSize: '32px', color: '#fff', align: 'center', backgroundColor: '#000000aa', padding: { x: 20, y: 20 }
    }).setOrigin(0.5).setDepth(10000);
  }
}