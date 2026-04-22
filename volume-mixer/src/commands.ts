import { getPreferenceValues } from "@raycast/api";
import { listAudioSessions, setAppVolume, setAppMute } from "./lib";
import { percentageValue } from "./utils";

export interface ExtensionPreferences {
  step: string;
}

const MIN_VOLUME = 0;
const MAX_VOLUME = 100;

function getStep(defaultStep: number): number {
  const { step } = getPreferenceValues<ExtensionPreferences>();
  return step ? Number(step) : defaultStep;
}

export async function _setVolume(session: Session): Promise<string> {
  try {
    setAppMute(session.pid, !session.muted);
    return "";
  } catch (error) {
    console.error(`Failed to set volume for ${session.appName}`, error);
    return "";
  }
}

export async function _increaseVolume(session: Session): Promise<string> {
  const step = getStep(5);
  const current = percentageValue(session.volume);
  const next = current + step;
  const wrapped = next > MAX_VOLUME ? MIN_VOLUME : next;

  try {
    setAppVolume(session.pid, wrapped);
    return "";
  } catch (error) {
    console.error(`Failed to set volume for ${session.appName} ${wrapped}`, error);
    return "";
  }
}

export async function _decreaseVolume(session: Session): Promise<string> {
  const step = getStep(5);
  const current = percentageValue(session.volume);
  const next = current - step;
  const wrapped = next < MIN_VOLUME ? MAX_VOLUME : next;

  try {
    setAppVolume(session.pid, wrapped);
    return "";
  } catch (error) {
    console.error(`Failed to set volume for ${session.appName} ${wrapped}`, error);
    return "";
  }
}

export async function fetchVolumes(): Promise<[]> {
  try {
    const list = await listAudioSessions();
    const devices = JSON.parse(list);

    const uniqueDevices = devices.reduce((accumulator: any[], current: any) => {
      if (!accumulator.find((item) => item.pid === current.pid)) {
        accumulator.push(current);
      }
      return accumulator;
    }, []);

    return uniqueDevices.map((session: any) => {
      return {
        appName: session.app_name,
        appIcon: session.app_icon,
        volume: session.volume,
        path: session.path,
        pid: session.pid,
        muted: session.muted,
      };
    });
  } catch (error) {
    console.error("Failed to fetch volume sessions", error);
    return [];
  }
}

export type Session = {
  pid: number;
  path: string;
  volume: number;
  muted: boolean;
  appName: string;
  appIcon: string;
};
