// src/objects/QuizUI.js
import { CORRECT,WRONG } from "../config";
export default class QuizUI {
  constructor(scene) {
    this.scene = scene;
    this.mask = null;
    this.heBubble = null;
    this.sheBubble = null;
    this.isWaitingForTap = false;
  }

  show(data, onCorrect, onWrong) {
    const { width, height } = this.scene.scale;
    this.isWaitingForTap = true;

    // 半透明遮罩
    this.mask = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0).setOrigin(0).setDepth(998).setInteractive();
    
    // 男生提问
    const heTxt = this.scene.add.text(0, 0, data.question, {
      fontSize: '20px', color: '#333', fontStyle: 'bold', wordWrap:{width: width-80}, align: 'center', padding:{top:5, bottom:5}
    }).setOrigin(0.47).setDepth(6000);

    const hePaddingX = 20;
    const hePaddingY = 20;
    const heBgWidth = heTxt.width + hePaddingX*2;
    const heBgHeight = heTxt.height + hePaddingY*2;

    this.heBubble = this.scene.add.container(width*0.7, height * 0.57).setDepth(5999);

    const heBg = this.scene.add.graphics();
    heBg.fillStyle(0xffffff, 1);
    heBg.lineStyle(4, 0x333333, 1);
    heBg.fillRoundedRect(-heBgWidth/2, -heBgHeight/2, heBgWidth, heBgHeight, 20);
    heBg.strokeRoundedRect(-heBgWidth/2, -heBgHeight/2, heBgWidth, heBgHeight, 20);

    const tailY = heBgHeight / 2;
    const tailX = heBgWidth*0.1;
    heBg.fillTriangle(tailX-15, tailY-5, tailX+15, tailY-5, tailX, tailY+25);
    heBg.strokeTriangle(tailX-15, tailY-5, tailX+15, tailY-5, tailX, tailY+25);

    heBg.fillStyle(0xffffff, 1);
    heBg.fillRect(tailX-13, tailY-20, 26, 10);
    this.heBubble.add([heBg, heTxt]);

    //监听点击
    this.mask.once('pointerdown', () => {
      if (!this.isWaitingForTap) return;
      this.isWaitingForTap = false;
      this.showSheBubble(data, onCorrect);
    });
  }


    // 女生回答
  showSheBubble(data, onCorrect){
    const { width, height } = this.scene.scale;

    this.sheBubble = this.scene.add.container(width *0.27, height * 0.55).setDepth(5999);
    this.sheBubble.setScale(0);

    let maxOptionWidth = 0;
    const optionTexts = [];
    const lineHeight = 20;
    const gap = 10;

    data.options.forEach((opt, idx) => {
      const tempTxt = this.scene.add.text(0,0,opt,{fontSize:'18px',color:'#333',wordWrap:{width:250}});
      if (tempTxt.width > maxOptionWidth) maxOptionWidth = tempTxt.width;
      optionTexts.push(tempTxt);
      tempTxt.destroy();
    });


    const sheBgWidth = Math.max(maxOptionWidth+60, 40);
    const totalOptionsHeight = data.options.length * lineHeight + (data.options.length - 1) * gap;
    const sheBgHeight = totalOptionsHeight + 40;


    const sheBg = this.scene.add.graphics();
    sheBg.fillStyle(0xfff0f5, 1);
    sheBg.lineStyle(4, 0x333333, 1);
    sheBg.fillRoundedRect(-sheBgWidth/2, -sheBgHeight/2, sheBgWidth, sheBgHeight, 20);
    sheBg.strokeRoundedRect(-sheBgWidth/2, -sheBgHeight/2, sheBgWidth, sheBgHeight, 20);

    const sheTailY = sheBgHeight / 2;
    const sheTtailX = -sheBgWidth*0.1;
    sheBg.fillTriangle(sheTtailX-15, sheTailY-5, sheTtailX+15, sheTailY-5, sheTtailX, sheTailY+25);
    sheBg.strokeTriangle(sheTtailX-15, sheTailY-5, sheTtailX+15, sheTailY-5, sheTtailX, sheTailY+25);
    this.sheBubble.add(sheBg);
    
    
    //气泡选项
    const startY = -totalOptionsHeight/2 + lineHeight/2;
    data.options.forEach((opt, idx) => {
      const btnY = startY + idx * (lineHeight + gap);

      const btnTxt = this.scene.add.text(-sheBgWidth/2+30, btnY, opt, {fontSize:'18px', fontStyle: 'bold',color:'#333',wordWrap:{width:250}, padding:{top:5, bottom:5}}).setOrigin(0, 0.5);

      const hitArea = this.scene.add.rectangle(0, btnY, sheBgWidth-20, lineHeight, 0x000000, 0).setInteractive({useHandCursor:true});
      this.sheBubble.add([btnTxt, hitArea]);

      hitArea.on('pointerdown', () => {
        this.sheBubble.each(child => {if(child.input) child.disableInteractive();});

        let isCorrect = false;
        if (Array.isArray(data.answer)){
          isCorrect = data.answer.includes(idx);
        }else{
          isCorrect = (idx === data.answer);
        }
        // this.scene.tweens.add({targets: btnTxt, scale: 0.95, duration: 50, yoyo:true});
        if (isCorrect) {
          btnTxt.setColor('#2ecc71'); // 绿
          btnTxt.setText('✅'+opt);
          this.scene.time.delayedCall(300, () => {
            if (this.sheBubble) this.sheBubble.destroy();
            const reply = Phaser.Utils.Array.GetRandom(CORRECT);
            this.showHeReply(reply, () => {
              this.cleanUp();
            // if(optionTexts){optionTexts.forEach(t => t.destroy());}
              onCorrect(idx);
            })
          });
        } else {
          btnTxt.setColor('#e74c3c'); // 红
          btnTxt.setText('❌答错了，你完蛋了！');
          this.scene.time.delayedCall(1000, () => {
            if (this.sheBubble) this.sheBubble.destroy();
            const reply = Phaser.Utils.Array.GetRandom(WRONG);
            this.showHeReply(reply, () => {
              this.cleanUp();
              this.scene.scene.restart();});
            })
        }
      });
    });
    this.scene.tweens.add({
      targets: this.sheBubble,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
  }

  showHeReply(replyText, onComplete){
    const { width, height } = this.scene.scale;
    if(this.heBubble) this.heBubble.destroy(); 
    const heTxt = this.scene.add.text(0, 0, replyText, {
      fontSize: '20px', color: '#333', fontStyle: 'bold', wordWrap:{width: width-80}, align: 'center', padding:{top:5, bottom:5}
    }).setOrigin(0.47);
    const heBgWidth = heTxt.width + 40;
    const heBgHeight = heTxt.height + 40;
    this.heBubble = this.scene.add.container(width*0.7, height * 0.57).setDepth(9999);

    const heBg = this.scene.add.graphics();
    heBg.fillStyle(0xffffff, 1);
    heBg.lineStyle(4, 0x333333, 1);
    heBg.fillRoundedRect(-heBgWidth/2, -heBgHeight/2, heBgWidth, heBgHeight, 20);
    heBg.strokeRoundedRect(-heBgWidth/2, -heBgHeight/2, heBgWidth, heBgHeight, 20);

    const tailY = heBgHeight / 2;
    const tailX = heBgWidth*0.1;
    heBg.fillTriangle(tailX-15, tailY-5, tailX+15, tailY-5, tailX, tailY+25);
    heBg.strokeTriangle(tailX-15, tailY-5, tailX+15, tailY-5, tailX, tailY+25);

    heBg.fillStyle(0xffffff, 1);
    heBg.fillRect(tailX-13, tailY-20, 26, 10);
    this.heBubble.add([heBg, heTxt]);

    this.heBubble.setScale(0);
    this.scene.tweens.add({
      targets: this.heBubble,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });

    this.scene.time.delayedCall(1500,( )=>{
      if (onComplete) onComplete();
    })
  }
  cleanUp(){
    if(this.mask) this.mask.destroy();
    if(this.heBubble) this.heBubble.destroy(); 
    if(this.sheBubble) this.sheBubble.destroy();
  }
}