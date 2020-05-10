import Table from '../models/Table';
import OthelloViewer from '../viewers/OthelloViewer';

export default class Othello {
  /** 盤面情報 */
  private table: Table;
  /** ビューワー */
  private viewer: OthelloViewer;

  constructor(
    elCanvas: HTMLCanvasElement,
    boardSize: number,
    numDivision: number,
  ) {
    this.table = new Table(numDivision);
    this.viewer = new OthelloViewer(elCanvas, boardSize, this.table);
  }

  /**
   * 初期状態に戻す
   * @param othelloData - オセロデータ
   */
  reset(othelloData: Array<Array<number>>) {
    this.table.reset(othelloData);
  }
}
