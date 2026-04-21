import { NativeModules, Platform } from "react-native";

export type VuzixStatus = {
  sdkEnabled: boolean;
  runtimeAvailable: boolean;
  available: boolean;
  linked: boolean;
  connected: boolean;
  controlledByMe: boolean;
  deviceName: string | null;
  statusMessage: string | null;
  capabilities: string[];
};

type NativeVuzixModule = {
  getStatus(): Promise<VuzixStatus>;
  requestControl(): Promise<VuzixStatus>;
  releaseControl(): Promise<VuzixStatus>;
  sendNotification(title: string, body: string): Promise<VuzixStatus>;
};

const nativeVuzixModule: NativeVuzixModule | null =
  Platform.OS === "android" && "PhillyNativeVuzix" in NativeModules
    ? (NativeModules.PhillyNativeVuzix as NativeVuzixModule)
    : null;

export function isVuzixBridgeAvailable() {
  return nativeVuzixModule != null;
}

export async function getVuzixStatus(): Promise<VuzixStatus> {
  if (!nativeVuzixModule) {
    return {
      sdkEnabled: false,
      runtimeAvailable: false,
      available: false,
      linked: false,
      connected: false,
      controlledByMe: false,
      deviceName: null,
      statusMessage: "Vuzix bridge is only available on Android builds.",
      capabilities: []
    };
  }

  return nativeVuzixModule.getStatus();
}

export async function requestVuzixControl() {
  if (!nativeVuzixModule) {
    throw new Error("Vuzix bridge is not available in this build.");
  }

  return nativeVuzixModule.requestControl();
}

export async function releaseVuzixControl() {
  if (!nativeVuzixModule) {
    throw new Error("Vuzix bridge is not available in this build.");
  }

  return nativeVuzixModule.releaseControl();
}

export async function sendVuzixNotification(title: string, body: string) {
  if (!nativeVuzixModule) {
    throw new Error("Vuzix bridge is not available in this build.");
  }

  return nativeVuzixModule.sendNotification(title, body);
}
