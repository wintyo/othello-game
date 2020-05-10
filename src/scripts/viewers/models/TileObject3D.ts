import * as THREE from 'three';

interface IColor {
  /** デフォルトカラー */
  default: number;
  /** フォーカス時カラー */
  focus?: number;
}

export default class TileObject3D extends THREE.Object3D {
  /** 平面オブジェクト */
  private plane: THREE.Mesh;
  /** 枠線オブジェクト */
  private frame: THREE.Line;

  constructor(
    private squareSize: number,
    private planeColor: IColor,
    private frameColor: IColor,
  ) {
    super();

    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(squareSize, squareSize),
      new THREE.MeshBasicMaterial({ color: planeColor.default }),
    );

    // 枠線の形状を定義
    const geometry = new THREE.Geometry();
    const offset = 0.01;  // 平面より多少浮かせるオフセット（同じだと映らないことがあるため）
    geometry.vertices.push(new THREE.Vector3( squareSize / 2,  squareSize / 2, offset));
    geometry.vertices.push(new THREE.Vector3( squareSize / 2, -squareSize / 2, offset));
    geometry.vertices.push(new THREE.Vector3(-squareSize / 2, -squareSize / 2, offset));
    geometry.vertices.push(new THREE.Vector3(-squareSize / 2,  squareSize / 2, offset));
    geometry.vertices.push(new THREE.Vector3( squareSize / 2,  squareSize / 2, offset));
    // 枠線を作成
    this.frame = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: frameColor.default }),
    );
    this.plane.add(this.frame);
    // xz平面に描画されるように回転する
    this.plane.rotation.x = -Math.PI / 2;

    this.add(this.plane);
  }
}
