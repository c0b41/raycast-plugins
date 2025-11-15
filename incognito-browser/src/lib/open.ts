import { spawn, ChildProcess } from "child_process";
import path from "path";
import os from "os";

type Browser = "chrome" | "brave" | "edge" | "firefox" | "ie" | "opera";

interface OpenOptions {
  browser?: Browser;
  defaultBrowser?: Browser;
  incognito?: boolean;
  background?: boolean;
  outputOnly?: boolean;
}

interface OpenResult {
  cmd: string;
  args: string[];
  process?: ChildProcess;
}

const WINDOWS_BROWSERS: Record<Browser, string> = {
  chrome: "chrome",
  brave: "brave",
  edge: "msedge",
  firefox: "firefox",
  ie: "iexplore",
  opera: "opera",
};

const INCOGNITOS: Record<Browser, string> = {
  chrome: "--incognito",
  brave: "--incognito",
  edge: "--inprivate",
  firefox: "-private-window",
  ie: "-private",
  opera: "--private",
};

// Helper: Get the user data directory path for each browser
const getUserDataDir = (browser: Browser): string => {
  const homeDir = os.homedir(); // Get the user's home directory

  switch (browser) {
    case "chrome":
      return path.join(homeDir, "AppData", "Local", "Google", "Chrome", "User Data");
    case "brave":
      return path.join(homeDir, "AppData", "Local", "BraveSoftware", "Brave-Browser", "User Data");
    case "edge":
      return path.join(homeDir, "AppData", "Local", "Microsoft", "Edge", "User Data");
    case "firefox":
      return path.join(homeDir, "AppData", "Roaming", "Mozilla", "Firefox", "Profiles");
    case "opera":
      return path.join(homeDir, "AppData", "Roaming", "Opera Software", "Opera Stable");
    case "ie":
      return ""; // Internet Explorer does not use profiles like modern browsers
    default:
      throw new Error(`Unsupported browser: ${browser}`);
  }
};

// Profile directories for browsers
const PROFILE_DIRS: Record<Browser, string> = {
  chrome: "Default", // Chrome default profile name
  brave: "Default", // Brave default profile name
  edge: "Default", // Edge default profile name
  firefox: "default-release", // Firefox default profile
  opera: "Opera Stable", // Opera default profile
  ie: "", // Internet Explorer does not use profiles like modern browsers
};

// Helper: is a valid URL
function isValidUrl(location: string) {
  try {
    return !!new URL(location);
  } catch {
    return false;
  }
}

// Windows-only open function
export const open = (location: string, options: OpenOptions = {}): Promise<OpenResult> => {
  return new Promise((resolve, reject) => {
    if (!location || typeof location !== "string") return reject(new Error("No location specified"));
    if (!isValidUrl(location)) return reject(new Error("Invalid URL"));
    if (process.platform !== "win32") return reject(new Error("This function only supports Windows"));

    const browser = options.browser || options.defaultBrowser || "chrome";
    const app = WINDOWS_BROWSERS[browser];
    if (!app) return reject(new Error(`Unsupported browser: ${browser}`));

    const args: string[] = ["/c", "start", '""']; // start with empty window title
    if (options.background) args.push("/min");

    // Build command
    let profileArgs: string[] = [];

    // For browsers that support user data directories, we'll use them
    if (["chrome", "brave", "edge", "firefox", "opera"].includes(browser)) {
      const userDataDir = getUserDataDir(browser); // Get user data dir
      const profileDir = PROFILE_DIRS[browser]; // Get profile dir
      profileArgs = [`--user-data-dir=${userDataDir}`, `--profile-directory=${profileDir}`];
    }

    if (options.incognito && INCOGNITOS[browser]) {
      args.push(app, ...profileArgs, INCOGNITOS[browser], location);
    } else {
      args.push(app, ...profileArgs, location);
    }

    const cmd = "cmd";
    const result: OpenResult = { cmd, args };

    if (!options.outputOnly) {
      const child = spawn(cmd, args, { detached: true, stdio: "ignore" });
      child.unref();
      result.process = child;
    }

    resolve(result);
  });
};

// Open with default browser if no browser specified
export const openWithDefault = (location: string, options: OpenOptions = {}): Promise<OpenResult> => {
  if (options.browser) return open(location, options);

  // fallback to Chrome if no defaultBrowser is set
  return open(location, { ...options, defaultBrowser: "chrome" });
};
