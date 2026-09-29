import { spawn } from "child_process";
import { existsSync } from "fs";
import { showToast, Toast } from "@raycast/api";

const VLC_CANDIDATES = ["C:\\Program Files\\VideoLAN\\VLC\\vlc.exe", "C:\\Program Files (x86)\\VideoLAN\\VLC\\vlc.exe"];

function resolveVlcPath(): string {
  return VLC_CANDIDATES.find((p) => existsSync(p)) ?? "vlc";
}

export async function openInVLC(url: string, channelName?: string): Promise<void> {
  if (!url) {
    await showToast({
      title: "No stream URL",
      message: channelName ?? "",
      style: Toast.Style.Failure,
    });
    return;
  }

  const vlcPath = resolveVlcPath();

  // Show "Opening…" immediately, before VLC actually launches.
  const toast = await showToast({
    title: "Opening in VLC…",
    message: channelName ?? url,
    style: Toast.Style.Animated,
  });

  try {
    const child = spawn(vlcPath, ["--started-from-file", url], {
      detached: true, // let VLC outlive the Raycast command
      stdio: "ignore", // don't pipe stdout/stderr back to us
      windowsHide: false, // show VLC's window
    });

    // Detach from the parent so Raycast doesn't wait on VLC.
    child.unref();

    // 'error' fires if VLC couldn't start at all (e.g. exe not found).
    child.on("error", (err) => {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to open VLC";
      toast.message = err.message;
    });

    // 'spawn' fires once the process is actually created.
    child.on("spawn", () => {
      toast.style = Toast.Style.Success;
      toast.title = "Opening in VLC";
      toast.message = channelName ?? "";
      setTimeout(() => {
        toast.hide();
      }, 1500);
    });
  } catch (error) {
    toast.style = Toast.Style.Failure;
    toast.title = "Failed to open VLC";
    toast.message = error instanceof Error ? error.message : String(error);
  }
}
