import { arAssetCatalogByStopId } from "../data/arAssetCatalog";
import type { Stop, Tour } from "../types";
import { type ARSceneManifest, toARSceneManifest } from "./arManifest";
import { placeNativeArModel, startNativeArSession } from "./nativeAr";

type AnchorStyle = "front_of_user" | "ground" | "image_target" | "location_marker";
type FallbackType = "box" | "card" | "none";

export type ARStopExperience = {
  stop: Stop;
  manifest: ARSceneManifest;
  modelUrl: string;
  scale: number;
  rotationYDeg: number;
  verticalOffsetM: number;
  anchorStyle: AnchorStyle;
  fallbackType: FallbackType;
  sitePlacementMode: string;
  preferredViewingDistanceM?: number;
  siteOffsetXM: number;
  siteOffsetZM: number;
  usesStoryCard: boolean;
  usesModelAsset: boolean;
};

function defaultScaleForType(arType: string) {
  switch (arType) {
    case "portal_reconstruction":
    case "before_after_overlay":
      return 0.48;
    case "object_on_plinth":
      return 0.78;
    case "animated_diagram":
      return 0.86;
    case "floating_story_card":
      return 0.92;
    default:
      return 0.82;
  }
}

function defaultAnchorForType(arType: string): AnchorStyle {
  switch (arType) {
    case "portal_reconstruction":
    case "before_after_overlay":
      return "ground";
    default:
      return "front_of_user";
  }
}

function defaultFallbackForType(arType: string): FallbackType {
  return arType === "floating_story_card" ? "card" : "card";
}

function defaultSitePlacementMode(arType: string) {
  switch (arType) {
    case "portal_reconstruction":
    case "before_after_overlay":
      return "outdoor_building";
    case "object_on_plinth":
    case "animated_diagram":
      return "miniature_reconstruction";
    default:
      return "default";
  }
}

function defaultPreferredDistance(arType: string) {
  switch (arType) {
    case "portal_reconstruction":
    case "before_after_overlay":
      return 4.8;
    case "object_on_plinth":
    case "animated_diagram":
      return 1.4;
    case "floating_story_card":
      return 1.15;
    default:
      return undefined;
  }
}

export function isArCapableStop(stop: Stop) {
  return arAssetCatalogByStopId.has(stop.id) || Boolean(stop.arType && stop.arType !== "none");
}

export function getArStopsForTour(tour: Tour) {
  return tour.stops
    .filter(isArCapableStop)
    .sort((left, right) => {
      const leftPriority = arAssetCatalogByStopId.get(left.id)?.arPriority ?? left.arPriority ?? Number.MAX_SAFE_INTEGER;
      const rightPriority = arAssetCatalogByStopId.get(right.id)?.arPriority ?? right.arPriority ?? Number.MAX_SAFE_INTEGER;
      return leftPriority - rightPriority;
    });
}

export function getArExperienceForStop(stop: Stop): ARStopExperience | null {
  if (!isArCapableStop(stop)) {
    return null;
  }

  const manifest = toARSceneManifest(stop);
  const catalogEntry = arAssetCatalogByStopId.get(stop.id);
  const modelUrl = manifest.runtimeAssets.ios || stop.modelUrl;
  const usesStoryCard = manifest.arType === "floating_story_card" || modelUrl.endsWith(".storycard");

  return {
    stop,
    manifest,
    modelUrl,
    scale: catalogEntry?.scale ?? defaultScaleForType(manifest.arType),
    rotationYDeg: catalogEntry?.rotationYDeg ?? 180,
    verticalOffsetM: catalogEntry?.verticalOffsetM ?? stop.verticalOffsetM ?? 0,
    anchorStyle: catalogEntry?.anchorStyle ?? defaultAnchorForType(manifest.arType),
    fallbackType: catalogEntry?.fallbackType ?? defaultFallbackForType(manifest.arType),
    sitePlacementMode: catalogEntry?.sitePlacementMode ?? defaultSitePlacementMode(manifest.arType),
    preferredViewingDistanceM: catalogEntry?.preferredViewingDistanceM ?? defaultPreferredDistance(manifest.arType),
    siteOffsetXM: catalogEntry?.siteOffsetXM ?? 0,
    siteOffsetZM: catalogEntry?.siteOffsetZM ?? 0,
    usesStoryCard,
    usesModelAsset: !usesStoryCard
  };
}

export async function launchNativeArForStop(stop: Stop) {
  const experience = getArExperienceForStop(stop);
  if (!experience) {
    throw new Error("This stop is not configured for AR in the current build.");
  }

  await startNativeArSession();
  await placeNativeArModel({
    id: experience.stop.id,
    modelUrl: experience.modelUrl,
    scale: experience.scale,
    rotationYDeg: experience.rotationYDeg,
    verticalOffsetM: experience.verticalOffsetM,
    anchorStyle: experience.anchorStyle,
    fallbackType: experience.fallbackType,
    sitePlacementMode: experience.sitePlacementMode,
    preferredViewingDistanceM: experience.preferredViewingDistanceM,
    siteOffsetXM: experience.siteOffsetXM,
    siteOffsetZM: experience.siteOffsetZM,
    title: experience.stop.title,
    subtitle: experience.manifest.historicalEra,
    headline: experience.manifest.headline,
    summary: experience.manifest.summary,
    placementNote: experience.manifest.placementNote,
    contentLayers: experience.manifest.contentLayers,
    productionChecklist: experience.manifest.productionChecklist
  });

  return experience;
}
