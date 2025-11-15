import { useState, useEffect } from "react";
import { List, Color, ActionPanel, Action, showToast, Toast, Icon } from "@raycast/api";
import { showFailureToast, useCachedPromise, createDeeplink, DeeplinkType } from "@raycast/utils";
import { fetchVolumes, Session, _increaseVolume, _decreaseVolume, _setVolume } from "./commands";
import { percentageValue, capitalize } from "./utils";
import events from "./events";

type VolumeItemProps = {
  session: Session;
  onToggle: () => void;
};

function VolumeItem({ session, onToggle }: VolumeItemProps) {

  // Helper to wrap actions with toast notifications.
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
            title="Toggle Session"
            icon={session.muted ? Icon.SpeakerOff : Icon.SpeakerOn}
            shortcut={{
              windows: { modifiers: ["ctrl"], key: "m" },
              macOS: { modifiers: ["cmd"], key: "m" },
            }}
            onAction={() =>
              handleAction(
                () => _setVolume(session),
                "Volume Decreased",
                `${capitalize(session.appName)} session toggled.`,
                "session toggle failed",
              )
            }
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

  const { isLoading, data, revalidate } = useCachedPromise(fetchVolumes, [], {
    keepPreviousData: true,
    initialData: [],
  });

  // Load displays.
  useEffect(() => {
    async function loadVolumes() {
      try {
        revalidate();
      } catch (error) {
        console.error("Failed to load volumes", error);
      }
    }
    loadVolumes();
  }, [refreshCount]);

  // Listen for refresh events emitted by the ResolutionList.
  useEffect(() => {
    const handler = () => setRefreshCount((prev) => prev + 1);
    events.on("refresh", handler);
    return () => {
      events.off("refresh", handler);
    };
  }, []);

  const handleToggleRefresh = () => {
    setRefreshCount((prev) => prev + 1);
  };

  return (
    <List isLoading={isLoading}>
      <List.Section title="Volume Sessions">
        {data.map((session: Session) => (
          <VolumeItem key={session.pid} session={session} onToggle={handleToggleRefresh} />
        ))}
      </List.Section>
    </List>
  );
}
