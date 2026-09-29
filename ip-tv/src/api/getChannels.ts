import parser from "iptv-playlist-parser";
import { Cache, showToast, Toast } from "@raycast/api";
import { TvModel, TvModelFlag } from "../interface/tvmodel";

const URL = "https://iptv-org.github.io/iptv/countries/tr.m3u";

const cache = new Cache();
const CACHE_KEY_DATA = "turkish_channels_data";
const CACHE_KEY_TIMESTAMP = "turkish_channels_timestamp";
const CACHE_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Returns Turkish IPTV channels.
 *
 * - If the cache is fresh (< 12h old), returns cached data immediately.
 * - If stale or missing, fetches fresh data and updates the cache.
 * - If the fetch fails but stale cache exists, falls back to stale cache.
 *
 * @param force - when true, skips the cache freshness check and refetches.
 */
export async function getChannels(force = false): Promise<TvModelFlag[]> {
  const cachedTimestamp = cache.get(CACHE_KEY_TIMESTAMP);
  const cachedData = cache.get(CACHE_KEY_DATA);

  // 1. Fresh cache → return immediately
  if (!force && cachedTimestamp && cachedData) {
    const age = Date.now() - parseInt(cachedTimestamp, 10);
    if (age < CACHE_DURATION_MS) {
      const remainingMin = Math.round((CACHE_DURATION_MS - age) / 60000);
      console.log(`[iptv] Using cached channels (${Math.round(age / 60000)}m old, refreshes in ${remainingMin}m)`);
      try {
        return JSON.parse(cachedData) as TvModelFlag[];
      } catch {
        // Fall through and refetch if the cached JSON is corrupt.
        console.warn("[iptv] Cached data corrupt, refetching");
      }
    }
  }

  // 2. Fetch fresh data
  const channels: TvModelFlag[] = [];

  try {
    const response = await fetch(URL);
    const data = await response.text();
    const playlists = parser.parse(data);

    playlists.items.forEach((playlist) => {
      // country tag is unreliable compared to url
      const splitted_url = playlist.tvg.id.split(".");
      const country_name = splitted_url[splitted_url.length - 1];

      // extract everything inside () from playlist.name
      const regex = /\((.*?)\)/g;
      const match = regex.exec(playlist.name);
      const res = match ? match[1] : "360p";

      // if res starts with a number it's probably a resolution
      const resolution = /^\d/.test(res) ? res : "360p";

      // padding so the resolution column looks aligned
      const padding = "     ";
      const padded_resolution = padding.substring(0, padding.length - resolution.length) + resolution;

      // remove everything inside () or [] and replace . with space
      const regex2 = /\[(.*?)\]/g;
      const title = playlist.name.replace(regex, "").replace(regex2, "").replace(".", " ");

      const tvmodel = playlist as unknown as TvModel;

      channels.push({
        tvModel: tvmodel,
        title,
        // We're only showing Turkey, so hardcode the flag —
        // no more CountryData dependency.
        flag: { name: "Turkey", emoji: "🇹🇷", code: "TR", image: "" },
        resolution: padded_resolution,
      });
    });

    // 3. Update cache
    cache.set(CACHE_KEY_DATA, JSON.stringify(channels));
    cache.set(CACHE_KEY_TIMESTAMP, Date.now().toString());

    console.log(`[iptv] Fetched ${channels.length} channels, cache updated`);

    return channels;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[iptv] Fetch failed:", message);

    // 4. Fall back to stale cache
    if (cachedData) {
      try {
        const stale = JSON.parse(cachedData) as TvModelFlag[];
        await showToast({
          title: "Using offline data",
          message: `Refresh failed — showing cached list (${stale.length} channels)`,
          style: Toast.Style.Failure,
        });
        return stale;
      } catch {
        // ignore, fall through to error toast
      }
    }

    await showToast({
      title: "Error loading channels",
      message,
      style: Toast.Style.Failure,
    });
    throw error;
  }
}

/**
 * Utility to clear the cache manually (e.g. from a "Clear Cache" action).
 */
export function clearChannelCache(): void {
  cache.remove(CACHE_KEY_DATA);
  cache.remove(CACHE_KEY_TIMESTAMP);
}
