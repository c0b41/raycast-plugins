export const capitalize = (s: string) => s && String(s[0]).toUpperCase() + String(s).slice(1);

export function extractAppName(filePath: string) {
  // Regular expression to match the last segment of the path
  const match = filePath.match(/([^\\]+)$/);

  // If no match is found, return null
  if (!match) return null;

  // Extract the matched group (app name)
  let appName = match[1];

  // Remove the .exe extension (case-insensitive)
  appName = appName.replace(/\.exe$/i, "");

  return appName;
}

export function percentageToDecimal(percentage: number) {
  return percentage / 100;
}

export function percentageValue(decimalValue: number) {
  return Math.round(decimalValue * 100);
}

// take usePolling
// https://github.com/raycast/extensions/blob/dc215a1c0989960cedadf3cf4ebdafbbc9aa6100/extensions/ploi/src/helpers.ts#L34
