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
  /** 上に置かれているオブジェクト */
  private puttedObject?: THREE.Object3D;

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

  /** タイルオブジェクトの取得 */
  getPlane() {
    return this.plane;
  }

  /**
   * タイルの上にオブジェクトを置く
   * @param object3d - オブジェクト
   */
  putObject(object3d: THREE.Object3D) {
    this.removeObject();
    this.puttedObject = object3d;
    this.add(this.puttedObject);
  }

  /**
   * タイルの上のオブジェクトを外す
   */
  removeObject() {
    if (this.puttedObject) {
      this.remove(this.puttedObject);
    }
    this.puttedObject = undefined;
  }

  /**
   * フォーカス時
   */
  focus() {
    if (this.planeColor.focus) {
      // @ts-ignore
      this.plane.material.color = new THREE.Color(this.planeColor.focus);
    }
    if (this.frameColor.focus) {
      // @ts-ignore
      this.frame.material.color = new THREE.Color(this.frameColor.focus);
    }
  }

  /**
   * ブラー時
   */
  blur() {
    // @ts-ignore
    this.plane.material.color = new THREE.Color(this.planeColor.default);
    // @ts-ignore
    this.frame.material.color = new THREE.Color(this.frameColor.default);
  }
}
