import * as THREE from 'three';
import { EventEmitter } from 'events';
import { flatten } from 'lodash-es';

interface IEvents {
  'tile-hover': { x: number, y: number };
  'tile-click': { x: number, y: number };
}

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
  /** イベント */
  public event: EventEmitter<IEvents>;

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
  /** プレビュー用の石 */
  private previewStoneObj: StoneObject3D;

  constructor(
    private elCanvas: HTMLCanvasElement,
    private boardSize: number,
    private table: Table,
  ) {
    this.event = new EventEmitter<IEvents>();
    this.tileSize = boardSize / table.numDivision;
    this.stoneSize = 0.9 * this.tileSize;

    // 仮置きする石を用意しておく
    this.previewStoneObj = createStone(this.stoneSize, this.stoneHeight, 1);
    this.previewStoneObj.setOpacity(0.9);

    this.init();
    this.renderLoop();

    this.table.event.on('reset', () => {
      this.reset();
    });

    this.elCanvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.elCanvas.addEventListener('click', this.onMouseClick.bind(this));
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

  /**
   * 石の仮配置のリセット
   */
  resetPreviewStone() {
    // 仮配置した座標があるなら外す
    if (this.previewStoneObj.pos) {
      const { pos } = this.previewStoneObj;
      this.tileObjList2D[pos.y][pos.x].removeObject();
    }
    this.previewStoneObj.pos = null;

    // 全てのタイルのフォーカスを外しておく
    this.tileObjList2D.forEach((tileObjList) => {
      tileObjList.forEach((tileObj) => {
        tileObj.blur();
      });
    });
  }

  /**
   * 石を仮配置する
   * @param x - x座標
   * @param y - y座標
   * @param color - 色
   */
  previewPutStone(x: number, y: number, color: number) {
    // まずリセットする
    this.resetPreviewStone();

    // ひっくり返せるところを取得する
    const turnPositionsList = this.table.getTurnPositionsList(x, y, color);
    if (turnPositionsList.length <= 0) {
      return;
    }

    const previewPutPos = { x, y };
    this.previewStoneObj.setColor(color);
    this.tileObjList2D[previewPutPos.y][previewPutPos.x].putObject(this.previewStoneObj);
    this.previewStoneObj.pos = previewPutPos;

    // 置く場所とひっくり返す場所をフォーカスする
    turnPositionsList.forEach((turnPositions) => {
      turnPositions.forEach((turnPos) => {
        this.tileObjList2D[turnPos.y][turnPos.x].focus();
      });
    });
  }

  /**
   * Canvas内でのマウス移動
   * @param event - イベント
   */
  onMouseMove(event: MouseEvent) {
    const pos = this.getTilePosition(event.offsetX, event.offsetY);
    if (pos) {
      this.event.emit('tile-hover', pos);
    }
  }

  /**
   * Canvas内でのマウスクリック
   * @param event - イベント
   */
  onMouseClick(event: MouseEvent) {
    const pos = this.getTilePosition(event.offsetX, event.offsetY);
    if (pos) {
      this.event.emit('tile-click', pos);
    }
  }

  /**
   * タイルオブジェクトの番地を取得する
   * @param mouseX - マウスのX座標
   * @param mouseY - マウスのY座標
   */
  getTilePosition(mouseX: number, mouseY: number) {
    // 取得したスクリーン座標を-1〜1に正規化する
    const normX =  (mouseX / this.elCanvas.width) * 2 - 1;
    const normY = -(mouseY / this.elCanvas.height) * 2 + 1;

    // マウスの位置ベクトル
    const pos = new THREE.Vector3(normX, normY, 1);
    // スクリーン座標系からオブジェクト座標系に変換
    pos.unproject(this.camera);

    // レイを作成
    const ray = new THREE.Raycaster(this.camera.position, pos.sub(this.camera.position).normalize());

    // 交差判定対象のオブジェクトを取得
    const planes = flatten(this.tileObjList2D.map((tileObjList) => {
      return tileObjList.map((tileObj) => tileObj.getPlane());
    }));
    // 交差判定
    const objs = ray.intersectObjects(planes);

    if (objs.length <= 0) {
      return null;
    }
    // @ts-ignore
    const index = planes.indexOf(objs[0].object);
    return {
      x: index % this.table.numDivision,
      y: Math.floor(index / this.table.numDivision),
    };
  }
}
