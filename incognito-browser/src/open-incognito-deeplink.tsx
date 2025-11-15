import { ActionPanel, Form, Action, Clipboard, showHUD, LaunchType } from "@raycast/api";
import { createDeeplink, DeeplinkType } from "@raycast/utils";

interface DeeplinkFormValues {
  url: string;
  browser: string;
}

export default function CreateDeeplinkForm() {
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Generate Deeplink" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextField id="url" title="URL" placeholder="Enter the URL to open" />
      <Form.Dropdown id="browser" title="Browser" storeValue>
        <Form.Dropdown.Item title="Google Chrome" value="chrome" />
        <Form.Dropdown.Item title="Brave" value="brave" />
        <Form.Dropdown.Item title="Microsoft Edge" value="edge" />
        <Form.Dropdown.Item title="Firefox" value="firefox" />
        <Form.Dropdown.Item title="Safari" value="safari" />
      </Form.Dropdown>
    </Form>
  );
}

async function handleSubmit(values: DeeplinkFormValues) {
  const { url, browser } = values;

  if (!url) {
    await showHUD("❌ URL is required");
    return;
  }

  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;

  // Generate the deeplink for the open-incognito command
  const deeplink = createDeeplink({
    type: DeeplinkType.Extension,
    command: "open-incognito", // command id from your extension.json
    arguments: {
      url: normalizedUrl,
      browser,
    },
    launchType: LaunchType.Background,
  });

  // Use Raycast Clipboard API instead of browser API
  await Clipboard.copy(deeplink);
  await showHUD("✅ Deeplink copied to clipboard");
}
