import { EventEmitter } from 'events';
import Table from '../Table';

interface IEvents {
  'put-stone': { x: number, y: number, color: number };
}

export default abstract class BasePlayer {
  /** イベント */
  public event: EventEmitter<IEvents>;

  constructor(
    public color: number,
    protected table: Table
  ) {
    this.event = new EventEmitter<IEvents>();
  }

  /**
   * 石を置く
   * @param x - x座標
   * @param y - y座標
   */
  putStone(x: number, y: number) {
    // this.table.putStone(x, y, this.color);
    this.event.emit('put-stone', { x, y, color: this.color });
  }

  /**
   * 石を置くフェーズに入る
   */
  abstract putPhase(): void;

  /**
   * 石を置くフェーズの終了
   */
  abstract finishPutPhase(): void;
}
