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
};

type WearableStatusListener = (status: WearableStatus) => void;

const listeners = new Set<WearableStatusListener>();

let currentStatus: WearableStatus = {
  supported: false,
  connectionState: "unsupported",
  pairedDevice: null,
  grantedPermissions: [],
  lastError: "Meta wearables toolkit is not integrated yet."
};

function emit(next: Partial<WearableStatus>) {
  currentStatus = { ...currentStatus, ...next };
  listeners.forEach((listener) => listener(currentStatus));
}

export function getWearableStatus() {
  return currentStatus;
}

export function subscribeToWearableStatus(listener: WearableStatusListener) {
  listeners.add(listener);
  listener(currentStatus);
  return () => {
    listeners.delete(listener);
  };
}

export async function pairWearable() {
  emit({
    connectionState: "error",
    lastError: "Meta Wearables Device Access Toolkit integration is not wired in this build yet."
  });
  throw new Error("Meta Wearables Device Access Toolkit integration is not wired in this build yet.");
}

export async function disconnectWearable() {
  emit({
    connectionState: currentStatus.supported ? "disconnected" : "unsupported",
    pairedDevice: null
  });
}

export async function refreshWearableStatus() {
  return currentStatus;
}
