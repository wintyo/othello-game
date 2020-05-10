import BasePlayer from './BasePlayer';
import Table from '../Table';
import OthelloViewer from '~/viewers/OthelloViewer';

export default class HumanPlayer extends BasePlayer {
  /** ビューワー */
  private viewer: OthelloViewer;

  constructor(color: number, table: Table, viewer: OthelloViewer) {
    super(color, table);
    this.viewer = viewer;

    this.onTileHover = this.onTileHover.bind(this);
  }

  /**
   * viewerのタイル上に乗った時
   * @param pos - タイル位置
   */
  onTileHover(pos: { x: number, y: number }) {
    // 試し置きの結果を表示する
    this.viewer.previewPutStone(pos.x, pos.y, this.color);
  }

  /**
   * 石を置くフェーズに入る
   */
  putPhase() {
    // 人が石を選択できるようにviewerのイベントにセットする
    this.viewer.event.on('tile-hover', this.onTileHover);
  }
}
