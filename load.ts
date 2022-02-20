import type { SearchedTitle } from "./deps/scrapbox.ts";

export interface GetLinksInit {
  fetch?: (request: RequestInfo) => Promise<Response>;
}
export async function* getLinks(
  project: string,
  init?: GetLinksInit,
) {
  const { fetch = globalThis.fetch } = init ?? {};
  const path = `https://scrapbox.io/api/pages/${project}/search/titles`;
  let followingId: string | null = null;

  while (true) {
    const path_ = `${path}${
      followingId ? `?followingId=${followingId}` : ""
    }` as string;
    const res = await fetch(path_);
    if (!res.ok) {
      const error = new Error();
      const { name, message } = await res.json();
      error.name = name;
      error.message = message;
      throw error;
    }
    followingId = res.headers.get("X-Following-Id");
    yield (await res.json()) as SearchedTitle[];
    if (!followingId) break;
  }
}
