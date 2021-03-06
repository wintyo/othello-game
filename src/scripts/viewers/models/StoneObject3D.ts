import * as THREE from 'three';
import { COLORS } from '~/constants/Apps';

import { ePlayerColor } from '~/enums/Apps';

export default class StoneObject3D extends THREE.Object3D {
  public pos: { x: number, y: number } | null = null;

  constructor(
    diameter: number,
    height: number,
  ) {
    super();
    const radius = diameter / 2;
    const halfHeight = height / 2;

    // 白石
    const cylinderWhite = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, halfHeight, 32),
      new THREE.MeshBasicMaterial({ color: COLORS.WHITE }),
    );
    cylinderWhite.position.set(0, halfHeight / 2, 0);
    this.add(cylinderWhite);

    // 黒石
    const cylinderBlack = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, halfHeight, 32),
      new THREE.MeshBasicMaterial({ color: COLORS.BLACK }),
    );
    cylinderBlack.position.set(0, -halfHeight / 2, 0);
    this.add(cylinderBlack);
  }

  /**
   * 回転させるアニメーション
   */
  turnAnimation() {
    return new Promise((resolve) => {
      const numFrame = 30;
      const turnSpeed = Math.PI / numFrame;
      let frame = 0;
      const turnStoneFunc = () => {
        this.rotation.x += turnSpeed;
        frame += 1;
        if (frame < numFrame) {
          window.requestAnimationFrame(turnStoneFunc);
          return;
        }
        resolve();
      };
      window.requestAnimationFrame(turnStoneFunc);
    });
  }

  /**
   * 透明度の設定
   * @param opacity - 透明度
   */
  setOpacity(opacity: number) {
    // @ts-ignore
    this.opacity = opacity;
    this.children.forEach((child) => {
      // @ts-ignore
      const material = child.material;
      material.transparent = true;
      material.opacity = opacity;
    });
  }

  /**
   * 指定した色が上に向くようにセットする
   * @param color - 上にしたい色
   */
  setColor(color: ePlayerColor) {
    if (color === ePlayerColor.Black) {
      this.rotation.x = Math.PI;
      return;
    }
    this.rotation.x = 0;
  }
}
