import { getPreferenceValues } from "@raycast/api";
import { listAudioSessions, setAppVolume, setAppMute } from "./lib";
import { percentageValue } from "./utils";

export interface ExtensionPreferences {
  step: string;
}

const MIN_VOLUME = 0;
const MAX_VOLUME = 100;

const EXCLUDED_APPS = ["Raycast"];

function isExcludedApp(appName: string): boolean {
  return EXCLUDED_APPS.some((excluded) => excluded.toLowerCase() === appName.toLowerCase());
}

function getStep(defaultStep: number): number {
  const { step } = getPreferenceValues<ExtensionPreferences>();
  const stepNumber = Number(step);
  return !isNaN(stepNumber) && stepNumber > 0 ? stepNumber : defaultStep;
}

export type Session = {
  pid: number;
  path: string;
  volume: number;
  muted: boolean;
  appName: string;
  appIcon: string;
};

export async function _setVolume(session: Session): Promise<string> {
  if (isExcludedApp(session.appName)) return "Excluded app";
  try {
    setAppMute(session.pid, !session.muted);
    return "";
  } catch (error) {
    console.error(`Failed to set volume for ${session.appName}`, error);
    return "";
  }
}

export async function _increaseVolume(session: Session): Promise<string> {
  if (isExcludedApp(session.appName)) return "Excluded app";

  const step = getStep(5);
  const current = percentageValue(session.volume);
  const next = Math.min(current + step, MAX_VOLUME);

  try {
    setAppVolume(session.pid, next);
    return "";
  } catch (error) {
    console.error(`Failed to increase volume for ${session.appName} to ${next}`, error);
    return "";
  }
}

export async function _decreaseVolume(session: Session): Promise<string> {
  if (isExcludedApp(session.appName)) return "Excluded app";

  const step = getStep(5);
  const current = percentageValue(session.volume);
  const next = Math.max(current - step, MIN_VOLUME);

  try {
    setAppVolume(session.pid, next);
    return "";
  } catch (error) {
    console.error(`Failed to decrease volume for ${session.appName} to ${next}`, error);
    return "";
  }
}

export async function fetchVolumes(): Promise<Session[]> {
  try {
    const list = await listAudioSessions();
    const devices = JSON.parse(list) as Array<{
      pid: number;
      path: string;
      volume: number;
      muted: boolean;
      app_name: string;
      app_icon: string;
    }>;

    const uniqueDevices = devices.reduce(
      (accumulator: typeof devices, current) => {
        if (!accumulator.find((item) => item.pid === current.pid)) {
          accumulator.push(current);
        }
        return accumulator;
      },
      [] as typeof devices,
    );

    return uniqueDevices
      .filter((session) => !isExcludedApp(session.app_name))
      .map((session) => ({
        pid: session.pid,
        path: session.path,
        volume: session.volume,
        muted: session.muted,
        appName: session.app_name,
        appIcon: session.app_icon,
      }));
  } catch (error) {
    console.error("Failed to fetch audio sessions", error);
    return [];
  }
}
