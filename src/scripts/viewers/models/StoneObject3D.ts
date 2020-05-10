import * as THREE from 'three';
import { COLORS } from '~/constants/Apps';

export default class StoneObject3D extends THREE.Object3D {
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
   * 指定した色が上に向くようにセットする
   * @param color - 上にしたい色
   */
  setColor(color: number) {
    if (color === 1) {
      this.rotation.x = Math.PI;
      return;
    }
    this.rotation.x = 0;
  }
}
