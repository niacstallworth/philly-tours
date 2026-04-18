import { NativeModules, Platform } from "react-native";

export type NativeArStatus = {
  available: boolean;
  reason: string;
  sessionRunning: boolean;
  placedModelCount: number;
};

type NativeArModule = {
  getStatus(): Promise<NativeArStatus>;
};

const nativeArModule: NativeArModule | null =
  Platform.OS === "ios" && "PhillyNativeAR" in NativeModules
    ? (NativeModules.PhillyNativeAR as NativeArModule)
    : null;

export async function getNativeArStatus(): Promise<NativeArStatus> {
  if (!nativeArModule) {
    return {
      available: false,
      reason: Platform.OS === "ios" ? "Native AR bridge is unavailable in this build." : "Native AR is only available in the iPhone build.",
      sessionRunning: false,
      placedModelCount: 0
    };
  }

  return nativeArModule.getStatus();
}
