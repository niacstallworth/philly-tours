import { NativeModules, Platform } from "react-native";

export type NativeArStatus = {
  available: boolean;
  reason: string;
  sessionRunning: boolean;
  placedModelCount: number;
};

type NativeArModule = {
  getStatus(): Promise<NativeArStatus>;
  startSession?(): Promise<void>;
  placeModel?(placement: {
    id: string;
    modelUrl: string;
    scale?: number;
    rotationYDeg?: number;
    verticalOffsetM?: number;
  }): Promise<void>;
  stopSession?(): Promise<void>;
};

const nativeArModule: NativeArModule | null =
  (Platform.OS === "ios" || Platform.OS === "android") && "PhillyNativeAR" in NativeModules
    ? (NativeModules.PhillyNativeAR as NativeArModule)
    : null;

export async function getNativeArStatus(): Promise<NativeArStatus> {
  if (!nativeArModule) {
    return {
      available: false,
      reason:
        Platform.OS === "ios" || Platform.OS === "android"
          ? "Native AR bridge is unavailable in this build."
          : "Native AR is only available in the mobile app build.",
      sessionRunning: false,
      placedModelCount: 0
    };
  }

  return nativeArModule.getStatus();
}

export async function startNativeArSession(): Promise<void> {
  if (!nativeArModule?.startSession) {
    throw new Error("Native AR session control is unavailable in this build.");
  }
  return nativeArModule.startSession();
}

export async function placeNativeArModel(placement: {
  id: string;
  modelUrl: string;
  scale?: number;
  rotationYDeg?: number;
  verticalOffsetM?: number;
}): Promise<void> {
  if (!nativeArModule?.placeModel) {
    throw new Error("Native AR model placement is unavailable in this build.");
  }
  return nativeArModule.placeModel(placement);
}

export async function stopNativeArSession(): Promise<void> {
  if (!nativeArModule?.stopSession) {
    throw new Error("Native AR session control is unavailable in this build.");
  }
  return nativeArModule.stopSession();
}
