import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking, NativeModules, Platform } from "react-native";

export type WearablePermission = "camera" | "device_state";
export type WearableConnectionState = "unsupported" | "idle" | "pairing" | "connected" | "disconnected" | "error";
export type WearableIntegrationMode = "native" | "manual" | "none";
export type AudioRouteKind = "bluetooth" | "wired" | "speaker" | "airplay" | "unknown";

export type WearableDevice = {
  id: string;
  model: string;
  displayName: string;
  platform: "meta_glasses";
  capabilities: WearablePermission[];
  isMock?: boolean;
};

export type WearableAudioRoute = {
  available: boolean;
  connected: boolean;
  isBluetooth: boolean;
  kind: AudioRouteKind;
  displayName: string | null;
  statusMessage: string;
};

export type WearableStatus = {
  supported: boolean;
  connectionState: WearableConnectionState;
  pairedDevice: WearableDevice | null;
  audioRoute: WearableAudioRoute;
  grantedPermissions: WearablePermission[];
  lastError: string | null;
  integrationMode: WearableIntegrationMode;
  nativeCompanionAvailable: boolean;
  platformLabel: string;
  statusMessage?: string | null;
};

type NativeWearableStatus = {
  supported: boolean;
  connectionState: WearableConnectionState;
  pairedDevice: WearableDevice | null;
  audioRoute?: WearableAudioRoute;
  grantedPermissions: WearablePermission[];
  lastError: string | null;
  integrationMode?: WearableIntegrationMode;
  nativeCompanionAvailable?: boolean;
  platformLabel?: string;
  statusMessage?: string | null;
};

type NativeWearablesModule = {
  getStatus(): Promise<NativeWearableStatus>;
  pairWearable(): Promise<NativeWearableStatus>;
  disconnectWearable(): Promise<NativeWearableStatus>;
};

const nativeWearablesModule: NativeWearablesModule | null =
  (Platform.OS === "ios" || Platform.OS === "android") && "PhillyNativeWearables" in NativeModules
    ? (NativeModules.PhillyNativeWearables as NativeWearablesModule)
    : null;
const WEARABLE_STATUS_KEY = "philly_tours_wearable_status_v1";
const supportsManualCompanionMode = Platform.OS === "android";

const DEFAULT_AUDIO_ROUTE: WearableAudioRoute = {
  available: Platform.OS === "ios" || Platform.OS === "android",
  connected: false,
  isBluetooth: false,
  kind: "unknown",
  displayName: null,
  statusMessage:
    Platform.OS === "ios" || Platform.OS === "android"
      ? "No Bluetooth audio route is active yet."
      : "Bluetooth audio routing is only available in the mobile app build."
};

type WearableStatusListener = (status: WearableStatus) => void;

const listeners = new Set<WearableStatusListener>();

let currentStatus: WearableStatus = {
  supported: nativeWearablesModule != null || supportsManualCompanionMode,
  connectionState: nativeWearablesModule != null ? "idle" : supportsManualCompanionMode ? "idle" : "unsupported",
  pairedDevice: null,
  audioRoute: DEFAULT_AUDIO_ROUTE,
  grantedPermissions: [],
  lastError: nativeWearablesModule != null || supportsManualCompanionMode ? null : "Meta wearables toolkit is not integrated yet.",
  integrationMode: nativeWearablesModule != null ? "native" : supportsManualCompanionMode ? "manual" : "none",
  nativeCompanionAvailable: nativeWearablesModule != null,
  platformLabel: Platform.OS === "ios" ? "iOS" : Platform.OS === "android" ? "Android" : "Web",
  statusMessage:
    nativeWearablesModule != null
      ? "Meta wearables native toolkit is ready."
      : supportsManualCompanionMode
        ? "Universal audio mode is available on Android. Pair any Bluetooth glasses, headset, or speaker in system settings, then connect here to keep narration on that output."
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
    audioRoute: status.audioRoute ?? DEFAULT_AUDIO_ROUTE,
    grantedPermissions: status.grantedPermissions,
    lastError: status.lastError,
    integrationMode: status.integrationMode ?? (status.supported ? "native" : "none"),
    nativeCompanionAvailable: status.nativeCompanionAvailable ?? status.supported,
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
          id: "bluetooth-audio-manual-android",
          model: "Bluetooth Audio Device",
          displayName: "Bluetooth audio device",
          platform: "meta_glasses" as const,
          capabilities: []
        };
  return {
    supported: true,
    connectionState,
    pairedDevice: connected || connectionState === "disconnected" ? rememberedDevice : null,
    audioRoute: {
      available: true,
      connected,
      isBluetooth: connected,
      kind: connected ? "bluetooth" : "unknown",
      displayName: connected ? rememberedDevice.displayName : null,
      statusMessage: connected
        ? "Bluetooth audio is active on Android."
        : "Pair Bluetooth glasses, headphones, or a speaker in Android settings to use universal audio mode."
    },
    grantedPermissions: [],
    lastError: null,
    integrationMode: "manual",
    nativeCompanionAvailable: false,
    platformLabel: "Android",
    statusMessage: connected
      ? "Universal audio mode is active. Narration will follow Android audio routing to the connected Bluetooth audio device."
      : "Universal audio mode is available. Pair any Bluetooth glasses, headset, or speaker in Android settings, then connect here to keep narration on that audio output."
  };
}

function audioRouteToWearableDevice(route: WearableAudioRoute): WearableDevice | null {
  if (!route.connected || !route.displayName) {
    return null;
  }

  return {
    id: `audio-route-${route.displayName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    model: route.isBluetooth ? "Bluetooth Audio Device" : "External Audio Device",
    displayName: route.displayName,
    platform: "meta_glasses",
    capabilities: []
  };
}

function applyManualAudioRoute(status: WearableStatus): WearableStatus {
  const manualDevice = audioRouteToWearableDevice(status.audioRoute);
  const connected = Boolean(status.audioRoute.connected && status.audioRoute.isBluetooth && manualDevice);

  return {
    ...status,
    connectionState: connected ? "connected" : status.nativeCompanionAvailable ? "idle" : "disconnected",
    pairedDevice: connected ? manualDevice : null,
    integrationMode: connected ? "manual" : status.nativeCompanionAvailable ? "native" : "manual",
    statusMessage: connected
      ? `Universal audio mode is active on ${status.audioRoute.displayName}. Narration will follow the current Bluetooth audio route.`
      : "No Bluetooth glasses or headset are currently active. Pair them in system settings, then return here to enable universal audio mode."
  };
}

async function openBluetoothAccessorySettings() {
  if (Platform.OS === "android" && "sendIntent" in Linking) {
    await Linking.sendIntent("android.settings.BLUETOOTH_SETTINGS");
    return;
  }

  await Linking.openSettings();
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
      audioRoute: parsed.audioRoute && typeof parsed.audioRoute === "object" ? { ...DEFAULT_AUDIO_ROUTE, ...parsed.audioRoute } : currentStatus.audioRoute,
      grantedPermissions: Array.isArray(parsed.grantedPermissions) ? parsed.grantedPermissions : [],
      lastError: typeof parsed.lastError === "string" ? parsed.lastError : null,
      integrationMode:
        parsed.integrationMode === "native" || parsed.integrationMode === "manual" || parsed.integrationMode === "none"
          ? parsed.integrationMode
          : currentStatus.integrationMode,
      nativeCompanionAvailable: typeof parsed.nativeCompanionAvailable === "boolean" ? parsed.nativeCompanionAvailable : currentStatus.nativeCompanionAvailable,
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

export async function pairBluetoothAudioWearable() {
  if (nativeWearablesModule) {
    const nextStatus = normalizeStatus(await nativeWearablesModule.getStatus());
    emit(nextStatus);

    if (nextStatus.audioRoute.connected && nextStatus.audioRoute.isBluetooth) {
      emit(applyManualAudioRoute(nextStatus));
      return currentStatus;
    }

    await openBluetoothAccessorySettings();
    emit({
      ...nextStatus,
      lastError: null,
      statusMessage: "Pair Bluetooth glasses or headphones in iPhone settings or Control Center, then return here and tap Refresh status."
    });
    throw new Error("No Bluetooth glasses or headphones are currently active. Pair them in iPhone settings or Control Center, then try again.");
  }

  if (supportsManualCompanionMode) {
    emit(getManualAndroidStatus("connected"));
    return currentStatus;
  }

  throw new Error("Universal Bluetooth audio mode is not available in this build.");
}

export async function disconnectWearable() {
  if (currentStatus.integrationMode === "manual") {
    if (nativeWearablesModule) {
      const nextStatus = normalizeStatus(await nativeWearablesModule.getStatus());
      emit({
        ...nextStatus,
        pairedDevice: null,
        connectionState: nextStatus.nativeCompanionAvailable ? nextStatus.connectionState : "disconnected",
        integrationMode: nextStatus.nativeCompanionAvailable ? "native" : "manual",
        statusMessage: "Universal audio mode is off. Narration will follow the phone's current audio output."
      });
      return;
    }

    if (supportsManualCompanionMode) {
      emit(getManualAndroidStatus("disconnected"));
      return;
    }
  }

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
    const nextStatus = normalizeStatus(await nativeWearablesModule.getStatus());
    if (currentStatus.integrationMode === "manual" && nextStatus.connectionState !== "connected") {
      emit(applyManualAudioRoute(nextStatus));
    } else {
      emit(nextStatus);
    }
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
