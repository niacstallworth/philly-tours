export type NativeARProvider = "arkit" | "arcore" | "unsupported";

export type NativeARStatus = {
  provider: NativeARProvider;
  available: boolean;
  reason?: string;
  sessionRunning?: boolean;
  placedModelCount?: number;
};

export type ARModelPlacement = {
  id: string;
  modelUrl: string;
  scale: number;
  rotationYDeg: number;
  fallbackType?: "box" | "card" | "none";
  title?: string;
  subtitle?: string;
  headline?: string;
  summary?: string;
  placementNote?: string;
  conceptImagePath?: string;
  plannedProvider?: string;
  generatedProvider?: string;
  contentLayers?: string[];
  productionChecklist?: string[];
};

export interface NativeARAdapter {
  getStatus(): Promise<NativeARStatus>;
  startSession(): Promise<void>;
  placeModel(placement: ARModelPlacement): Promise<void>;
  stopSession(): Promise<void>;
}
