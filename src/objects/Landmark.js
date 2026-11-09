export default class Landmark {
  constructor(scene, x, y, data) {
    this.scene = scene;
    this.data = data;

    this.sprite = scene.add.image(x, y, data.key);
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setDepth(10);
    this.sprite.setInteractive({ useHandCursor: true });
    this.sprite.on('pointerdown', (pointer, localX, localY, event) => {
      // 阻止事件继续冒泡到场景，避免点地标同时触发推进
      if (event && event.stopPropagation) event.stopPropagation();
      this.onTap();
    });
  }

  onTap() {
    const text = this.scene.add
      .text(this.sprite.x, this.sprite.y - 180, this.data.line, {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 10, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(100);

    this.scene.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 1200,
      onComplete: () => text.destroy(),
    });
  }

  moveBy(dx) {
    this.sprite.x += dx;
  }

  getX() {
    return this.sprite.x;
  }

  isOffScreen() {
    return this.sprite.x < -200;
  }

  destroy() {
    this.sprite.destroy();
  }
}