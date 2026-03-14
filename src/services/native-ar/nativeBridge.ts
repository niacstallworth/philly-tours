import { NativeModules } from "react-native";
import { ARModelPlacement } from "./types";

type NativeGetStatusResponse = {
  available: boolean;
  reason?: string;
  sessionRunning?: boolean;
  placedModelCount?: number;
};

type NativeARModule = {
  getStatus: () => Promise<NativeGetStatusResponse>;
  startSession: () => Promise<void>;
  placeModel: (placement: ARModelPlacement) => Promise<void>;
  stopSession: () => Promise<void>;
};

function getModule(): NativeARModule | null {
  const mod = (NativeModules as Record<string, unknown>).PhillyNativeAR;
  return (mod as NativeARModule) || null;
}

export function hasNativeARBridge() {
  return !!getModule();
}

export async function nativeGetStatus(): Promise<NativeGetStatusResponse> {
  const mod = getModule();
  if (!mod) {
    return {
      available: false,
      reason: "PhillyNativeAR bridge not linked yet.",
      sessionRunning: false,
      placedModelCount: 0
    };
  }

  return mod.getStatus();
}

export async function nativeStartSession() {
  const mod = getModule();
  if (!mod) {
    throw new Error("PhillyNativeAR bridge not linked.");
  }

  await mod.startSession();
}

export async function nativePlaceModel(placement: ARModelPlacement) {
  const mod = getModule();
  if (!mod) {
    throw new Error("PhillyNativeAR bridge not linked.");
  }

  await mod.placeModel(placement);
}

export async function nativeStopSession() {
  const mod = getModule();
  if (!mod) {
    throw new Error("PhillyNativeAR bridge not linked.");
  }

  await mod.stopSession();
}
