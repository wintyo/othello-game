import * as THREE from 'three';

// model
import Table from '~/models/Table';

// constants
import { COLORS } from '~/constants/Apps';

// viewer models
import TileObject3D from './models/TileObject3D';

export default class OthelloViewer {
  /** 1タイルあたりのサイズ */
  private tileSize: number;
  /** レンダラー */
  private renderer!: THREE.WebGLRenderer;
  /** カメラ */
  private camera!: THREE.PerspectiveCamera;
  /** シーン */
  private scene!: THREE.Scene;

  constructor(
    private elCanvas: HTMLCanvasElement,
    private boardSize: number,
    private table: Table,
  ) {
    this.tileSize = boardSize / table.numDivision;

    this.init();
    this.renderLoop();
  }

  /**
   * 初期設定
   */
  init() {
    const renderer = new THREE.WebGLRenderer({
      canvas: this.elCanvas,
    });
    this.renderer = renderer;

    const camera = new THREE.PerspectiveCamera(75, this.elCanvas.width / this.elCanvas.height, 0.1, 100);
    // タイルを描画する際に左上がtileSize/2だけはみ出ているのでその分を考慮する
    const offset = this.tileSize / 2;
    camera.position.set(this.boardSize / 2 - offset, 10, this.boardSize / 2 - offset + 5);
    camera.lookAt(this.boardSize / 2 - offset, 0, this.boardSize / 2 - offset);
    this.camera = camera;

    const scene = new THREE.Scene();
    this.scene = scene;
    // タイルの色を用意
    const planeColor = { default: COLORS.DARKGREEN, focus: COLORS.YELLOW };
    const frameColor = { default: COLORS.BLACK };
    // オセロのタイル1つひとつを作成
    const tileObjs = new Array(this.table.numDivision);
    for (let y = 0; y < this.table.numDivision; y++) {
      tileObjs[y] = new Array(this.table.numDivision);
      for (let x = 0; x < this.table.numDivision; x++) {
        const tileObj = new TileObject3D(this.tileSize, planeColor, frameColor);
        tileObj.position.set(x * this.tileSize, 0, y * this.tileSize);
        scene.add(tileObj);
        tileObjs[y][x] = tileObj;
      }
    }
  }

  /**
   * ループ処理
   */
  renderLoop() {
    window.requestAnimationFrame(this.renderLoop.bind(this));
    this.renderer.render(this.scene, this.camera);
  }
}
