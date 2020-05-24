import { EventEmitter } from 'events';

import { tStoneTable } from '~/interfaces/Apps';

interface IEvents {
  reset: void;
}

/**
 * 一方向に対して交換できる番地を返す
 * @param stones - 石情報
 * @param vec - 方向
 * @param pos - 配置する位置
 * @param color - 色
 */
function getTurnPositionsInLine(
  stones: tStoneTable,
  vec: { x: number, y: number },
  pos: { x: number, y: number },
  color: number,
) {
  const oppPositions: Array<{ x: number, y: number }> = [];
  const checkPos = { ...pos };
  while (true) { // eslint-disable-line no-constant-condition
    // 次の座標へ進む
    checkPos.x += vec.x; checkPos.y += vec.y;

    // オセロ盤の範囲外ならループを抜ける
    if (checkPos.x < 0 || checkPos.x >= stones.length ||
      checkPos.y < 0 || checkPos.y >= stones.length) {
      break;
    }
    // 石が置いてなければループを抜ける
    if (!stones[checkPos.y][checkPos.x]) {
      break;
    }
    // 自分の石ならこれまでの番地配列を返却する
    if (stones[checkPos.y][checkPos.x] === color) {
      return oppPositions;
    }
    // 相手の石（自分以外の石）の番地を保存する
    oppPositions.push({ ...checkPos });
  }

  // 自分の石まで到達できずループを抜けたため、空配列を返却
  return [];
}

/**
 * 交換できる番地を返す
 * @param stones - 石情報
 * @param pos - 配置する位置
 * @param color - 色
 */
function getTurnPositionsList(
  stones: tStoneTable,
  pos: { x: number, y: number },
  color: number,
) {
  if (stones[pos.y][pos.x]) {
    return [];
  }
  // チェックする方向（全8方向）
  const vecs = [
    { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
    { x: -1, y:  0 },                  { x: 1, y:  0 },
    { x: -1, y:  1 }, { x: 0, y:  1 }, { x: 1, y:  1 },
  ];
  return vecs
    .map((vec) => getTurnPositionsInLine(stones, vec, pos, color))
    .filter((positions) => positions.length > 0);
}

export default class Table {
  /** イベント */
  public event: EventEmitter<IEvents>;

  /** 石情報 */
  public stones: tStoneTable;

  constructor(
    public numDivision: number,
  ) {
    this.stones = new Array(numDivision);
    for (let i = 0; i < this.stones.length; i++) {
      this.stones[i] = new Array(numDivision);
    }

    this.event = new EventEmitter<IEvents>();
  }

  /**
   * データのリセット
   */
  reset(othelloData: tStoneTable) {
    this.stones = othelloData;
    this.event.emit('reset');
  }

  /**
   * 石を置く
   * @param x - x座標
   * @param y - y座標
   * @param color - 色
   */
  putStone(x: number, y: number, color: number) {
    // 交換できる番地を取得
    const turnPositionsList = getTurnPositionsList(this.stones, { x, y }, color);
    if (turnPositionsList.length <= 0) {
      throw new Error('ここに石はおけません。');
    }

    // 指定場所と交換できる場所にcolorをセットする
    this.stones[y][x] = color;
    turnPositionsList.forEach((turnPositions) => {
      turnPositions.forEach((turnPos) => {
        this.stones[turnPos.y][turnPos.x] = color;
      });
    });

    return turnPositionsList;
  }

  getTurnPositionsList(x: number, y: number, color: number) {
    return getTurnPositionsList(this.stones, { x, y }, color);
  }

  /**
   * 置く場所が存在するかチェック
   * @param color - 色
   */
  checkCanPutStone(color: number) {
    for (let y = 0; y < this.numDivision; y++) {
      for (let x = 0; x < this.numDivision; x++) {
        const turnPositionsList = getTurnPositionsList(this.stones, { x, y }, color);
        // ひっくり返せる場所が存在したらtrueを返して終了
        if (turnPositionsList.length > 0) {
          return true;
        }
      }
    }
    // 見つからなかったらfalseを返す
    return false;
  }
}
