export default class Table {
  private stones: Array<Array<number>>;

  constructor(
    public numDivision: number,
  ) {
    this.stones = new Array(numDivision);
    for (let i = 0; i < this.stones.length; i++) {
      this.stones[i] = new Array(numDivision);
    }
  }
}
