import { getCityAr } from "../city-runtime/getCityAr";
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
  estimatedEffort: string;
  anchorStyle: string;
  fallbackType: string;
  coordQuality: string;
  triggerRadiusM: number;
  assetNeeded: string;
  negativePrompt: string;
  briefPath: string;
  manifestPath: string;
  runtimeAssets: ARSceneManifest["runtimeAssets"];
  contentLayers: string[];
  productionChecklist: string[];
};

const cityAr = getCityAr();

export function toARProductionBrief(stop: Stop, tourTitle: string): ARProductionBrief {
  const manifest = toARSceneManifest(stop);
  const catalogEntry = arAssetCatalogByStopId.get(stop.id);
  const runtimeEntry = cityAr[stop.id];

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
    estimatedEffort: runtimeEntry?.estimatedEffort || catalogEntry?.estimatedEffort || stop.estimatedEffort || "n/a",
    anchorStyle: catalogEntry?.anchorStyle || "front_of_user",
    fallbackType: catalogEntry?.fallbackType || "card",
    coordQuality: catalogEntry?.coordQuality || stop.coordQuality || "approximate",
    triggerRadiusM: catalogEntry?.triggerRadiusM || stop.triggerRadiusM,
    assetNeeded: runtimeEntry?.assetNeeded || catalogEntry?.assetNeeded || stop.assetNeeded || "No asset brief entered yet.",
    negativePrompt: manifest.negativePrompt,
    briefPath: `docs/ar-briefs/${stop.id}.md`,
    manifestPath: `docs/ar-scene-manifests/${stop.id}.json`,
    runtimeAssets: manifest.runtimeAssets,
    contentLayers: manifest.contentLayers,
    productionChecklist: manifest.productionChecklist
  };
}
