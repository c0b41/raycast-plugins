import { useState, useEffect, useRef } from "react";
import { List, ActionPanel, Action, showToast, Toast, Icon } from "@raycast/api";
import { showFailureToast, useCachedPromise } from "@raycast/utils";
import { fetchVolumes, Session, _increaseVolume, _decreaseVolume, _setVolume } from "./commands";
import { percentageValue, capitalize } from "./utils";
import events from "./events";

const REFRESH_DEBOUNCE_MS = 1000;

type VolumeItemProps = {
  session: Session;
  onToggle: () => void;
  isRefreshing: boolean;
};

function VolumeItem({ session, onToggle, isRefreshing }: VolumeItemProps) {
  async function handleAction(
    actionFn: () => Promise<string>,
    successTitle: string,
    successMessage: string,
    errorTitle: string,
  ) {
    try {
      const result = await actionFn();
      await showToast({ title: successTitle, message: result || successMessage, style: Toast.Style.Success });
      onToggle();
    } catch (error) {
      showFailureToast(error, { title: errorTitle });
    }
  }

  return (
    <List.Item
      key={session.pid}
      id={`p_${session.pid}`}
      title={capitalize(session.appName)}
      accessories={[
        {
          tag: `${percentageValue(session.volume)}`,
          icon: session.muted ? Icon.SpeakerOff : Icon.SpeakerOn,
        },
      ]}
      // { icon: session.muted ? Icon.SpeakerOff : Icon.SpeakerOn },
      //{ tag: { value: `${percentageValue(session.volume)}`, color: Color.PrimaryText } },
      icon={`data:image/jpeg;base64,${session.appIcon}`}
      actions={
        <ActionPanel>
          <Action
            title="Increase Volume"
            icon={Icon.ArrowUp}
            shortcut={{
              windows: { modifiers: ["ctrl"], key: "arrowRight" },
              macOS: { modifiers: ["cmd"], key: "arrowRight" },
            }}
            onAction={() =>
              handleAction(
                () => _increaseVolume(session),
                capitalize(session.appName),
                "Volume Increased",
                "Error increasing volume",
              )
            }
          />
          <Action
            title="Decrease Volume"
            icon={Icon.ArrowDown}
            shortcut={{
              windows: { modifiers: ["ctrl"], key: "arrowLeft" },
              macOS: { modifiers: ["cmd"], key: "arrowLeft" },
            }}
            onAction={() =>
              handleAction(
                () => _decreaseVolume(session),
                capitalize(session.appName),
                "Volume Decreased",
                "Error decreasing volume",
              )
            }
          />
          <Action
            title="Toggle Mute"
            icon={session.muted ? Icon.SpeakerOff : Icon.SpeakerOn}
            shortcut={{
              windows: { modifiers: ["ctrl"], key: "m" },
              macOS: { modifiers: ["cmd"], key: "m" },
            }}
            onAction={() =>
              handleAction(
                () => _setVolume(session),
                capitalize(session.appName),
                `${capitalize(session.appName)} session toggled.`,
                "Session toggle failed",
              )
            }
          />
          <Action
            title={isRefreshing ? "Refreshing..." : "Refresh Sessions"}
            icon={{ source: Icon.ArrowClockwise, tintColor: isRefreshing ? "#FFD700" : undefined }}
            onAction={onToggle}
          />
          {/*<Action.CreateQuicklink
            title="Create Deeplink"
            quicklink={{
              name: "Create Triage Issue for Myself",
              link: createDeeplink({
                ownerOrAuthorName: "linear",
                extensionName: "linear",
                command: "create-issue-for-myself",
                arguments: {
                  title: "Triage new issues",
                },
              }),
            }}
          />*/}
        </ActionPanel>
      }
    />
  );
}

export default function ManageMixerList() {
  const [refreshCount, setRefreshCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isLoading, data, revalidate } = useCachedPromise(fetchVolumes, [], {
    keepPreviousData: true,
    initialData: [],
  });

  useEffect(() => {
    async function loadVolumes() {
      try {
        setIsRefreshing(true);
        revalidate();
      } catch (error) {
        console.error("Failed to load volumes", error);
      } finally {
        setIsRefreshing(false);
      }
    }
    loadVolumes();
  }, [refreshCount]);

  useEffect(() => {
    const handler = () => debouncedRefresh();
    events.on("refresh", handler);
    return () => {
      events.off("refresh", handler);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const debouncedRefresh = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    setIsRefreshing(true);
    debounceTimer.current = setTimeout(() => {
      setRefreshCount((prev) => prev + 1);
      setIsRefreshing(false);
    }, REFRESH_DEBOUNCE_MS);
  };

  return (
    <List isLoading={isLoading}>
      <List.Section title="Volume Sessions">
        {data.map((session: Session) => (
          <VolumeItem key={session.pid} session={session} onToggle={debouncedRefresh} isRefreshing={isRefreshing} />
        ))}
      </List.Section>
    </List>
  );
}
