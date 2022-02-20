/// <reference no-default-lib="true"/>
/// <reference lib="esnext"/>
/// <reference lib="dom"/>

export async function findLatestApiCache(
  request: RequestInfo,
  options?: CacheQueryOptions,
): Promise<Response | undefined> {
  const names = (await globalThis.caches.keys())
    .filter(
      (key) => /^api-(\d{4}-\d{2}-\d{2})$/.test(key),
    );
  for (const name of names.sort().reverse()) {
    const cache = await caches.open(name);
    const response = await cache.match(request, options);
    if (response) return response;
  }
}
