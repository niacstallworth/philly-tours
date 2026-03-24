import { arAssetCatalogByStopId } from "../data/arAssetCatalog";
import { Stop } from "../types";

export type ARSceneManifest = {
  stopId: string;
  stopTitle: string;
  arType: string;
  headline: string;
  summary: string;
  historicalEra: string;
  stylePreset: string;
  visualPriority: string;
  placementNote: string;
  runtimeAssets: {
    ios: string;
    android: string;
    web: string;
  };
  contentLayers: string[];
  productionChecklist: string[];
  negativePrompt: string;
};

function headlineForType(arType: string) {
  switch (arType) {
    case "portal_reconstruction":
      return "Hero portal reconstruction";
    case "historical_figure_presence":
      return "Figure-led historic scene";
    case "before_after_overlay":
      return "Facade-accurate overlay";
    case "object_on_plinth":
      return "Museum-style object scene";
    case "animated_diagram":
      return "Animated explainer scene";
    case "floating_story_card":
      return "Editorial AR story card";
    case "route_ghost":
      return "Wayfinding ghost route";
    default:
      return "Historic AR scene";
  }
}

function placementNoteForAnchor(anchorStyle: string, stop: Stop) {
  switch (anchorStyle) {
    case "front_of_user":
      return `Place the scene directly in front of the visitor at a safe standing distance within the ${stop.triggerRadiusM}m trigger zone.`;
    case "ground":
      return "Anchor the scene to ground level near the stop footprint and preserve walkable clearance around the user.";
    case "image_target":
      return "Anchor this scene to a recognized visual target and preserve orientation fidelity against the source image.";
    case "location_marker":
      return "Anchor this scene to the verified location marker and bias for outdoor GPS drift tolerance.";
    default:
      return "Use a front-facing mobile AR placement that preserves readability and safe standing room.";
  }
}

function contentLayersForType(arType: string, assetNeeded: string) {
  const base = assetNeeded
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);

  switch (arType) {
    case "portal_reconstruction":
      return [...base, "portal frame", "foreground occlusion pass", "historic depth backdrop"];
    case "historical_figure_presence":
      return [...base, "hero figure silhouette", "staging marker", "supporting context card"];
    case "before_after_overlay":
      return [...base, "facade alignment overlay", "material correction pass", "street-edge guide"];
    case "object_on_plinth":
      return [...base, "hero object", "plinth/base", "annotation card"];
    case "animated_diagram":
      return [...base, "primary mechanism", "step labels", "motion sequence overlays"];
    case "floating_story_card":
      return [...base, "story card stack", "headline frame", "lightweight foreground treatment"];
    case "route_ghost":
      return [...base, "direction arrows", "milestone labels", "route breadcrumbs"];
    default:
      return base;
  }
}

function checklistForType(arType: string) {
  switch (arType) {
    case "portal_reconstruction":
      return ["Confirm portal framing", "Define foreground props", "Validate scene depth", "Check occlusion and sightlines"];
    case "historical_figure_presence":
      return ["Confirm respectful figure staging", "Lock silhouette readability", "Check period wardrobe cues", "Validate context card copy"];
    case "before_after_overlay":
      return ["Match facade proportions", "Check street alignment", "Verify material palette", "Confirm compare mode readability"];
    case "object_on_plinth":
      return ["Approve hero object shape", "Approve plinth scale", "Check annotation clarity"];
    case "animated_diagram":
      return ["Approve mechanism breakdown", "Check animation step order", "Verify label legibility"];
    case "floating_story_card":
      return ["Check card readability", "Trim background clutter", "Validate mobile-safe margins"];
    case "route_ghost":
      return ["Check directional clarity", "Reduce clutter", "Validate path sequence"];
    default:
      return ["Define asset scope", "Validate runtime placement"];
  }
}

export function toARSceneManifest(stop: Stop): ARSceneManifest {
  const catalogEntry = arAssetCatalogByStopId.get(stop.id);
  const arType = catalogEntry?.arType || stop.arType || "none";

  return {
    stopId: stop.id,
    stopTitle: stop.title,
    arType,
    headline: headlineForType(arType),
    summary: stop.assetNeeded || catalogEntry?.assetNeeded || stop.description,
    historicalEra: catalogEntry?.historicalEra || "historic Philadelphia",
    stylePreset: catalogEntry?.stylePreset || "documentary",
    visualPriority: catalogEntry?.visualPriority || "historical_accuracy",
    placementNote: placementNoteForAnchor(catalogEntry?.anchorStyle || "front_of_user", stop),
    runtimeAssets: {
      ios: catalogEntry?.iosAsset || stop.modelUrl,
      android: catalogEntry?.androidAsset || stop.modelUrl,
      web: catalogEntry?.webAsset || stop.modelUrl
    },
    contentLayers: contentLayersForType(arType, catalogEntry?.assetNeeded || stop.assetNeeded || ""),
    productionChecklist: checklistForType(arType),
    negativePrompt: catalogEntry?.negativePrompt || "none"
  };
}
