import { LaunchProps, getPreferenceValues, Clipboard, showHUD } from "@raycast/api";
import { openWithDefault } from "./lib/open";

interface Preferences {
  defaultBrowser: string;
}

interface CommandArguments {
  url?: string;
  browser?: string;
}

interface LaunchContext {
  url?: string;
  browser?: string;
}

export default async function Command(
  props: LaunchProps<{ arguments: CommandArguments; launchContext?: LaunchContext }>,
) {
  const preferences = getPreferenceValues<Preferences>();

  // 🛑 Guard: Prevent recursive self-invocation
  const possibleUrl = props.arguments.url || props.launchContext?.url;
  if (possibleUrl?.startsWith("raycast://")) {
    await showHUD("🛑 Ignored self-deeplink to prevent recursion");
    return;
  }

  // 1️⃣ Resolve browser and URL
  const selectedBrowser = resolveBrowser(props, preferences);
  const targetUrl = await resolveUrl(props);

  if (!targetUrl) {
    await showHUD("❌ No valid URL provided or found in clipboard");
    return;
  }

  const normalizedUrl = normalizeUrl(targetUrl);

  // 2️⃣ Map user selection to bopen-supported keys
  const browserAppMap: Record<string, string> = {
    chrome: "chrome",
    brave: "brave",
    edge: "edge",
    firefox: "firefox",
    safari: "safari",
    ie: "ie",
  };

  try {
    const browserKey = browserAppMap[selectedBrowser];
    if (!browserKey) throw new Error(`Unsupported browser: ${selectedBrowser}`);

    await openWithDefault(normalizedUrl, { browser: browserKey, incognito: true });
    await showHUD(`🌐 Opened in ${selectedBrowser} (Incognito)`);
  } catch (err) {
    console.error(err);
    await showHUD("❌ Failed to open URL");
  }
}

async function resolveUrl(
  props: LaunchProps<{ arguments: CommandArguments; launchContext?: LaunchContext }>,
): Promise<string | undefined> {
  const deeplinkUrl = getUrlFromDeeplink(props);
  if (deeplinkUrl) return deeplinkUrl;

  const argUrl = getUrlFromArgs(props);
  if (argUrl) return argUrl;

  if (!props.launchContext) {
    const clipboardUrl = await getUrlFromClipboard();
    if (clipboardUrl) {
      await showHUD("📋 Using URL from clipboard");
      return clipboardUrl;
    }
  }

  return undefined;
}

function resolveBrowser(
  props: LaunchProps<{ arguments: CommandArguments; launchContext?: LaunchContext }>,
  preferences: Preferences,
): string {
  return props.launchContext?.browser || props.arguments.browser || preferences.defaultBrowser || "chrome";
}

function getUrlFromArgs(props: LaunchProps<{ arguments: CommandArguments }>): string | undefined {
  const url = props.arguments.url?.trim();
  return url && isValidUrl(url) ? url : undefined;
}

function getUrlFromDeeplink(props: LaunchProps<{ launchContext?: LaunchContext }>): string | undefined {
  const url = props.launchContext?.url?.trim();
  return url && isValidUrl(url) ? url : undefined;
}

async function getUrlFromClipboard(): Promise<string | undefined> {
  const clipboard = await Clipboard.readText();
  if (clipboard && isValidUrl(clipboard.trim())) {
    return clipboard.trim();
  }
  return undefined;
}

function normalizeUrl(url: string): string {
  return url.startsWith("http") ? url : `https://${url}`;
}

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str.startsWith("http") ? str : `https://${str}`);
    return !!url.hostname;
  } catch {
    return false;
  }
}
