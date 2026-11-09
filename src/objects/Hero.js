export default class Hero {
  constructor(scene, x, y) {
    this.scene = scene;

    if (!scene.anims.exists('hero-walk')) {
      scene.anims.create({
        key: 'hero-walk',
        frames: scene.anims.generateFrameNumbers('hero', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1,
      });
    }
    if (!scene.anims.exists('hero-idle')) {
      scene.anims.create({
        key: 'hero-idle',
        frames: [{ key: 'hero', frame: 0 }],
        frameRate: 1,
        repeat: -1,
      });
    }

    this.sprite = scene.add.sprite(x, y, 'hero');
    this.sprite.setOrigin(0.5, 1);
    this.sprite.setDepth(50);
    this.sprite.play('hero-idle');
  }

  setWalking(walking) {
    const target = walking ? 'hero-walk' : 'hero-idle';
    const current = this.sprite.anims.currentAnim && this.sprite.anims.currentAnim.key;
    if (current !== target) {
      this.sprite.play(target, true);
    }
  }
}