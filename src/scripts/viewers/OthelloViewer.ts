import * as THREE from 'three';
import { EventEmitter } from 'events';
import { flatten } from 'lodash-es';

import { omitNullableHandler } from '~/utils/';

import { IOthelloPosition, tStoneTable } from '~/interfaces/Apps';

import { ePlayerColor } from '~/enums/Apps';

interface IEvents {
  'tile-hover': IOthelloPosition;
  'tile-click': IOthelloPosition;
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
function createStone(size: number, height: number, color: ePlayerColor) {
  const stone = new StoneObject3D(size, height);
  stone.position.set(0, height / 2, 0);
  stone.setColor(color);
  return stone;
}

export default class OthelloViewer {
  /** イベント */
  public event: EventEmitter<IEvents>;

  /** 1タイルあたりのサイズ */
  private tileSize: number = 0;
  /** レンダラー */
  private renderer!: THREE.WebGLRenderer;
  /** カメラ */
  private camera!: THREE.PerspectiveCamera;
  /** シーン */
  private scene!: THREE.Scene;
  /** タイルオブジェクトリスト */
  private tileObjList2D: Array<Array<TileObject3D>> = [[]];
  /** オセロ石のサイズ */
  private stoneSize: number = 0;
  /** オセロ石の高さ */
  private stoneHeight = 0.2;
  /** プレビュー用の石 */
  private previewStoneObj!: StoneObject3D;

  constructor(
    private elCanvas: HTMLCanvasElement,
    private boardSize: number,
    private table: Table,
  ) {
    this.event = new EventEmitter<IEvents>();

    this.init();
    this.renderLoop();

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
    this.camera = camera;

    const scene = new THREE.Scene();
    this.scene = scene;
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
   * @param stoneTable - オセロ盤情報
   */
  reset(stoneTable: tStoneTable) {
    // 一度全てリセットする
    this.tileObjList2D.forEach((tileObjList) => {
      tileObjList.forEach((tileObj) => {
        this.scene.remove(tileObj);
      });
    });

    // タイルを描画する際に左上がtileSize/2だけはみ出ているのでその分を考慮する
    this.tileSize = this.boardSize / (stoneTable[0] || []).length;
    this.stoneSize = 0.9 * this.tileSize;
    const offset = this.tileSize / 2;
    this.camera.position.set(this.boardSize / 2 - offset, 10, this.boardSize / 2 - offset + 5);
    this.camera.lookAt(this.boardSize / 2 - offset, 0, this.boardSize / 2 - offset);

    // 仮置きする石を用意しておく
    this.previewStoneObj = createStone(this.stoneSize, this.stoneHeight, 1);
    this.previewStoneObj.setOpacity(0.9);

    // タイルの色を用意
    const planeColor = { default: COLORS.DARKGREEN, focus: COLORS.YELLOW };
    const frameColor = { default: COLORS.BLACK };

    // オセロのタイル1つひとつを作成
    const tileObjs = new Array(stoneTable.length);
    for (let y = 0; y < stoneTable.length; y++) {
      tileObjs[y] = new Array(stoneTable[0].length);
      for (let x = 0; x < stoneTable[0].length; x++) {
        const tileObj = new TileObject3D(this.tileSize, planeColor, frameColor);
        tileObj.position.set(x * this.tileSize, 0, y * this.tileSize);
        this.scene.add(tileObj);
        tileObjs[y][x] = tileObj;

        // 石が配置されていたらその色の石を配置する
        if (stoneTable[y][x]) {
          const stone = createStone(this.stoneSize, this.stoneHeight, stoneTable[y][x]);
          tileObj.putObject(stone);
        }
      }
    }
    this.tileObjList2D = tileObjs;
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
   * 石を置く
   * @param pos - 位置
   * @param color - 色
   * @param turnPositionsList - 反転させる座標リスト
   */
  putStone(
    pos: IOthelloPosition,
    color: number,
    turnPositionsList: Array<Array<IOthelloPosition>>
  ) {
    this.resetPreviewStone();
    const stone = createStone(this.stoneSize, this.stoneHeight, color);
    this.tileObjList2D[pos.y][pos.x].putObject(stone);

    // 打った先からの距離の最大値を求める
    const maxFar = Math.max(...turnPositionsList.map((turnPositions) => turnPositions.length));

    let promise: Promise<any> = Promise.resolve();
    // 打った先から近い順に石を回転させる
    for (let far = 0; far < maxFar; far++) {
      const turnStones = turnPositionsList
        .filter((turnPositions) => far < turnPositions.length)
        .map((turnPositions) => {
          const turnPos = turnPositions[far];
          return this.tileObjList2D[turnPos.y][turnPos.x].puttedObject;
        })
        .filter(omitNullableHandler);
      // 非同期処理のチェーンをつなげる
      promise = promise.then(() => {
        return Promise.all(turnStones.map((turnStone) => {
          if (turnStone instanceof StoneObject3D) {
            return turnStone.turnAnimation();
          }
          return Promise.resolve();
        }));
      });
    }
    return promise;
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
      x: index % (this.table.stones[0] || []).length,
      y: Math.floor(index / (this.table.stones[0] || []).length),
    };
  }
}
