/// <reference no-default-lib="true"/>
/// <reference lib="esnext"/>
/// <reference lib="dom"/>

import { useEffect, useMemo } from "./deps/preact.tsx";

export interface Key {
  key: string;
  shiftKey?: boolean;
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

export interface UseKeyboardOption {
  enable?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  capture?: boolean;
  keydown?: boolean;
  keyup?: boolean;
  filter?: (e: KeyboardEvent) => boolean;
}
export function useKeyboard<T extends unknown[] = unknown[]>(
  element: HTMLElement,
  keys: string | Key,
  callback: () => void,
  options?: UseKeyboardOption,
  deps?: T[],
) {
  const {
    enable = true,
    filter,
    preventDefault = true,
    stopPropagation = true,
    capture = false,
    keydown = true,
    keyup = false,
  } = options ?? {};

  const handleEvent = useMemo(() =>
    enable
      ? (e: KeyboardEvent) => {
        if (typeof keys === "string") {
          if (keys !== e.key) return;
        } else {
          if (keys.key && keys.key !== e.key) return;
          if (keys.shiftKey !== undefined && keys.shiftKey !== e.shiftKey) {
            return;
          }
          if (keys.ctrlKey !== undefined && keys.ctrlKey !== e.ctrlKey) return;
          if (keys.altKey !== undefined && keys.altKey !== e.altKey) return;
          if (keys.metaKey !== undefined && keys.metaKey !== e.metaKey) return;
        }
        if (!(filter?.(e) ?? true)) return;

        if (preventDefault) e.preventDefault();
        if (stopPropagation) e.stopPropagation();
        callback();
      }
      : undefined, [
    keys,
    callback,
    enable,
    filter,
    preventDefault,
    stopPropagation,
    deps ?? [],
  ]);

  useEffect(() => {
    if (!keydown || !handleEvent) return;
    element.addEventListener("keydown", handleEvent, { capture });
    return () =>
      element.removeEventListener("keydown", handleEvent, { capture });
  }, [element, handleEvent, keydown, capture]);
  useEffect(() => {
    if (!keyup || !handleEvent) return;
    element.addEventListener("keyup", handleEvent, { capture });
    return () => element.removeEventListener("keyup", handleEvent, { capture });
  }, [element, handleEvent, keyup, capture]);
}
