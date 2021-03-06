import { flatten, cloneDeep } from 'lodash-es';

// interfaces
import { IOthelloPosition, IOthelloVector, tStoneTable } from '~/interfaces/Apps';
import { ePlayerColor } from '~/enums/Apps';

/**
 * 一方向に対して交換できる番地を返す
 * @param stones - 石情報
 * @param vec - 方向
 * @param pos - 配置する位置
 * @param color - 色
 */
function getTurnPositionsInLine(
  stones: tStoneTable,
  vec: IOthelloVector,
  pos: IOthelloPosition,
  color: ePlayerColor,
) {
  const oppPositions: Array<IOthelloPosition> = [];
  const checkPos = { ...pos };
  while (true) { // eslint-disable-line no-constant-condition
    // 次の座標へ進む
    checkPos.x += vec.x; checkPos.y += vec.y;

    // オセロ盤の範囲外ならループを抜ける
    if (checkPos.x < 0 || checkPos.x >= (stones[0] || []).length ||
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
  pos: IOthelloPosition,
  color: ePlayerColor,
) {
  // 既に石が配置されていたら交換できないので空配列を返す
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
  /** 石情報 */
  public stones: tStoneTable = [[]];

  /** 各色の石の数を算出 */
  get numStoneMap(): { [color: number]: number } {
    const colors = Object.values(ePlayerColor).filter((value) => typeof value === 'number');
    const numStoneMap = Object.assign({}, ...colors.map((color) => ({
      [color]: 0,
    })));

    this.stones.forEach((stoneList) => {
      stoneList.forEach((stone) => {
        if (!stone) {
          return;
        }
        numStoneMap[stone] += 1;
      });
    });

    return numStoneMap;
  }

  /**
   * 石が0になったプレイヤーがいるかチェック
   */
  checkEmptyStonePlayer() {
    return Object.keys(this.numStoneMap).some((color: any) => this.numStoneMap[color] === 0);
  }

  /**
   * 全ての石が配置されたかチェック
   */
  checkAllStoneFilled() {
    return flatten(this.stones).every((stone) => stone !== 0);
  }

  /**
   * データのリセット
   */
  reset(othelloData: tStoneTable) {
    this.stones = cloneDeep(othelloData);
  }

  /**
   * 石を置く
   * @param x - x座標
   * @param y - y座標
   * @param color - 色
   */
  putStone(x: number, y: number, color: ePlayerColor) {
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

  /**
   * 交換できる位置を探す
   * @param x - x座標
   * @param y - y座標
   * @param color - オセロ色
   */
  getTurnPositionsList(x: number, y: number, color: ePlayerColor) {
    return getTurnPositionsList(this.stones, { x, y }, color);
  }

  /**
   * 置く場所が存在するかチェック
   * @param color - 色
   */
  checkCanPutStone(color: ePlayerColor) {
    for (let y = 0; y < this.stones.length; y++) {
      for (let x = 0; x < this.stones[0].length; x++) {
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
