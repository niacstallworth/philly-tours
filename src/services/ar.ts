import { Image, Platform } from "react-native";
import { arAssetCatalogByStopId } from "../data/arAssetCatalog";
import { arGeneratedImageMap } from "../data/arGeneratedImageMap";
import { toARSceneManifest } from "./arManifest";
import { Stop } from "../types";

export type ARScenePayload = {
  stopId: string;
  modelUrl: string;
  scale: number;
  rotationYDeg: number;
  fallbackType: "box" | "card" | "none";
  title: string;
  subtitle: string;
  headline: string;
  summary: string;
  placementNote: string;
  conceptImagePath: string;
  conceptImageUri: string;
  plannedProvider: string;
  generatedProvider: string;
  contentLayers: string[];
  productionChecklist: string[];
};

const modelBaseUrl =
  ((globalThis as any)?.process?.env?.EXPO_PUBLIC_AR_MODEL_BASE_URL as string | undefined)?.trim() || "";

function absolutizeModelUrl(pathOrUrl: string): string {
  if (!pathOrUrl) {
    return pathOrUrl;
  }
  if (/^https?:\/\//i.test(pathOrUrl) || /^file:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }
  if (!modelBaseUrl) {
    return pathOrUrl;
  }
  const base = modelBaseUrl.replace(/\/+$/, "");
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${base}${path}`;
}

function withPlatformModelFormat(pathOrUrl: string): string {
  const lower = pathOrUrl.toLowerCase();
  if (Platform.OS === "ios" && lower.endsWith(".glb")) {
    return pathOrUrl.slice(0, -4) + ".usdz";
  }
  if (Platform.OS === "android" && lower.endsWith(".usdz")) {
    return pathOrUrl.slice(0, -5) + ".glb";
  }
  return pathOrUrl;
}

function resolveConceptImageUri(stopId: string): string {
  const source = arGeneratedImageMap[stopId];
  if (!source) {
    return "";
  }

  const resolved = Image.resolveAssetSource(source);
  return resolved?.uri || "";
}

export function toARScenePayload(stop: Stop): ARScenePayload {
  const catalogEntry = arAssetCatalogByStopId.get(stop.id);
  const manifest = toARSceneManifest(stop);
  const rawModelUrl =
    Platform.OS === "ios"
      ? catalogEntry?.iosAsset || stop.modelUrl
      : Platform.OS === "android"
        ? catalogEntry?.androidAsset || stop.modelUrl
        : catalogEntry?.webAsset || stop.modelUrl;
  const platformUrl = withPlatformModelFormat(rawModelUrl);
  const modelUrl = absolutizeModelUrl(platformUrl);
  const subtitle = stop.description.split("|")[0]?.trim() || "Historic AR stop";
  return {
    stopId: stop.id,
    modelUrl,
    scale: catalogEntry?.scale ?? 1,
    rotationYDeg: catalogEntry?.rotationYDeg ?? 180,
    fallbackType: catalogEntry?.fallbackType ?? "box",
    title: stop.title,
    subtitle,
    headline: manifest.headline,
    summary: manifest.summary,
    placementNote: manifest.placementNote,
    conceptImagePath: manifest.conceptImagePath,
    conceptImageUri: resolveConceptImageUri(stop.id),
    plannedProvider: manifest.plannedProvider,
    generatedProvider: manifest.generatedProvider,
    contentLayers: manifest.contentLayers,
    productionChecklist: manifest.productionChecklist
  };
}
