/// <reference no-default-lib="true"/>
/// <reference lib="esnext"/>
/// <reference lib="dom"/>

import type { SearchedTitle } from "./deps/scrapbox.ts";
import { getLinks } from "./fetch.ts";
import { findLatestApiCache } from "./findLatestApiCache.ts";

/** cache-first でデータを読み込む */
export async function* load(
  project: string,
): AsyncGenerator<
  AsyncGenerator<SearchedTitle[], void, unknown>,
  void,
  unknown
> {
  yield async function* () {
    try {
      for await (
        const links of getLinks(project, {
          fetch: async (req) => {
            const res = await findLatestApiCache(req);
            if (res) return res;
            throw new Error("no cache");
          },
        })
      ) {
        yield links;
      }
    } catch (_: unknown) {
      // 何もしない
    }
  }();

  yield getLinks(project);
}
