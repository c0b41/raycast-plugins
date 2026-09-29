import { Action, ActionPanel, Icon, Image, Keyboard, List } from "@raycast/api";
import { createDeeplink } from "@raycast/utils";
import { useEffect, useState } from "react";
import { TvModelFlag } from "../interface/tvmodel";
import { openInVLC } from "../utils/vlc";
import { loadFavorites, toggleFavorite } from "../utils/favorites";

type Props = {
  channel: TvModelFlag;
  onFavoriteChanged?: () => void;
  onHardRefresh?: () => void;
};

export function SearchListItem({ channel, onFavoriteChanged, onHardRefresh }: Props) {
  const id = channel.tvModel.tvg.id;
  const logoUrl = channel.tvModel.tvg.logo;
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    let alive = true;
    loadFavorites().then((f) => {
      if (alive) setIsFavorite(f.includes(id));
    });
    return () => {
      alive = false;
    };
  }, [id]);

  const onToggleFavorite = async () => {
    const next = await toggleFavorite(id);
    setIsFavorite(next.includes(id));
    onFavoriteChanged?.();
  };

  const icon: Image.ImageLike = logoUrl
    ? { source: logoUrl, fallback: isFavorite ? Icon.Star : Icon.Circle }
    : isFavorite
      ? Icon.Star
      : Icon.Circle;

  // Deeplink carries only the stable channel id, not the stream URL.
  const deeplink = createDeeplink({
    command: "index",
    context: {
      channelId: id,
    },
  });

  return (
    <List.Item
      icon={icon}
      title={channel.title}
      subtitle={channel.resolution}
      accessories={[...(isFavorite ? [{ icon: Icon.Star, tooltip: "Favorite" }] : []), { text: id }]}
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Playback">
            <Action
              title="Open in VLC"
              icon={Icon.Play}
              onAction={() => openInVLC(channel.tvModel.url, channel.title)}
            />
            <Action.CopyToClipboard
              title="Copy Stream URL"
              content={channel.tvModel.url}
              shortcut={Keyboard.Shortcut.Common.Copy}
            />
          </ActionPanel.Section>

          <ActionPanel.Section title="Favorites">
            <Action
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              icon={Icon.Star}
              shortcut={{
                macOS: { modifiers: ["cmd"], key: "f" },
                Windows: { modifiers: ["ctrl"], key: "f" },
              }}
              onAction={onToggleFavorite}
            />
          </ActionPanel.Section>
          <ActionPanel.Section title="Others">
            <Action.CreateQuicklink
              title="Create Quicklink for This Channel"
              quicklink={{
                name: channel.title,
                link: deeplink,
              }}
            />

            {onHardRefresh && (
              <Action
                title="Refresh Channels"
                icon={Icon.ArrowClockwise}
                shortcut={Keyboard.Shortcut.Common.Refresh}
                onAction={onHardRefresh}
              />
            )}
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
