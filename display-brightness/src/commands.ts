import { getPreferenceValues } from "@raycast/api";
import { listDevices, getBrightness, setBrightness } from "./lib";

export interface ExtensionPreferences {
  step: string;
}

const MIN_BRIGHTNESS = 0;
const MAX_BRIGHTNESS = 100;

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
    const step = getStep(5);
    const currentBrightness = getBrightness(deviceName);
    const next = currentBrightness + step;
    const wrapped = next > MAX_BRIGHTNESS ? MIN_BRIGHTNESS : next;
    setBrightness(deviceName, wrapped);
    return "";
  } catch (error) {
    console.error(`Failed to set brightness for ${deviceName}`, error);
    return "";
  }
}

export async function _decreaseBrightness(deviceName: string): Promise<string> {
  try {
    const step = getStep(5);
    const currentBrightness = getBrightness(deviceName);
    const next = currentBrightness - step;
    const wrapped = next < MIN_BRIGHTNESS ? MAX_BRIGHTNESS : next;
    setBrightness(deviceName, wrapped);
    return "";
  } catch (error) {
    console.error(`Failed to set brightness for ${deviceName}`, error);
    return "";
  }
}

export async function fetchDisplays(): Promise<[]> {
  try {
    const list = await listDevices();
    const displays = JSON.parse(list).devices;

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
