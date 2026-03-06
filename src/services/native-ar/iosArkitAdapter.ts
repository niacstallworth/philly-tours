import {
  hasNativeARBridge,
  nativeGetStatus,
  nativePlaceModel,
  nativeStartSession,
  nativeStopSession
} from "./nativeBridge";
import { ARModelPlacement, NativeARAdapter, NativeARStatus } from "./types";

export class IOSARKitAdapter implements NativeARAdapter {
  async getStatus(): Promise<NativeARStatus> {
    const status = await nativeGetStatus();

    return {
      provider: "arkit",
      available: status.available,
      reason: status.reason || (hasNativeARBridge() ? "ARKit bridge ready." : "ARKit bridge missing.")
    };
  }

  async startSession(): Promise<void> {
    await nativeStartSession();
  }

  async placeModel(placement: ARModelPlacement): Promise<void> {
    await nativePlaceModel(placement);
  }

  async stopSession(): Promise<void> {
    await nativeStopSession();
  }
}
