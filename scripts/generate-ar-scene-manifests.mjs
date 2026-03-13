import fs from "node:fs";
import path from "node:path";
import { readCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";

const rootDir = process.cwd();
const csvPath = path.join(rootDir, "docs", "ar-asset-catalog.csv");
const outputDir = path.join(rootDir, "docs", "ar-scene-manifests");

function parseArgs(argv) {
  const args = {
    stopId: "",
    limit: Number.POSITIVE_INFINITY
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--stop-id") {
      args.stopId = argv[index + 1] || "";
      index += 1;
      continue;
    }
    if (value === "--limit") {
      const parsed = Number(argv[index + 1] || "");
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error("--limit must be a positive number");
      }
      args.limit = parsed;
      index += 1;
    }
  }

  return args;
}

function headlineForType(arType) {
  switch ((arType || "").trim()) {
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

function placementNoteForAnchor(anchorStyle, triggerRadiusM) {
  switch ((anchorStyle || "").trim()) {
    case "front_of_user":
      return `Place the scene directly in front of the visitor at a safe standing distance within the ${triggerRadiusM}m trigger zone.`;
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

function contentLayersForType(arType, assetNeeded) {
  const base = (assetNeeded || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);

  switch ((arType || "").trim()) {
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

function checklistForType(arType) {
  switch ((arType || "").trim()) {
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
      return ["Confirm concept image", "Define asset scope", "Validate runtime placement"];
  }
}

function toManifest(record) {
  return {
    stopId: record.stopId,
    stopTitle: record.stopTitle,
    tourId: record.tourId,
    tourTitle: record.tourTitle,
    arPriority: Number(record.arPriority),
    arType: record.arType,
    headline: headlineForType(record.arType),
    summary: record.assetNeeded || "No asset brief entered yet.",
    historicalEra: record.historicalEra || "historic Philadelphia",
    stylePreset: record.stylePreset || "documentary",
    visualPriority: record.visualPriority || "historical_accuracy",
    placementNote: placementNoteForAnchor(record.anchorStyle, Number(record.triggerRadiusM)),
    conceptImagePath: record.generatedImagePath || "",
    plannedProvider: record.imageProvider || "unassigned",
    fallbackProvider: record.fallbackImageProvider || "unassigned",
    generatedProvider: record.generatedImageProvider || "not generated",
    runtimeAssets: {
      ios: record.iosAsset,
      android: record.androidAsset,
      web: record.webAsset
    },
    contentLayers: contentLayersForType(record.arType, record.assetNeeded),
    productionChecklist: checklistForType(record.arType),
    negativePrompt: record.negativePrompt || "none"
  };
}

function buildIndex(manifests) {
  const lines = [
    "# AR Scene Manifests",
    "",
    `Generated from \`docs/ar-asset-catalog.csv\`. Total manifests: ${manifests.length}`,
    ""
  ];

  for (const manifest of manifests) {
    lines.push(
      `- P${manifest.arPriority} [${manifest.stopTitle}](./${manifest.stopId}.json) - ${manifest.tourTitle} - planned ${manifest.plannedProvider} - generated ${manifest.generatedProvider}`
    );
  }

  return `${lines.join("\n")}\n`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const { records } = readCatalogCsv(csvPath);
  const selected = records
    .sort((left, right) => Number(left.arPriority) - Number(right.arPriority))
    .filter((record) => !args.stopId || record.stopId === args.stopId)
    .slice(0, args.limit);

  fs.mkdirSync(outputDir, { recursive: true });

  const manifests = selected.map(toManifest);
  for (const manifest of manifests) {
    fs.writeFileSync(
      path.join(outputDir, `${manifest.stopId}.json`),
      `${JSON.stringify(manifest, null, 2)}\n`
    );
  }

  fs.writeFileSync(path.join(outputDir, "README.md"), buildIndex(manifests));
  console.log(`Generated ${manifests.length} AR scene manifests.`);
}

main();
