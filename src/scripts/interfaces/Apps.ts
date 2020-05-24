import { ePlayerColor } from '~/enums/Apps';

/** オセロ盤の型 */
export type tStoneTable = Array<Array<ePlayerColor | 0>>;

/** オセロ盤の座標 */
export interface IOthelloPosition {
  /** x座標 */
  x: number;
  /** y座標 */
  y: number;
}

/** オセロ盤のベクトル */
export interface IOthelloVector {
  /** x座標 */
  x: number;
  /** y座標 */
  y: number;
}
