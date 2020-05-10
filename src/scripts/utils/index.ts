/**
 * Nullを除去するハンドラー関数（filter関数とセットで使う）
 * ex. [1, 2, null].filter(omitNullableHandler)
 * @param item - 項目
 */
export function omitNullableHandler<T>(item: T): item is NonNullable<T> {
  return !!item;
}
