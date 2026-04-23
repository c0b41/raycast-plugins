import { useState, useEffect, useRef } from "react";
import { List, ActionPanel, Action, Toast, Icon, showToast, Color } from "@raycast/api";
import { showFailureToast, useCachedPromise } from "@raycast/utils";
import { fetchDisplays, Display, _increaseBrightness, _decreaseBrightness } from "./commands";
import events from "./events";

const REFRESH_DEBOUNCE_MS = 400;
const MIN_BRIGHTNESS = 0;
const MAX_BRIGHTNESS = 100;

type DisplayItemProps = {
  display: Display;
  onAction: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
};

function DisplayItem({ display, onAction, onRefresh, isRefreshing }: DisplayItemProps) {
  async function handleAction(
    actionFn: () => Promise<string>,
    successTitle: string,
    successMessage: string,
    errorTitle: string,
  ) {
    try {
      const result = await actionFn();
      await showToast({ title: successTitle, message: result || successMessage, style: Toast.Style.Success });
      onAction();
    } catch (error) {
      showFailureToast(error, { title: errorTitle });
    }
  }

  return (
    <List.Item
      key={display.device_name}
      id={display.device_name}
      title={display.friendly_name || display.device_name}
      accessories={[
        {
          tag: `${display.current_brightness}`,
          icon: display.current_brightness === MIN_BRIGHTNESS ? Icon.Moon : Icon.Sun,
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
          <Action
            title={isRefreshing ? "Refreshing..." : "Refresh Displays"}
            icon={{ source: Icon.ArrowClockwise, tintColor: isRefreshing ? Color.Yellow : Color.PrimaryText }}
            onAction={onRefresh}
          />
        </ActionPanel>
      }
    />
  );
}

export default function ManageDisplays() {
  const [refreshCount, setRefreshCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isLoading, data, revalidate } = useCachedPromise(fetchDisplays, [], {
    keepPreviousData: true,
    initialData: [],
  });

  useEffect(() => {
    revalidate();
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
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const handleAction = () => {
    revalidate();
  };

  const debouncedRefresh = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    setIsRefreshing(true);
    debounceTimer.current = setTimeout(() => {
      setRefreshCount((prev) => prev + 1);
      setIsRefreshing(false);
    }, REFRESH_DEBOUNCE_MS);
  };

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Filter displays by name">
      <List.Section title="Displays">
        {data.map((display: Display) => (
          <DisplayItem
            key={display.device_name}
            display={display}
            onAction={handleAction}
            onRefresh={debouncedRefresh}
            isRefreshing={isRefreshing}
          />
        ))}
      </List.Section>
    </List>
  );
}
