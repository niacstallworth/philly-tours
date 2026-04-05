import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";

export type WearablePermission = "camera" | "device_state";
export type WearableConnectionState = "unsupported" | "idle" | "pairing" | "connected" | "disconnected" | "error";
export type WearableIntegrationMode = "native" | "manual" | "none";

export type WearableDevice = {
  id: string;
  model: string;
  displayName: string;
  platform: "meta_glasses";
  capabilities: WearablePermission[];
  isMock?: boolean;
};

export type WearableStatus = {
  supported: boolean;
  connectionState: WearableConnectionState;
  pairedDevice: WearableDevice | null;
  grantedPermissions: WearablePermission[];
  lastError: string | null;
  integrationMode: WearableIntegrationMode;
  platformLabel: string;
  statusMessage?: string | null;
};

type NativeWearableStatus = {
  supported: boolean;
  connectionState: WearableConnectionState;
  pairedDevice: WearableDevice | null;
  grantedPermissions: WearablePermission[];
  lastError: string | null;
  integrationMode?: WearableIntegrationMode;
  platformLabel?: string;
  statusMessage?: string | null;
};

type NativeWearablesModule = {
  getStatus(): Promise<NativeWearableStatus>;
  pairWearable(): Promise<NativeWearableStatus>;
  pairMockWearable?(): Promise<NativeWearableStatus>;
  disconnectWearable(): Promise<NativeWearableStatus>;
};

const nativeWearablesModule: NativeWearablesModule | null =
  (Platform.OS === "ios" || Platform.OS === "android") && "PhillyNativeWearables" in NativeModules
    ? (NativeModules.PhillyNativeWearables as NativeWearablesModule)
    : null;
const WEARABLE_STATUS_KEY = "philly_tours_wearable_status_v1";
const supportsManualCompanionMode = Platform.OS === "android";

type WearableStatusListener = (status: WearableStatus) => void;

const listeners = new Set<WearableStatusListener>();

let currentStatus: WearableStatus = {
  supported: nativeWearablesModule != null || supportsManualCompanionMode,
  connectionState: nativeWearablesModule != null ? "idle" : supportsManualCompanionMode ? "idle" : "unsupported",
  pairedDevice: null,
  grantedPermissions: [],
  lastError: nativeWearablesModule != null || supportsManualCompanionMode ? null : "Meta wearables toolkit is not integrated yet.",
  integrationMode: nativeWearablesModule != null ? "native" : supportsManualCompanionMode ? "manual" : "none",
  platformLabel: Platform.OS === "ios" ? "iOS" : Platform.OS === "android" ? "Android" : "Web",
  statusMessage:
    nativeWearablesModule != null
      ? "Meta wearables native toolkit is ready."
      : supportsManualCompanionMode
        ? "Android can use Meta glasses in manual Bluetooth-audio mode. Pair the glasses in system Bluetooth settings, then connect here."
        : "This build does not expose Meta glasses integration on this platform."
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
    integrationMode: status.integrationMode ?? (status.supported ? "native" : "none"),
    platformLabel: status.platformLabel ?? (Platform.OS === "ios" ? "iOS" : Platform.OS === "android" ? "Android" : "Web"),
    statusMessage: status.statusMessage ?? null
  };
}

function getManualAndroidStatus(connectionState: WearableConnectionState = "connected"): WearableStatus {
  const connected = connectionState === "connected";
  const rememberedDevice =
    currentStatus.pairedDevice && currentStatus.integrationMode === "manual"
      ? currentStatus.pairedDevice
      : {
          id: "meta-glasses-manual-android",
          model: "Meta AI Glasses",
          displayName: "Meta Glasses (Bluetooth audio)",
          platform: "meta_glasses" as const,
          capabilities: []
        };
  return {
    supported: true,
    connectionState,
    pairedDevice: connected || connectionState === "disconnected" ? rememberedDevice : null,
    grantedPermissions: [],
    lastError: null,
    integrationMode: "manual",
    platformLabel: "Android",
    statusMessage: connected
      ? "Manual Meta glasses mode is active. Narration will follow Android audio routing to the paired glasses."
      : "Manual Meta glasses mode is available. Pair the glasses in Bluetooth settings, then connect here to route narration through them."
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
      integrationMode:
        parsed.integrationMode === "native" || parsed.integrationMode === "manual" || parsed.integrationMode === "none"
          ? parsed.integrationMode
          : currentStatus.integrationMode,
      platformLabel: typeof parsed.platformLabel === "string" ? parsed.platformLabel : currentStatus.platformLabel,
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

  if (supportsManualCompanionMode) {
    emit(getManualAndroidStatus("connected"));
    return currentStatus;
  }

  emit({
    connectionState: "error",
    lastError: "Meta Wearables Device Access Toolkit integration is not wired in this build yet."
  });
  throw new Error("Meta Wearables Device Access Toolkit integration is not wired in this build yet.");
}

export async function pairMockWearable() {
  if (nativeWearablesModule?.pairMockWearable) {
    emit(normalizeStatus(await nativeWearablesModule.pairMockWearable()));
    return currentStatus;
  }

  throw new Error("Mock Meta glasses pairing is not available in this build.");
}

export async function disconnectWearable() {
  if (nativeWearablesModule) {
    emit(normalizeStatus(await nativeWearablesModule.disconnectWearable()));
    return;
  }

  if (supportsManualCompanionMode) {
    emit(getManualAndroidStatus("disconnected"));
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
  } else if (supportsManualCompanionMode) {
    const nextState =
      currentStatus.connectionState === "connected"
        ? "connected"
        : currentStatus.pairedDevice
          ? "disconnected"
          : "idle";
    emit(getManualAndroidStatus(nextState));
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
