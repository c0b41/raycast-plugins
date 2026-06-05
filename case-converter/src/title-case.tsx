import { Clipboard, showHUD } from "@raycast/api";
import { applyCaseConversion } from "./utils/case-converter";

export default async function Command() {
  const text = await Clipboard.readText();
  if (!text) return showHUD("⚠️ Clipboard is empty");

  const result = applyCaseConversion(text, "title");
  await Clipboard.copy(result);
  await Clipboard.paste(result);
  await showHUD("✓ Pasted as Title Case");
}
