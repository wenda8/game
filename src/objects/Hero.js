export default class Hero {
  constructor(scene, x, y, textureKey) {
    this.scene = scene;
    this.textureKey = textureKey;

    // const walkAnimKey = '${textureKey}-walk';
    // const idleAnimKey = '${textureKey}-idle';

    // if (!scene.anims.exists(walkAnimKey)) {
    //   scene.anims.create({
    //     key: walkAnimKey,
    //     frames: scene.anims.generateFrameNumbers(textureKey, { start: 0, end: 3 }),
    //     frameRate: 8,
    //     repeat: -1,
    //   });
    // }
    // if (!scene.anims.exists(idleAnimKey)) {
    //   scene.anims.create({
    //     key: idleAnimKey,
    //     frames: [{ key: textureKey, frame: 0 }],
    //     frameRate: 1,
    //     repeat: -1,
    //   });
    // }

    this.sprite = scene.add.sprite(x, y, textureKey);
    this.sprite.setOrigin(0.5, 1);

    const targetHeight = scene.scale.height / 3;
    this.sprite.setScale(targetHeight / this.sprite.height);
    // this.sprite.setScale(0.2);
    this.sprite.setDepth(50);
    this.sprite.play(`${this.textureKey}-idle`);
  }

  setWalking(walking) {
    const animKey = walking ? `${this.textureKey}-walk` : `${this.textureKey}-idle`;
    const currentAnim = this.sprite.anims.currentAnim;
    if (!currentAnim || currentAnim.key !== animKey) {
      this.sprite.play(animKey, true);
    }
  }

  setFlipX(isFlipped){
    this.sprite.setFlipX(isFlipped);
  }
}