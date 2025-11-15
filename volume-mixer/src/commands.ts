import { getPreferenceValues } from "@raycast/api";
import { listAudioSessions, setAppVolume, setAppMute } from "./lib";
import { percentageValue } from "./utils";

export interface ExtensionPreferences {
  step: string;
}

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
  let step = getStep(5);
  let current = percentageValue(session.volume);
  let updatedVol = current + step;

  try {
    if (updatedVol > 100) {
      setAppVolume(session.pid, 100);
    } else {
      setAppVolume(session.pid, updatedVol);
    }
    return "";
  } catch (error) {
    console.error(`Failed to set volume for ${session.appName} ${updatedVol}`, error);
    return "";
  }
}

export async function _decreaseVolume(session: Session): Promise<string> {
  let step = getStep(5);
  let current = percentageValue(session.volume);
  let updatedVol = current - step;

  try {
    if (updatedVol <= 0) {
      setAppVolume(session.pid, 0);
    } else {
      setAppVolume(session.pid, updatedVol);
    }

    return "";
  } catch (error) {
    console.error(`Failed to set volume for ${session.appName} ${updatedVol}`, error);
    return "";
  }
}

export async function fetchVolumes(): Promise<[]> {
  try {
    let list = await listAudioSessions();
    let devices = JSON.parse(list);

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
