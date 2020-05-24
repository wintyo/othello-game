import BasePlayer from './BasePlayer';
import Table from '../Table';
import OthelloViewer from '~/viewers/OthelloViewer';

import { IOthelloPosition } from '~/interfaces/Apps';
import { ePlayerColor } from '~/enums/Apps';

export default class HumanPlayer extends BasePlayer {
  /** ビューワー */
  private viewer: OthelloViewer;

  constructor(color: ePlayerColor, table: Table, viewer: OthelloViewer) {
    super(color, table);
    this.viewer = viewer;

    this.onTileHover = this.onTileHover.bind(this);
    this.onTileClick = this.onTileClick.bind(this);
  }

  /**
   * viewerのタイル上に乗った時
   * @param pos - タイル位置
   */
  onTileHover(pos: IOthelloPosition) {
    // 試し置きの結果を表示する
    this.viewer.previewPutStone(pos.x, pos.y, this.color);
  }

  /**
   * viewerのタイル上をクリックしたときの処理
   * @param pos - タイル位置
   */
  onTileClick(pos: IOthelloPosition) {
    super.putStone(pos.x, pos.y);
  }

  /**
   * 石を置くフェーズに入る
   */
  putPhase() {
    // 人が石を選択できるようにviewerのイベントにセットする
    this.viewer.event.on('tile-hover', this.onTileHover);
    this.viewer.event.on('tile-click', this.onTileClick);
  }

  /**
   * 石を置くフェーズの終了
   */
  finishPutPhase() {
    this.viewer.event.off('tile-hover', this.onTileHover);
    this.viewer.event.off('tile-click', this.onTileClick);
  }

  /**
   * 破棄処理
   */
  destroy() {
    this.finishPutPhase();
  }
}
