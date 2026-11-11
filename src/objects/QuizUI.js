// src/objects/QuizUI.js
export default class QuizUI {
  constructor(scene) {
    this.scene = scene;
  }

  show(data, onCorrect, onWrong) {
    const { width, height } = this.scene.scale;
    
    // 半透明遮罩
    const mask = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0).setDepth(9998);
    
    // 面板
    const panel = this.scene.add.rectangle(width / 2, height - 150, width - 40, 250, 0xffffff).setDepth(9999).setStrokeStyle(2, 0x000000);
    
    // 题目文字
    this.scene.add.text(width / 2, height - 230, data.question, {
      fontSize: '20px', color: '#333', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10000);

    // 选项
    data.options.forEach((opt, idx) => {
      const btnY = height - 160 + idx * 45;
      const btn = this.scene.add.rectangle(width / 2, btnY, 200, 35, 0x4a6fa5).setDepth(10000).setInteractive({ useHandCursor: true });
      const txt = this.scene.add.text(width / 2, btnY, opt, { fontSize: '16px', color: '#fff' }).setOrigin(0.5).setDepth(10001);
      
      btn.on('pointerdown', () => {
        btn.disableInteractive();
        if (idx === data.answer) {
          btn.setFillStyle(0x2ecc71); // 绿
          this.scene.time.delayedCall(300, () => {
            mask.destroy(); panel.destroy(); txt.destroy();
            // 注意：这里要把 btn 也销毁掉
            btn.destroy();
            onCorrect();
          });
        } else {
          btn.setFillStyle(0xe74c3c); // 红
          txt.setText('答错了，你死了！');
          this.scene.time.delayedCall(1000, () => this.scene.scene.restart());
        }
      });
    });
  }
}