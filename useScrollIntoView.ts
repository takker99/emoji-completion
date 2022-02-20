/// <reference no-default-lib="true"/>
/// <reference lib="esnext"/>
/// <reference lib="dom"/>

import { Ref, useEffect, useRef } from "./deps/preact.tsx";

/** 描画領域内にアイテムが収まるようにスクロールするやつ
 *
 * 指定した文字列を`data-key`にもつ要素が見えるようにスクロールする
 */
export function useScrollIntoView(
  selectedKey: string | undefined,
): Ref<HTMLUListElement> {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const ul = ref.current;
    if (!ul || selectedKey === undefined) return;
    const selectedLi = ul.querySelector(`li[data-key="${selectedKey}"]`);
    if (!selectedLi) return;

    const root = ul.getBoundingClientRect();
    const item = selectedLi.getBoundingClientRect();
    if (root.top > item.top) {
      ul.scrollTop -= root.top - item.top;
      return;
    }
    if (root.bottom < item.bottom) {
      ul.scrollTop += item.bottom - root.bottom;
      return;
    }
    // browserの表示領域内にも収める
    const { top, bottom } = selectedLi.getBoundingClientRect();
    if (top < 0) {
      selectedLi.scrollIntoView();
      return;
    }
    if (bottom > window.innerHeight) {
      selectedLi.scrollIntoView(false);
      return;
    }
  }, [selectedKey]);

  return ref;
}
