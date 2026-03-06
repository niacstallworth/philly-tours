import { Stop } from "../types";

export type ARScenePayload = {
  stopId: string;
  modelUrl: string;
  scale: number;
  rotationYDeg: number;
};

export function toARScenePayload(stop: Stop): ARScenePayload {
  return {
    stopId: stop.id,
    modelUrl: stop.modelUrl,
    scale: 1,
    rotationYDeg: 180
  };
}
