import { LaunchProps, List, showToast, Toast } from "@raycast/api";
import { useCallback, useEffect, useState } from "react";
import { TvModelFlag } from "./interface/tvmodel";
import { getChannels, clearChannelCache } from "./api/getChannels";
import { SearchListItem } from "./components/searchListItem";
import { loadFavorites } from "./utils/favorites";
import { openInVLC } from "./utils/vlc";

type LaunchContext = {
  channelId?: string;
};

function partition(all: TvModelFlag[], favorites: string[]) {
  const isFav = (c: TvModelFlag) => favorites.includes(c.tvModel.tvg.id);
  return {
    favorites: all.filter(isFav),
    others: all.filter((c) => !isFav(c)),
  };
}

export default function Command(props: LaunchProps<{ launchContext?: LaunchContext }>) {
  const [allChannels, setAllChannels] = useState<TvModelFlag[]>([]);
  const [favChannels, setFavChannels] = useState<TvModelFlag[]>([]);
  const [otherChannels, setOtherChannels] = useState<TvModelFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async (all: TvModelFlag[]) => {
    const favorites = await loadFavorites();
    const { favorites: favs, others } = partition(all, favorites);
    setFavChannels(favs);
    setOtherChannels(others);
  }, []);

  const load = useCallback(
    async (force = false) => {
      setIsLoading(true);
      try {
        const loaded = await getChannels(force);
        setAllChannels(loaded);
        await refresh(loaded);
        return loaded;
      } finally {
        setIsLoading(false);
      }
    },
    [refresh],
  );

  useEffect(() => {
    (async () => {
      const { channelId } = props.launchContext ?? {};

      if (channelId) {
        // Quicklink path: fetch (or load from cache) the channel list,
        // then find the channel by its stable id and open it in VLC.
        const loaded = await load(false);
        const match = loaded?.find((c) => c.tvModel.tvg.id === channelId);

        if (match) {
          await openInVLC(match.tvModel.url, match.title);
        } else {
          await showToast({
            title: "Channel not found",
            message: `No channel with id "${channelId}" in the current list`,
            style: Toast.Style.Failure,
          });
        }
        return;
      }

      // Normal path: just load the list.
      await load(false);
    })();
  }, [load, props.launchContext]);

  const onHardRefresh = useCallback(async () => {
    clearChannelCache();
    await load(true);
  }, [load]);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Search Turkish channels..." throttle>
      {favChannels.length > 0 && (
        <List.Section title="Favorites" subtitle={String(favChannels.length)}>
          {favChannels.map((channel) => (
            <SearchListItem
              key={channel.tvModel.tvg.id || channel.tvModel.name}
              channel={channel}
              onFavoriteChanged={() => refresh(allChannels)}
              onHardRefresh={onHardRefresh}
            />
          ))}
        </List.Section>
      )}

      <List.Section
        title={favChannels.length > 0 ? "All Channels" : "Channels"}
        subtitle={String(otherChannels.length)}
      >
        {otherChannels.map((channel) => (
          <SearchListItem
            key={channel.tvModel.tvg.id || channel.tvModel.name}
            channel={channel}
            onFavoriteChanged={() => refresh(allChannels)}
            onHardRefresh={onHardRefresh}
          />
        ))}
      </List.Section>
    </List>
  );
}
