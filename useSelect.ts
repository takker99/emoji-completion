/// <reference no-default-lib="true"/>
/// <reference lib="esnext"/>
/// <reference lib="dom"/>

import { useCallback, useMemo, useState } from "./deps/preact.tsx";

export interface UseSelectInit<T> {
  onBlur?: () => void;
  defaultSelected: number;
  list: T[];
}
export interface UseSelectResult<T> {
  item: T;
  select: (index: number | undefined) => void;
  selectPrev: () => void;
  selectNext: () => void;
  blur: () => void;
}
export function useSelect<T>({
  list,
  onBlur,
  defaultSelected,
}: UseSelectInit<T>): UseSelectResult<T> {
  const [index, setIndex] = useState<number | undefined>(defaultSelected); // 未選択のときはundefinedになる
  const item = useMemo(() => list[index ?? defaultSelected], [
    index,
    list,
    defaultSelected,
  ]);
  const length = useMemo(() => list.length, [list]);

  const select = useCallback((i: number | undefined) => setIndex(i), []);
  /** 前の項目に移動する */
  const selectPrev = useCallback(
    () => setIndex((_index) => ((_index ?? 0) - 1 + length) % length),
    [length],
  );
  /** 次の項目に移動する */
  const selectNext = useCallback(
    () => setIndex((_index) => ((_index ?? -1) + 1) % length),
    [length],
  );
  /** 項目選択を解除する */
  const blur = useCallback(() => {
    setIndex(undefined);
    onBlur?.();
  }, []);

  return {
    item,
    select,
    selectPrev,
    selectNext,
    blur,
  };
}
