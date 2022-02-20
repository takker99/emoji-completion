/// <reference no-default-lib="true"/>
/// <reference lib="esnext"/>
/// <reference lib="dom"/>

import { useCallback, useEffect, useState } from "./deps/preact.tsx";

export interface UseLoaderInit {
  delay: number;
}
export function useLoader<T, U>(
  _callback: () => T,
  { delay }: UseLoaderInit,
  deps = [] as U[],
) {
  const [loading, setLoading] = useState(false);
  const callback = useCallback(_callback, deps); // これを入れないと、callbackが何度もrenderingされてしまう

  useEffect(() => {
    (async () => {
      const timer = setTimeout(() => setLoading(true), delay);
      await callback();
      clearTimeout(timer);
      setLoading(false);
    })();
  }, [callback, delay, ...deps]);

  return { loading };
}
