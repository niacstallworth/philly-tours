import { arAssetCatalogByStopId } from "../data/arAssetCatalog";
import { Stop } from "../types";
import { ARSceneManifest, toARSceneManifest } from "./arManifest";

export type ARProductionBrief = {
  stopId: string;
  stopTitle: string;
  tourTitle: string;
  arPriority: number | null;
  arType: string;
  headline: string;
  summary: string;
  historicalEra: string;
  stylePreset: string;
  visualPriority: string;
  plannedProvider: string;
  fallbackProvider: string;
  generatedProvider: string;
  estimatedEffort: string;
  anchorStyle: string;
  fallbackType: string;
  coordQuality: string;
  triggerRadiusM: number;
  assetNeeded: string;
  negativePrompt: string;
  briefPath: string;
  manifestPath: string;
  conceptImagePath: string;
  runtimeAssets: ARSceneManifest["runtimeAssets"];
  contentLayers: string[];
  productionChecklist: string[];
};

export function toARProductionBrief(stop: Stop, tourTitle: string): ARProductionBrief {
  const manifest = toARSceneManifest(stop);
  const catalogEntry = arAssetCatalogByStopId.get(stop.id);

  return {
    stopId: stop.id,
    stopTitle: stop.title,
    tourTitle,
    arPriority: stop.arPriority ?? null,
    arType: manifest.arType,
    headline: manifest.headline,
    summary: manifest.summary,
    historicalEra: manifest.historicalEra,
    stylePreset: manifest.stylePreset,
    visualPriority: manifest.visualPriority,
    plannedProvider: manifest.plannedProvider,
    fallbackProvider: manifest.fallbackProvider,
    generatedProvider: manifest.generatedProvider,
    estimatedEffort: catalogEntry?.estimatedEffort || stop.estimatedEffort || "n/a",
    anchorStyle: catalogEntry?.anchorStyle || "front_of_user",
    fallbackType: catalogEntry?.fallbackType || "card",
    coordQuality: catalogEntry?.coordQuality || stop.coordQuality || "approximate",
    triggerRadiusM: catalogEntry?.triggerRadiusM || stop.triggerRadiusM,
    assetNeeded: catalogEntry?.assetNeeded || stop.assetNeeded || "No asset brief entered yet.",
    negativePrompt: manifest.negativePrompt,
    briefPath: `docs/ar-briefs/${stop.id}.md`,
    manifestPath: `docs/ar-scene-manifests/${stop.id}.json`,
    conceptImagePath: manifest.conceptImagePath,
    runtimeAssets: manifest.runtimeAssets,
    contentLayers: manifest.contentLayers,
    productionChecklist: manifest.productionChecklist
  };
}
