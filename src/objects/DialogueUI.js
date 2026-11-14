// src/objects/DialogueUI.js
export default class DialogueUI {
constructor(scene) {
this.scene = scene;
}

show(dialogueList, onComplete) {
this.isWaitingForTap = false;
const { width, height } = this.scene.scale;

const mask = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0).setOrigin(0).setDepth(5998).setInteractive();

let currentIndex = 0;
const bubbleContainer = this.scene.add.container(0, 0).setDepth(5999);

const showNext = () => {
bubbleContainer.removeAll(true); // 清空上一句气泡

if (currentIndex >= dialogueList.length) {
// 对话结束
mask.destroy();
bubbleContainer.destroy();
onComplete();
return;
}

const line = dialogueList[currentIndex];
const isHe = line.speaker === 'he';

// 气泡位置
const xPos = isHe ? width * 0.7 : width * 0.27;
const yPos = isHe ? height * 0.57 : height * 0.55;

// 这里复用你之前的气泡绘制逻辑
const bg = this.scene.add.graphics();
bg.fillStyle(isHe ? 0xffffff : 0xfff0f5, 1);
bg.lineStyle(4, 0x333333, 1);

const txt = this.scene.add.text(0, 0, line.text, {
fontSize: '18px', color: '#333', fontStyle: 'bold', wordWrap: { width: 200 }, align: 'center', padding: { top: 10, bottom: 10 }
}).setOrigin(0.5);

const bgW = txt.width + 40;
const bgH = txt.height + 40;

bg.fillRoundedRect(-bgW/2, -bgH/2, bgW, bgH, 20);
bg.strokeRoundedRect(-bgW/2, -bgH/2, bgW, bgH, 20);

// 画个小尾巴
const tailY = bgH / 2;
bg.fillTriangle(-15, tailY-5, 15, tailY-5, 0, tailY+20);

const bubble = this.scene.add.container(xPos, yPos, [bg, txt]);
bubbleContainer.add(bubble);

currentIndex++;

// 延迟解锁防误触
this.isWaitingForTap = false;
this.scene.time.delayedCall(300, () => { this.isWaitingForTap = true; });
};

// 点击遮罩进入下一句
mask.on('pointerdown', () => {
if (!this.isWaitingForTap) return;
this.isWaitingForTap = false;
showNext();
});

showNext(); // 立即显示第一句

}
}