import { getPreferenceValues } from "@raycast/api";
import { listDevices, getBrightness, setBrightness } from "./lib";

export interface ExtensionPreferences {
  step: string;
}

function getStep(defaultStep: number): number {
  const { step } = getPreferenceValues<ExtensionPreferences>();

  return step ? Number(step) : defaultStep;
}

function deviceName(device_name: string): string {
  return device_name.split("/").filter((segment) => segment !== "" && segment !== ".")[0];
}

export async function _setBrightness(deviceName: string, value: number): Promise<string> {
  try {
    setBrightness(deviceName, value);
    return "";
  } catch (error) {
    console.error(`Failed to set brightness for device ${deviceName}`, error);
    return "";
  }
}

export async function _increaseBrightness(deviceName: string): Promise<string> {
  try {
    let step = getStep(5);
    let currentBrightness = getBrightness(deviceName);
    setBrightness(deviceName, currentBrightness + step);
    return "";
  } catch (error) {
    console.error(`Failed to set brightness for ${deviceName}`, error);
    return "";
  }
}

export async function _decreaseBrightness(deviceName: string): Promise<string> {
  try {
    let step = getStep(5);
    let currentBrightness = getBrightness(deviceName);
    setBrightness(deviceName, currentBrightness - step);
    return "";
  } catch (error) {
    console.error(`Failed to set brightness for ${deviceName}`, error);
    return "";
  }
}

export async function fetchDisplays(): Promise<[]> {
  try {
    let list = await listDevices();
    let displays = JSON.parse(list).devices;

    //console.log(list);
    return displays.map((display: Display) => {
      return {
        name: deviceName(display.device_name),
        display_name: display.friendly_name,
        ...display,
      };
    });
  } catch (error) {
    console.error("Failed to fetch displays", error);
    return [];
  }
}

export type Display = {
  device_name: string;
  friendly_name: string;
  current_brightness: number;
  name?: string;
};
