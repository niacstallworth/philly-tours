import { ARModelPlacement, NativeARAdapter, NativeARStatus } from "./types";

export class UnsupportedARAdapter implements NativeARAdapter {
  async getStatus(): Promise<NativeARStatus> {
    return {
      provider: "unsupported",
      available: false,
      reason: "AR provider unsupported on this platform."
    };
  }

  async startSession(): Promise<void> {
    return;
  }

  async placeModel(_placement: ARModelPlacement): Promise<void> {
    return;
  }

  async stopSession(): Promise<void> {
    return;
  }
}
