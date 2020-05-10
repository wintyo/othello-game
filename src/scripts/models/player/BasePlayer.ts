import Table from '../Table';

export default abstract class BasePlayer {
  constructor(
    protected color: number,
    protected table: Table
  ) {
  }

  /**
   * 石を置く
   * @param x - x座標
   * @param y - y座標
   */
  putStone(x: number, y: number) {
    this.table.putStone(x, y, this.color);
  }

  /**
   * 石を置くフェーズに入る
   */
  abstract putPhase(): void;
}
