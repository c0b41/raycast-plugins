import { useState, useEffect } from "react";
import { List, ActionPanel, Action, Toast, Icon, showToast } from "@raycast/api";
import { showFailureToast, useCachedPromise } from "@raycast/utils";
import { fetchDisplays, Display, _increaseBrightness, _decreaseBrightness } from "./commands";
import events from "./events";

type DisplayItemProps = {
  display: Display;
  onToggle: () => void;
};

function DisplayItem({ display, onToggle }: DisplayItemProps) {
  // Helper to wrap actions with toast notifications.
  async function handleAction(
    actionFn: () => Promise<string>,
    successTitle: string,
    successMessage: string,
    errorTitle: string,
  ) {
    try {
      const result = await actionFn();
      //await showHUD(result || successTitle || successMessage, {
      //  clearRootSearch: false,
      //  popToRootType: PopToRootType.Immediate,
      //});
      await showToast({ title: successTitle, message: result || successMessage, style: Toast.Style.Success });
      onToggle();
    } catch (error) {
      showFailureToast(error, { title: errorTitle });
    }
  }

  return (
    <List.Item
      key={display.device_name}
      id={display.device_name}
      title={display.friendly_name || display.device_name}
      //subtitle={isMain ? "Main Display" : undefined}
      //accessories={[{ tag: { value: `${display.current_brightness}`, color: Color.PrimaryText } }]}
      accessories={[
        {
          tag: `${display.current_brightness}`,
          icon: display.current_brightness === 0 ? Icon.Moon : Icon.Sun,
        },
      ]}
      actions={
        <ActionPanel>
          <Action
            title="Increase Brightness"
            icon={Icon.ArrowRightCircleFilled}
            shortcut={{
              windows: { modifiers: ["ctrl"], key: "arrowRight" },
              macOS: { modifiers: ["cmd"], key: "arrowRight" },
            }}
            onAction={() =>
              handleAction(
                () => _increaseBrightness(display.device_name),
                display.friendly_name,
                "Brightness Increased",
                "Error increasing brightness",
              )
            }
          />
          <Action
            title="Decrease Brightness"
            icon={Icon.ArrowLeftCircleFilled}
            shortcut={{
              windows: { modifiers: ["ctrl"], key: "arrowLeft" },
              macOS: { modifiers: ["cmd"], key: "arrowLeft" },
            }}
            onAction={() =>
              handleAction(
                () => _decreaseBrightness(display.device_name),
                display.friendly_name,
                "Brightness Decreased",
                "Error decreasing brightness",
              )
            }
          />
        </ActionPanel>
      }
    />
  );
}

export default function ManageDisplays() {
  const [refreshCount, setRefreshCount] = useState(0);

  const { isLoading, data, revalidate } = useCachedPromise(fetchDisplays, [], {
    keepPreviousData: true,
    initialData: [],
  });

  // Load displays.
  useEffect(() => {
    async function loadDisplays() {
      try {
        revalidate();
      } catch (error) {
        console.error("Failed to load displays", error);
      }
    }
    loadDisplays();
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
    <List isLoading={isLoading} searchBarPlaceholder="Filter displays by name">
      <List.Section title="Displays">
        {data.map((display: Display) => (
          <DisplayItem key={display.device_name} display={display} onToggle={handleToggleRefresh} />
        ))}
      </List.Section>
    </List>
  );
}
