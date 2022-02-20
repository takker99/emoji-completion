/// <reference no-default-lib="true"/>
/// <reference lib="esnext"/>
/// <reference lib="dom"/>

import { useState } from "./deps/preact.tsx";
import { useLoader } from "./useLoader.ts";

type SearchFunc = (
  query: string,
  option: { limit: number },
) => Promise<{ executed: false } | { executed: true; result: string[] }>;
declare function crossSearch(
  name: string,
  projectIds: string[],
  init: { icon: boolean },
): Promise<{
  update: () => Promise<void>;
  search: SearchFunc;
}>;

export interface UseCrossSearchInit {
  icon?: boolean;
  projectIds: string[];
  limit: number;
}
export interface UseCrossSearchResult {
  searching: boolean;
  loading: boolean;
  results: string[];
}
export function useCrossSearch(
  name: string,
  query: string,
  init: UseCrossSearchInit,
  deps = [],
) {
  const { icon = false, projectIds, limit } = init ?? {};
  const [search, setSearch] = useState<SearchFunc | undefined>(undefined);
  const [results, setResults] = useState([] as string[]);

  const { loading } = useLoader(
    () =>
      (async () => {
        const funcs = await crossSearch(name, projectIds, { icon });
        await funcs.update();
        setSearch(funcs.search);
      })(),
    { delay: 1000 },
    [name, projectIds, icon, ...deps],
  );
  const { loading: searching } = useLoader(
    () =>
      (async () => {
        if (!search) return;
        const searched = await search(query, { limit });
        if (searched.executed) setResults(searched.result);
      })(),
    { delay: 1000 },
    [query, search, limit, ...deps],
  );

  return {
    searching,
    loading,
    results,
  };
}
