import { EventEmitter } from 'events';

interface IEvents {
  reset: void;
}

export default class Table {
  /** イベント */
  public event: EventEmitter<IEvents>;

  /** 石情報 */
  public stones: Array<Array<number>>;

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
  reset(othelloData: Array<Array<number>>) {
    this.stones = othelloData;
    this.event.emit('reset');
  }
}
