import { NativeModules, Platform } from "react-native";
import { getVuzixStatus, isVuzixBridgeAvailable, requestVuzixControl, sendVuzixNotification } from "./vuzix";

export type CompassOverlayPayload = {
  headingDeg: number | null;
  targetBearingDeg: number | null;
  targetDeltaDeg: number | null;
  nextStopTitle: string | null;
  instruction: string;
  companionConnected: boolean;
};

export type GlassesDisplayStatus = {
  supported: boolean;
  mode: "native_overlay" | "notification_only" | "phone_only";
  provider: "native" | "vuzix" | "none";
  message: string;
};

type NativeGlassesDisplayModule = {
  getStatus?(): Promise<GlassesDisplayStatus>;
  showCompassOverlay(payload: CompassOverlayPayload): Promise<GlassesDisplayStatus>;
  updateCompassOverlay(payload: CompassOverlayPayload): Promise<GlassesDisplayStatus>;
  hideCompassOverlay(): Promise<GlassesDisplayStatus>;
};

const nativeGlassesDisplayModule: NativeGlassesDisplayModule | null =
  (Platform.OS === "ios" || Platform.OS === "android") && "PhillyGlassesDisplay" in NativeModules
    ? (NativeModules.PhillyGlassesDisplay as NativeGlassesDisplayModule)
    : null;

let lastNotificationKey: string | null = null;

function phoneOnlyStatus(message = "Phone compass is active. No glasses display overlay bridge is available in this build."): GlassesDisplayStatus {
  return {
    supported: false,
    mode: "phone_only",
    provider: "none",
    message
  };
}

function payloadNotificationKey(payload: CompassOverlayPayload) {
  return [payload.nextStopTitle || "none", Math.round(payload.targetBearingDeg || 0), payload.instruction].join(":");
}

async function getFallbackStatus(): Promise<GlassesDisplayStatus> {
  if (isVuzixBridgeAvailable()) {
    const status = await getVuzixStatus();
    if (status.connected || status.controlledByMe || status.available) {
      return {
        supported: true,
        mode: "notification_only",
        provider: "vuzix",
        message: status.statusMessage || "Vuzix bridge is available for notifications. Live compass overlay drawing still needs a native renderer."
      };
    }
  }

  return phoneOnlyStatus();
}

export async function getGlassesDisplayStatus(): Promise<GlassesDisplayStatus> {
  if (nativeGlassesDisplayModule?.getStatus) {
    return nativeGlassesDisplayModule.getStatus();
  }

  return getFallbackStatus();
}

export async function showCompassOverlay(payload: CompassOverlayPayload): Promise<GlassesDisplayStatus> {
  if (nativeGlassesDisplayModule) {
    return nativeGlassesDisplayModule.showCompassOverlay(payload);
  }

  if (isVuzixBridgeAvailable()) {
    const status = await getVuzixStatus();
    if (status.connected || status.available) {
      try {
        await requestVuzixControl();
        const key = payloadNotificationKey(payload);
        if (key !== lastNotificationKey) {
          lastNotificationKey = key;
          await sendVuzixNotification("Founders Compass", payload.instruction);
        }
      } catch {
        // Keep the phone compass active even if notification/display control fails.
      }
      return {
        supported: true,
        mode: "notification_only",
        provider: "vuzix",
        message: "Vuzix notification sent. Live overlay drawing requires the next native renderer layer."
      };
    }
  }

  return phoneOnlyStatus();
}

export async function updateCompassOverlay(payload: CompassOverlayPayload): Promise<GlassesDisplayStatus> {
  if (nativeGlassesDisplayModule) {
    return nativeGlassesDisplayModule.updateCompassOverlay(payload);
  }

  return getFallbackStatus();
}

export async function hideCompassOverlay(): Promise<GlassesDisplayStatus> {
  lastNotificationKey = null;

  if (nativeGlassesDisplayModule) {
    return nativeGlassesDisplayModule.hideCompassOverlay();
  }

  return getFallbackStatus();
}
