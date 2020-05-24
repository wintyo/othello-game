import Table from '../models/Table';
import OthelloViewer from '../viewers/OthelloViewer';
import BasePlayer from '../models/player/BasePlayer';
import HumanPlayer from '../models/player/HumanPlayer';

import { ePlayerColor } from '~/enums/Apps';

// interfaces
import { tStoneTable } from '~/interfaces/Apps';

export default class Othello {
  /** 盤面情報 */
  private table: Table;
  /** ビューワー */
  private viewer: OthelloViewer;
  /** プレイヤー */
  private players: Array<BasePlayer>;
  /** 誰のターンか */
  private turn = 0;

  constructor(
    elCanvas: HTMLCanvasElement,
    boardSize: number,
  ) {
    this.table = new Table();
    this.viewer = new OthelloViewer(elCanvas, boardSize, this.table);
    this.players = [
      new HumanPlayer(ePlayerColor.Black, this.table, this.viewer),
      new HumanPlayer(ePlayerColor.White, this.table, this.viewer),
    ];
  }

  /**
   * ゲーム開始
   */
  start() {
    this.putPhase();
  }

  /**
   * オセロの配置モード
   */
  putPhase() {
    const nowPlayer = this.players[this.turn];
    nowPlayer.putPhase();
    nowPlayer.event.once('put-stone', async ({ x, y, color }) => {
      const turnPositionsList = this.table.putStone(x, y, color);
      await this.viewer.putStone({ x, y }, color, turnPositionsList);
      this.nextTurn();
    });
  }

  /**
   * 次のターンへ移る
   */
  nextTurn() {
    // 置けるプレイヤーが出るまで次のプレイヤーに移動する
    let nextTurn = (this.turn + 1) % this.players.length;
    while (nextTurn !== this.turn) {
      const nextPlayer = this.players[nextTurn];
      // 石がおけるならそのプレイヤーで配置モードへ移行する
      if (this.table.checkCanPutStone(nextPlayer.color)) {
        this.turn = nextTurn;
        this.putPhase();
        return;
      }
      nextTurn = (nextTurn + 1) % this.players.length;
    }

    // 自分の番まで戻ってきて石がおけるなら自分のターンを続ける
    if (this.table.checkCanPutStone(this.players[this.turn].color)) {
      this.putPhase();
      return;
    }

    console.log('finish');
  }

  /**
   * 初期状態に戻す
   * @param othelloData - オセロデータ
   */
  reset(othelloData: tStoneTable) {
    this.turn = 0;
    this.table.reset(othelloData);
    this.viewer.reset(othelloData);
  }
}
