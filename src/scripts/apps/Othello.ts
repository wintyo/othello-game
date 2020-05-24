import { EventEmitter } from 'events';

import Table from '../models/Table';
import OthelloViewer from '../viewers/OthelloViewer';
import BasePlayer from '../models/player/BasePlayer';
import HumanPlayer from '../models/player/HumanPlayer';
import AIRandomPlayer from '../models/player/AIRandomPlayer';

import { ePlayerColor, ePlayerType } from '~/enums/Apps';

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
    this.players = [];
  }

  /**
   * ゲーム開始
   * @param playerTypeBlack - 黒のプレイヤータイプ
   * @param playerTypeWhite - 白のプレイヤータイプ
   */
  start(playerTypeBlack: ePlayerType, playerTypeWhite: ePlayerType) {
    this.isPlaying = true;
    this.players = [
      this.createPlayer(ePlayerColor.Black, playerTypeBlack),
      this.createPlayer(ePlayerColor.White, playerTypeWhite),
    ];
    this.putPhase();
  }

  /**
   * プレイヤーの作成
   * @param color - 色
   * @param playerType - プレイヤータイプ
   */
  createPlayer(color: ePlayerColor, playerType: ePlayerType): BasePlayer {
    switch (playerType) {
      case ePlayerType.Human:
        return new HumanPlayer(color, this.table, this.viewer);
      case ePlayerType.AIRandom:
        return new AIRandomPlayer(color, this.table);
    }
    throw new Error(`存在しないプレイヤータイプです: ${playerType}`);
  }

  /**
   * オセロの配置モード
   */
  putPhase() {
    const nowPlayer = this.players[this.turn];
    nowPlayer.putPhase();
    nowPlayer.event.on('put-stone', async ({ x, y, color }) => {
      try {
        const turnPositionsList = this.table.putStone(x, y, color);
        nowPlayer.finishPutPhase();
        await this.viewer.putStone({ x, y }, color, turnPositionsList);
        this.event.emit('num-stones', this.table.numStoneMap);
        nowPlayer.event.removeAllListeners('put-stone');
        this.nextTurn();
      } catch (e) {
        window.alert(e);
      }
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
    this.players.forEach((player) => {
      player.destroy();
    });
    this.players = [];
    this.table.reset(othelloData);
    this.viewer.reset(othelloData);

    this.event.emit('num-stones', this.table.numStoneMap);
    this.event.emit('reset');
  }
}
