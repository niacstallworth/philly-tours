import { NativeModules, Platform } from "react-native";

export type WearablePermission = "camera" | "microphone" | "audio_output" | "device_state";
export type WearableConnectionState = "unsupported" | "idle" | "pairing" | "connected" | "disconnected" | "error";

export type WearableDevice = {
  id: string;
  model: string;
  displayName: string;
  platform: "meta_glasses";
  capabilities: WearablePermission[];
};

export type WearableStatus = {
  supported: boolean;
  connectionState: WearableConnectionState;
  pairedDevice: WearableDevice | null;
  grantedPermissions: WearablePermission[];
  lastError: string | null;
  statusMessage?: string | null;
};

type NativeWearableStatus = {
  supported: boolean;
  connectionState: WearableConnectionState;
  pairedDevice: WearableDevice | null;
  grantedPermissions: WearablePermission[];
  lastError: string | null;
  statusMessage?: string | null;
};

type NativeWearablesModule = {
  getStatus(): Promise<NativeWearableStatus>;
  pairWearable(): Promise<NativeWearableStatus>;
  disconnectWearable(): Promise<NativeWearableStatus>;
};

const nativeWearablesModule: NativeWearablesModule | null =
  Platform.OS === "ios" && "PhillyNativeWearables" in NativeModules
    ? (NativeModules.PhillyNativeWearables as NativeWearablesModule)
    : null;

type WearableStatusListener = (status: WearableStatus) => void;

const listeners = new Set<WearableStatusListener>();

let currentStatus: WearableStatus = {
  supported: nativeWearablesModule != null,
  connectionState: nativeWearablesModule != null ? "idle" : "unsupported",
  pairedDevice: null,
  grantedPermissions: [],
  lastError: nativeWearablesModule != null ? null : "Meta wearables toolkit is not integrated yet."
};

function emit(next: Partial<WearableStatus>) {
  currentStatus = { ...currentStatus, ...next };
  listeners.forEach((listener) => listener(currentStatus));
}

function normalizeStatus(status: NativeWearableStatus): WearableStatus {
  return {
    supported: status.supported,
    connectionState: status.connectionState,
    pairedDevice: status.pairedDevice,
    grantedPermissions: status.grantedPermissions,
    lastError: status.lastError,
    statusMessage: status.statusMessage ?? null
  };
}

export function getWearableStatus() {
  return currentStatus;
}

export function subscribeToWearableStatus(listener: WearableStatusListener) {
  listeners.add(listener);
  listener(currentStatus);
  if (nativeWearablesModule) {
    void refreshWearableStatus();
  }
  return () => {
    listeners.delete(listener);
  };
}

export async function pairWearable() {
  if (nativeWearablesModule) {
    emit(normalizeStatus(await nativeWearablesModule.pairWearable()));
    return currentStatus;
  }

  emit({
    connectionState: "error",
    lastError: "Meta Wearables Device Access Toolkit integration is not wired in this build yet."
  });
  throw new Error("Meta Wearables Device Access Toolkit integration is not wired in this build yet.");
}

export async function disconnectWearable() {
  if (nativeWearablesModule) {
    emit(normalizeStatus(await nativeWearablesModule.disconnectWearable()));
    return;
  }

  emit({
    connectionState: currentStatus.supported ? "disconnected" : "unsupported",
    pairedDevice: null
  });
}

export async function refreshWearableStatus() {
  if (nativeWearablesModule) {
    emit(normalizeStatus(await nativeWearablesModule.getStatus()));
  }

  return currentStatus;
}
