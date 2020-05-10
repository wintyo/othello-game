import Table from '../models/Table';
import OthelloViewer from '../viewers/OthelloViewer';
import BasePlayer from '../models/player/BasePlayer';
import HumanPlayer from '../models/player/HumanPlayer';

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
    numDivision: number,
  ) {
    this.table = new Table(numDivision);
    this.viewer = new OthelloViewer(elCanvas, boardSize, this.table);
    this.players = [
      new HumanPlayer(1, this.table, this.viewer),
      new HumanPlayer(2, this.table, this.viewer),
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
  }

  /**
   * 初期状態に戻す
   * @param othelloData - オセロデータ
   */
  reset(othelloData: Array<Array<number>>) {
    this.turn = 0;
    this.table.reset(othelloData);
  }
}
