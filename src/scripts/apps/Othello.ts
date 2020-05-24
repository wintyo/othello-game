import { EventEmitter } from 'events';

import Table from '../models/Table';
import OthelloViewer from '../viewers/OthelloViewer';
import BasePlayer from '../models/player/BasePlayer';
import HumanPlayer from '../models/player/HumanPlayer';

import { ePlayerColor } from '~/enums/Apps';

// interfaces
import { tStoneTable } from '~/interfaces/Apps';

interface IEvents {
  'num-stones': { [color: number]: number };
  'own-turn': ePlayerColor;
  'pass': ePlayerColor;
  'finish': { [color: number]: number };
  'reset': void;
}

export default class Othello {
  /** イベント */
  public event: EventEmitter<IEvents>;
  /** プレイ中か */
  public isPlaying = false;

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
    this.event = new EventEmitter<IEvents>();
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
    this.isPlaying = true;
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
      this.event.emit('num-stones', this.table.numStoneMap);
      this.nextTurn();
    });
    this.event.emit('own-turn', nowPlayer.color);
  }

  /**
   * 次のターンへ移る
   */
  nextTurn() {
    // ゲーム終了かチェックする
    if (this.table.checkAllStoneFilled() || this.table.checkEmptyStonePlayer()) {
      this.event.emit('finish', this.table.numStoneMap);
      return;
    }

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
      this.event.emit('pass', nextPlayer.color);
      nextTurn = (nextTurn + 1) % this.players.length;
    }

    // 自分の番まで戻ってきて石がおけるなら自分のターンを続ける
    if (this.table.checkCanPutStone(this.players[this.turn].color)) {
      this.putPhase();
      return;
    }

    this.event.emit('finish', this.table.numStoneMap);
  }

  /**
   * 初期状態に戻す
   * @param othelloData - オセロデータ
   */
  reset(othelloData: tStoneTable) {
    this.isPlaying = false;
    this.turn = 0;
    this.table.reset(othelloData);
    this.viewer.reset(othelloData);
    this.event.emit('num-stones', this.table.numStoneMap);
    this.event.emit('reset');
  }
}
