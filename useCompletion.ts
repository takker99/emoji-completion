/// <reference no-default-lib="true"/>
/// <reference lib="esnext"/>
/// <reference lib="dom"/>

import { useCallback, useEffect, useMemo, useState } from "./deps/preact.tsx";
import { useSelect } from "./useSelect.ts";
import { useCrossSearch } from "./useCrossSearch.ts";

export function useCompletion(
  name,
  projectIds,
  { icon, filter, internal } = {},
) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [enable, setEnable] = useState(true);
  const cancel = useCallback(() => setOpen(false), []);

  // 検索結果
  const { loading, searching, results } = useCrossSearch(name, query, {
    icon,
    projectIds,
  });
  //確定時の処理
  const onClick = useCallback(async (key, e) => {
    e.stopPropagation();
    // 修飾キーが押されていたら何もしない
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    e.preventDefault();
    await replaceLink(key);
    cancel(); // 補完を終了する
  }, [cancel]);
  // UI用に加工する
  const list = useMemo(
    () =>
      results
        .map(({ project, title }) => ({
          key: `/${project}/${title}`,
          href: `/${project}/${toLc(title)}`,
          project,
          onClick: (e) =>
            onClick(
              internal
                ? title
                : icon
                ? `/${project}/${title}.icon`
                : `/${project}/${title}`,
              e,
            ),
        })),
    [results, query, internal],
  );

  // キー操作の有効かどうかのflag
  const isEnableKeyboard = useMemo(() => enable && open && list.length > 0, [
    enable,
    open,
    list.length,
  ]);
  // 補完windowを開くかどうかのflag
  const isOpen = useMemo(
    () => enable && open && (list.length > 0 || loading || searching),
    [enable, open, list.length, loading, searching],
  );

  // 項目選択
  const { item, selectPrev, selectNext } = useSelect({
    list,
    defaultSelected: 0,
  });

  //確定時の処理
  const confirm = useCallback(async () => {
    await replaceLink(item.key);
    cancel();
  }, [item, cancel]);
  const confirmIcon = useCallback(async () => {
    await replaceLink(`${item.key}.icon`);
    cancel();
  }, [item, cancel]);

  const [position, setPosition] = useState({ top: 0, left: 0 }); // popupの位置
  // .cursorが.page-linkの中にいたら補完を開始する
  const startCompletion = useCallback(async () => {
    const { char } = caretPos();
    const link = char?.closest?.('.page-link[type="link"]'); // hash tagは除外する
    if (!link) {
      cancel();
      return;
    }

    // .cursor-lineになっているはずなので、[]で囲まれているとみなしていい
    const text = link.textContent.slice(1, -1);
    // 外部project link記法のみを対象とする
    if (!filter.test(text)) return;
    setOpen(true);
    setQuery(text.slice(1));

    // leftはlinkの左端に合わせる
    const top = parseInt(scrapboxDOM.cursor.style.top);
    const height = parseInt(scrapboxDOM.cursor.style.height);
    const bottom = top + height;
    const { left: eLeft } = scrapboxDOM.editor.getBoundingClientRect();
    const left = link.getBoundingClientRect().left;
    setPosition({ top: bottom, left: Math.round(left - eLeft) });
  }, [filter]);
  useOnTextChange(startCompletion);
  // 手動で補完を有効にする
  const start = useCallback(async () => {
    setEnable(true);
    await startCompletion();
  }, [startCompletion]);

  return {
    item,
    list,
    confirm,
    confirmIcon,
    start,
    cancel,
    isOpen,
    isEnableKeyboard,
    query,
    loading,
    searching,
    selectPrev,
    selectNext,
    position,
  };
}
