export type NativeARProvider = "arkit" | "arcore" | "unsupported";

export type NativeARStatus = {
  provider: NativeARProvider;
  available: boolean;
  reason?: string;
};

export type ARModelPlacement = {
  id: string;
  modelUrl: string;
  scale: number;
  rotationYDeg: number;
};

export interface NativeARAdapter {
  getStatus(): Promise<NativeARStatus>;
  startSession(): Promise<void>;
  placeModel(placement: ARModelPlacement): Promise<void>;
  stopSession(): Promise<void>;
}
