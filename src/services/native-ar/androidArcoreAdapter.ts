import {
  hasNativeARBridge,
  nativeGetStatus,
  nativePlaceModel,
  nativeStartSession,
  nativeStopSession
} from "./nativeBridge";
import { ARModelPlacement, NativeARAdapter, NativeARStatus } from "./types";

export class AndroidARCoreAdapter implements NativeARAdapter {
  async getStatus(): Promise<NativeARStatus> {
    const status = await nativeGetStatus();

    return {
      provider: "arcore",
      available: status.available,
      reason: status.reason || (hasNativeARBridge() ? "ARCore bridge ready." : "ARCore bridge missing."),
      sessionRunning: status.sessionRunning,
      placedModelCount: status.placedModelCount
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
