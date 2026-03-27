import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";

export type WearablePermission = "camera" | "device_state";
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
const WEARABLE_STATUS_KEY = "philly_tours_wearable_status_v1";

type WearableStatusListener = (status: WearableStatus) => void;

const listeners = new Set<WearableStatusListener>();

let currentStatus: WearableStatus = {
  supported: nativeWearablesModule != null,
  connectionState: nativeWearablesModule != null ? "idle" : "unsupported",
  pairedDevice: null,
  grantedPermissions: [],
  lastError: nativeWearablesModule != null ? null : "Meta wearables toolkit is not integrated yet."
};
let didHydrateStoredStatus = false;

function emit(next: Partial<WearableStatus>) {
  currentStatus = { ...currentStatus, ...next };
  void persistWearableStatus(currentStatus);
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

async function persistWearableStatus(status: WearableStatus) {
  try {
    await AsyncStorage.setItem(WEARABLE_STATUS_KEY, JSON.stringify(status));
  } catch {
    // Keep live state even if persistence fails.
  }
}

async function hydrateStoredWearableStatus() {
  if (didHydrateStoredStatus) {
    return currentStatus;
  }

  didHydrateStoredStatus = true;

  try {
    const raw = await AsyncStorage.getItem(WEARABLE_STATUS_KEY);
    if (!raw) {
      return currentStatus;
    }

    const parsed = JSON.parse(raw) as WearableStatus;
    if (!parsed || typeof parsed !== "object") {
      return currentStatus;
    }

    currentStatus = {
      supported: typeof parsed.supported === "boolean" ? parsed.supported : currentStatus.supported,
      connectionState: parsed.connectionState || currentStatus.connectionState,
      pairedDevice: parsed.pairedDevice || null,
      grantedPermissions: Array.isArray(parsed.grantedPermissions) ? parsed.grantedPermissions : [],
      lastError: typeof parsed.lastError === "string" ? parsed.lastError : null,
      statusMessage: typeof parsed.statusMessage === "string" ? parsed.statusMessage : null
    };
  } catch {
    // Ignore corrupt persisted state.
  }

  return currentStatus;
}

export function getWearableStatus() {
  return currentStatus;
}

export function subscribeToWearableStatus(listener: WearableStatusListener) {
  listeners.add(listener);
  listener(currentStatus);
  if (!didHydrateStoredStatus) {
    void hydrateStoredWearableStatus().then((status) => listener(status));
  }
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
  await hydrateStoredWearableStatus();
  if (nativeWearablesModule) {
    emit(normalizeStatus(await nativeWearablesModule.getStatus()));
  }

  return currentStatus;
}

export async function clearPersistedWearableStatus() {
  try {
    await AsyncStorage.removeItem(WEARABLE_STATUS_KEY);
  } catch {
    // Ignore storage cleanup failures.
  }
}
