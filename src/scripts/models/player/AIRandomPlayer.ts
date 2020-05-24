import BasePlayer from './BasePlayer';

import Table from '~/models/Table';

import { IOthelloPosition } from '~/interfaces/Apps';
import { ePlayerColor } from '~/enums/Apps';

/**
 * 配置可能な位置を算出する
 * @param color - 色
 * @param table - テーブル
 */
function calcPuttablePositions(color: ePlayerColor, table: Table) {
  const puttablePositions: Array<IOthelloPosition> = [];
  const stoneTable = table.stones;
  for (let y = 0; y < stoneTable.length; y++) {
    for (let x = 0; x < stoneTable[y].length; x++) {
      const turnPositionsList = table.getTurnPositionsList(x, y, color);
      if (turnPositionsList.length > 0) {
        puttablePositions.push({ x, y });
      }
    }
  }
  return puttablePositions;
}

export default class AIRandomPlayer extends BasePlayer {
  constructor(color: ePlayerColor, table: Table) {
    super(color, table);
  }

  /**
   * 石を置く
   */
  putStone() {
    const puttablePositions = calcPuttablePositions(this.color, this.table);
    const position = puttablePositions[Math.floor(Math.random() * puttablePositions.length)];
    super.putStone(position.x, position.y);
  }

  /**
   * 石を置くフェーズに入る
   */
  putPhase() {
    window.setTimeout(() => {
      this.putStone();
    }, 1000);
  }

  /**
   * 石を置くフェーズの終了
   */
  finishPutPhase() {
    //
  }

  /**
   * 破棄処理
   */
  destroy() {
    //
  }
}
