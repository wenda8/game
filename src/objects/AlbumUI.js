// src/objects/AlbumUI.js
import { GameStore } from "../GameStore";
export default class AlbumUI {
  constructor(scene) {
    this.scene = scene;
    this.collectedPhotos = GameStore.photos;
    this.isOpen = false;
    this.albumContainer = null;

    const { width, height } = scene.scale;

    // ==========================================
    // 1. 右上角常驻相册按钮 (层级极高 9990)
    // ==========================================
    // 按钮背景
    this.btnBg = scene.add.circle(width - 40, 40, 25, 0xffffff, 0.9)
      .setStrokeStyle(3, 0x333333)
      .setInteractive({ useHandCursor: true })
      .setDepth(9990)
      .setScrollFactor(0); // 保证它不随相机移动
    
    // 按钮图标（这里用文字代替，如果你有图片可以换成 image）
    this.btnTxt = scene.add.text(width - 40, 40, '📷', {
      fontSize: '24px'
    }).setOrigin(0.5).setDepth(9991).setScrollFactor(0);

    // 点击相册按钮
    this.btnBg.on('pointerdown', () => {
      if (this.isOpen) return;
      this.openAlbum();
    });
  }

  // 收集照片的方法
  addPhoto(photoKey) {
    if (!this.collectedPhotos.includes(photoKey)) {
      this.collectedPhotos.push(photoKey);
      console.log('📸 收集到新照片:', photoKey);
      
      // 可选：弹出一个小提示“获得新照片”
      const { width, height } = this.scene.scale;
      const toast = this.scene.add.text(width / 2, height / 2, '📸 获得新照片！', {
        fontSize: '24px', color: '#fff', backgroundColor: '#000000aa', padding: { x: 20, y: 10 }
      }).setOrigin(0.5).setDepth(10000);
      
      this.scene.tweens.add({
        targets: toast, y: height / 2 - 50, alpha: 0,
        duration: 1500, onComplete: () => toast.destroy()
      });
    }
  }

  // 打开相册
  openAlbum() {
    this.isOpen = true;
    // 暂停游戏场景（如果正在走路或计时）

    const { width, height } = this.scene.scale;

    // 1. 全屏黑色遮罩 (层级 9998)
    const mask = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0).setDepth(9998).setInteractive();
    
    // 2. 容器
    this.albumContainer = this.scene.add.container(0, 0).setDepth(9999);


    // 3. 关闭按钮 (右上角)
    const closeBtn = this.scene.add.text(width - 40, 40, '❌', { fontSize: '30px' })
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    closeBtn.on('pointerdown', () => this.closeAlbum());

    // 4. 标题
    const title = this.scene.add.text(width / 2, 60, '回忆相册', { 
      fontSize: '24px', color: '#fff', fontStyle: 'bold' 
    }).setOrigin(0.5);

    this.albumContainer.add([mask, title, closeBtn]);

    // 5. 排列照片
    const startX = width / 4;
    const startY = 160;
    const gapX = width / 2;
    const gapY = 180;

    if (this.collectedPhotos.length === 0) {
      const emptyTxt = this.scene.add.text(width / 2, height / 2, '还没有收集到照片哦~\n去多逛逛吧！', { 
        fontSize: '20px', color: '#ccc', align: 'center' 
      }).setOrigin(0.5);
      this.albumContainer.add(emptyTxt);
      return;
    }

    // 遍历渲染照片
    this.collectedPhotos.forEach((photoKey, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = startX + col * gapX;
      const y = startY + row * gapY;

      // 照片相框
      const frame = this.scene.add.rectangle(x, y, 140, 100, 0xffffff).setStrokeStyle(4, 0xdda0dd);
      
      // 如果你在 BootScene 加载了真实图片：
      let img;
      if (this.scene.textures.exists(photoKey)) {
        img = this.scene.add.image(x, y, photoKey).setDisplaySize(130, 90);
      } else {
        // 没图时用文字暂代
        img = this.scene.add.text(x, y, `[照片]\n${photoKey}`, { fontSize: '14px', color: '#333', align: 'center' }).setOrigin(0.5);
      }

      this.albumContainer.add([frame, img]);
    });
  }

  // 关闭相册
  closeAlbum() {
    this.isOpen = false;
    if (this.albumContainer) {
      this.albumContainer.destroy();
      this.albumContainer = null;
    }

  }
}