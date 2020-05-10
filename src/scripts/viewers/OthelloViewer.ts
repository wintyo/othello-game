import * as THREE from 'three';

// model
import Table from '~/models/Table';

// constants
import { COLORS } from '~/constants/Apps';

// viewer models
import TileObject3D from './models/TileObject3D';
import StoneObject3D from './models/StoneObject3D';

/**
 * オセロ石を作る
 * @param size - サイズ
 * @param height - 高さ
 * @param color - 色
 */
function createStone(size: number, height: number, color: number) {
  const stone = new StoneObject3D(size, height);
  stone.position.set(0, height / 2, 0);
  stone.setColor(color);
  return stone;
}

export default class OthelloViewer {
  /** 1タイルあたりのサイズ */
  private tileSize: number;
  /** レンダラー */
  private renderer!: THREE.WebGLRenderer;
  /** カメラ */
  private camera!: THREE.PerspectiveCamera;
  /** シーン */
  private scene!: THREE.Scene;
  /** タイルオブジェクトリスト */
  private tileObjList2D!: Array<Array<TileObject3D>>;
  /** オセロ石のサイズ */
  private stoneSize: number;
  /** オセロ石の高さ */
  private stoneHeight = 0.2;

  constructor(
    private elCanvas: HTMLCanvasElement,
    private boardSize: number,
    private table: Table,
  ) {
    this.tileSize = boardSize / table.numDivision;
    this.stoneSize = 0.9 * this.tileSize;

    this.init();
    this.renderLoop();

    this.table.event.on('reset', () => {
      this.reset();
    });
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
    this.tileObjList2D = tileObjs;
  }

  /**
   * ループ処理
   */
  renderLoop() {
    window.requestAnimationFrame(this.renderLoop.bind(this));
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * リセット処理
   */
  reset() {
    for (let i = 0; i < this.table.numDivision; i++) {
      for (let j = 0; j < this.table.numDivision; j++) {
        this.tileObjList2D[i][j].removeObject();
        // 石が配置されていたらその色の石を配置する
        if (this.table.stones[i][j]) {
          const stone = createStone(this.stoneSize, this.stoneHeight, this.table.stones[i][j]);
          this.tileObjList2D[i][j].putObject(stone);
        }
      }
    }
  }
}
