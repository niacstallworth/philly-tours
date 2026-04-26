import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCityPack } from "./lib/city-pack.mjs";
import { readCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const cityPack = loadCityPack(repoRoot);
const catalogCsvPath = path.join(repoRoot, "docs", "ar-asset-catalog.csv");
const sceneManifestDir = path.join(repoRoot, "docs", "ar-scene-manifests");
const outputDir = path.join(repoRoot, "spatial", "runtime", cityPack.cityId);

function parseArgs(argv) {
  const args = {
    outDir: outputDir
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--out-dir") {
      const next = argv[index + 1];
      if (!next) {
        throw new Error("--out-dir requires a value");
      }
      args.outDir = path.resolve(repoRoot, next);
      index += 1;
    }
  }

  return args;
}

function normalizeArType(rawValue) {
  switch ((rawValue || "").trim()) {
    case "story_card":
      return "floating_story_card";
    default:
      return (rawValue || "").trim() || "none";
  }
}

function numberOrNull(value) {
  if (value === "" || value == null) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function stringOrNull(value) {
  const normalized = String(value || "").trim();
  return normalized ? normalized : null;
}

function splitAssetNeeded(assetNeeded) {
  return String(assetNeeded || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}

function headlineForType(arType) {
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
      return "Editorial spatial story card";
    case "route_ghost":
      return "Wayfinding ghost route";
    default:
      return "Historic spatial scene";
  }
}

function anchorStyleForType(arType) {
  switch (arType) {
    case "before_after_overlay":
      return "location_marker";
    case "route_ghost":
      return "ground";
    default:
      return "front_of_user";
  }
}

function placementNoteForAnchor(anchorStyle, triggerRadiusM) {
  switch (anchorStyle) {
    case "front_of_user":
      return `Place the scene directly in front of the visitor at a safe standing distance within the ${triggerRadiusM}m trigger zone.`;
    case "ground":
      return "Anchor the scene to ground level near the stop footprint and preserve walkable clearance around the user.";
    case "image_target":
      return "Anchor this scene to a recognized visual target and preserve orientation fidelity against the source image.";
    case "location_marker":
      return "Anchor this scene to the verified location marker and bias for outdoor GPS drift tolerance.";
    default:
      return "Use a front-facing placement that preserves readability and safe standing room.";
  }
}

function contentLayersForType(arType, assetNeeded) {
  const base = splitAssetNeeded(assetNeeded);

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

function interactionHintsForType(arType) {
  switch (arType) {
    case "portal_reconstruction":
      return ["pinch to reveal card", "voice next stop", "look to recenter"];
    case "historical_figure_presence":
      return ["pinch to hear identity cue", "voice repeat", "look to recenter"];
    case "before_after_overlay":
      return ["pinch to toggle overlay", "voice hide panel", "look to recenter"];
    case "object_on_plinth":
      return ["pinch to inspect object", "voice repeat", "hold to reposition"];
    case "animated_diagram":
      return ["pinch to step animation", "voice next step", "hold to reposition"];
    case "floating_story_card":
      return ["pinch to expand", "voice hide panel", "look to recenter"];
    case "route_ghost":
      return ["follow beacon", "voice next stop", "look to recenter"];
    default:
      return ["pinch to select", "voice next stop"];
  }
}

function surfaceProfileForType(arType) {
  switch (arType) {
    case "portal_reconstruction":
    case "historical_figure_presence":
    case "object_on_plinth":
      return "hero_card";
    case "animated_diagram":
      return "hero_card_with_step_chip";
    case "before_after_overlay":
      return "overlay_card";
    case "route_ghost":
      return "route_beacon";
    case "floating_story_card":
      return "compact_story_card";
    default:
      return "compact_story_card";
  }
}

function heroMomentForType(arType) {
  return (
    arType === "portal_reconstruction" ||
    arType === "historical_figure_presence" ||
    arType === "before_after_overlay" ||
    arType === "object_on_plinth" ||
    arType === "animated_diagram"
  );
}

function loadSceneManifestMap() {
  const manifests = new Map();
  if (!fs.existsSync(sceneManifestDir)) {
    return manifests;
  }

  for (const entry of fs.readdirSync(sceneManifestDir)) {
    if (!entry.endsWith(".json")) {
      continue;
    }
    const fullPath = path.join(sceneManifestDir, entry);
    const manifest = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    if (manifest?.stopId) {
      manifests.set(manifest.stopId, manifest);
    }
  }

  return manifests;
}

function buildQuestRuntime() {
  const manifestByStopId = loadSceneManifestMap();
  const { records } = readCatalogCsv(catalogCsvPath);
  const catalogByStopId = new Map(records.map((record) => [record.stopId, record]));
  const narrationCatalogByStopId = cityPack.narration?.catalogByStopId || {};
  const tours = Array.isArray(cityPack.tours) ? cityPack.tours : [];
  const sceneRecords = [];
  const tourSummaries = [];

  for (const tour of tours) {
    const sceneIds = [];

    for (let stopIndex = 0; stopIndex < tour.stops.length; stopIndex += 1) {
      const stop = tour.stops[stopIndex];
      const runtimeEntry = cityPack.ar?.[stop.id] || null;
      const catalogRecord = catalogByStopId.get(stop.id) || null;
      const manifest = manifestByStopId.get(stop.id) || null;
      const arType = normalizeArType(runtimeEntry?.arType || stop.arType || "");

      if (!arType || arType === "none") {
        continue;
      }

      const assetNeeded = runtimeEntry?.assetNeeded || stop.assetNeeded || catalogRecord?.assetNeeded || "";
      const anchorStyle = stringOrNull(catalogRecord?.anchorStyle) || anchorStyleForType(arType);
      const triggerRadiusM = numberOrNull(stop.triggerRadiusM) ?? numberOrNull(catalogRecord?.triggerRadiusM) ?? 40;
      const contentLayers = manifest?.contentLayers || contentLayersForType(arType, assetNeeded);
      const summary = manifest?.summary || assetNeeded || stop.description;
      const headline = manifest?.headline || headlineForType(arType);
      const scene = {
        sceneId: stop.id,
        stopId: stop.id,
        stopTitle: stop.title,
        tourId: tour.id,
        tourTitle: tour.title,
        sortOrder: stopIndex + 1,
        geo: {
          lat: stop.lat,
          lng: stop.lng,
          coordQuality: stop.coordQuality || stringOrNull(catalogRecord?.coordQuality) || "approximate",
          triggerRadiusM
        },
        ar: {
          type: arType,
          priority: numberOrNull(stop.arPriority) ?? numberOrNull(catalogRecord?.arPriority),
          estimatedEffort: stringOrNull(runtimeEntry?.estimatedEffort) || stringOrNull(stop.estimatedEffort) || stringOrNull(catalogRecord?.estimatedEffort),
          heroMoment: heroMomentForType(arType)
        },
        content: {
          headline,
          summary,
          description: stop.description,
          historicalEra: manifest?.historicalEra || stringOrNull(catalogRecord?.historicalEra) || null,
          stylePreset: manifest?.stylePreset || stringOrNull(catalogRecord?.stylePreset) || "documentary",
          visualPriority: manifest?.visualPriority || stringOrNull(catalogRecord?.visualPriority) || "readability",
          contentLayers,
          voicePrompts: {
            primary: [`Start ${stop.title}`, "Next stop", "Repeat", "Hide panel", "Open on phone"],
            fallback: ["Pause", "Resume", "Recenter"]
          },
          interactionHints: interactionHintsForType(arType)
        },
        assets: {
          models: {
            default: runtimeEntry?.modelUrl || stop.modelUrl,
            ios: manifest?.runtimeAssets?.ios || stringOrNull(catalogRecord?.iosAsset) || null,
            android: manifest?.runtimeAssets?.android || stringOrNull(catalogRecord?.androidAsset) || runtimeEntry?.modelUrl || stop.modelUrl,
            web: manifest?.runtimeAssets?.web || stringOrNull(catalogRecord?.webAsset) || runtimeEntry?.modelUrl || stop.modelUrl
          },
          audio: {
            default: stop.audioUrl,
            drive: narrationCatalogByStopId[stop.id]?.drive || null,
            walk: narrationCatalogByStopId[stop.id]?.walk || null
          }
        },
        placement: {
          anchorStyle,
          placementNote: manifest?.placementNote || placementNoteForAnchor(anchorStyle, triggerRadiusM),
          scale: numberOrNull(catalogRecord?.scale),
          rotationYDeg: numberOrNull(catalogRecord?.rotationYDeg),
          verticalOffsetM: numberOrNull(catalogRecord?.verticalOffsetM) ?? numberOrNull(stop.verticalOffsetM),
          preferredViewingDistanceM: numberOrNull(catalogRecord?.preferredViewingDistanceM),
          sitePlacementMode: stringOrNull(catalogRecord?.sitePlacementMode) || "default",
          siteBearingDeg: numberOrNull(catalogRecord?.siteBearingDeg),
          headingToleranceDeg: numberOrNull(catalogRecord?.headingToleranceDeg),
          siteOffsetXM: numberOrNull(catalogRecord?.siteOffsetXM),
          siteOffsetZM: numberOrNull(catalogRecord?.siteOffsetZM)
        },
        ui: {
          surfaceProfile: surfaceProfileForType(arType),
          overlayBudget: "minimal",
          supportsPanelReposition: true,
          supportsVoiceCommands: true,
          supportsHandTracking: true,
          controllerFallback: true
        },
        quest2: {
          passthroughRecommended: true,
          inputMode: "hand_tracking_first",
          controllerFallback: true
        },
        orion: {
          targetMode: "small_fov_glasses",
          compactPanelsRequired: true,
          voiceFirst: true,
          dismissQuickly: true
        }
      };

      sceneIds.push(scene.sceneId);
      sceneRecords.push(scene);
    }

    if (sceneIds.length > 0) {
      const orderedTourScenes = sceneRecords
        .filter((scene) => scene.tourId === tour.id)
        .sort((left, right) => {
          const leftPriority = left.ar.priority ?? Number.POSITIVE_INFINITY;
          const rightPriority = right.ar.priority ?? Number.POSITIVE_INFINITY;
          if (leftPriority !== rightPriority) {
            return leftPriority - rightPriority;
          }
          return left.sortOrder - right.sortOrder;
        });

      tourSummaries.push({
        id: tour.id,
        title: tour.title,
        durationMin: tour.durationMin,
        distanceMiles: tour.distanceMiles,
        arSceneCount: sceneIds.length,
        heroSceneCount: orderedTourScenes.filter((scene) => scene.ar.heroMoment).length,
        firstSceneId: orderedTourScenes[0]?.sceneId || null,
        firstHeroSceneId: orderedTourScenes.find((scene) => scene.ar.heroMoment)?.sceneId || orderedTourScenes[0]?.sceneId || null
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    cityId: cityPack.cityId,
    designTarget: {
      buildHardwareNow: "Quest 2",
      designHardwareLater: "Orion",
      runtimeStack: ["Unity", "Meta XR All-in-One SDK", "OpenXR", "Quest Passthrough"],
      primaryInputs: ["voice", "hand_tracking", "gaze"],
      fallbackInputs: ["controller"],
      uiRules: [
        "small floating cards",
        "one primary object at a time",
        "no giant VR menus",
        "no controller-only dependency",
        "assume glasses-sized field of view later"
      ]
    },
    sourceFiles: {
      tours: path.relative(repoRoot, path.join(cityPack.cityDir, "tours.json")),
      ar: cityPack.ar ? path.relative(repoRoot, path.join(cityPack.cityDir, "ar.json")) : null,
      narration: cityPack.narration ? path.relative(repoRoot, path.join(cityPack.cityDir, "narration.json")) : null,
      assetCatalog: path.relative(repoRoot, catalogCsvPath),
      sceneManifests: path.relative(repoRoot, sceneManifestDir)
    },
    tours: tourSummaries,
    scenes: sceneRecords
  };
}

function buildHeroRuntime(runtime) {
  const heroScenes = runtime.scenes
    .filter((scene) => scene.ar.heroMoment)
    .sort((left, right) => {
      const leftPriority = left.ar.priority ?? Number.POSITIVE_INFINITY;
      const rightPriority = right.ar.priority ?? Number.POSITIVE_INFINITY;
      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }
      if (left.tourId !== right.tourId) {
        return left.tourId.localeCompare(right.tourId);
      }
      return left.sortOrder - right.sortOrder;
    });
  const heroSceneIds = new Set(heroScenes.map((scene) => scene.sceneId));
  const heroTours = runtime.tours
    .filter((tour) => tour.heroSceneCount > 0)
    .map((tour) => ({
      ...tour,
      arSceneCount: heroScenes.filter((scene) => scene.tourId === tour.id).length
    }));

  return {
    ...runtime,
    runtimeProfile: "hero_only",
    tours: heroTours,
    scenes: heroScenes,
    defaults: {
      launchSceneId: heroTours[0]?.firstHeroSceneId || heroScenes[0]?.sceneId || null,
      launchTourId: heroTours[0]?.id || null,
      availableSceneIds: Array.from(heroSceneIds)
    }
  };
}

function buildReadme(runtime, heroRuntime) {
  const heroSceneCount = runtime.scenes.filter((scene) => scene.ar.heroMoment).length;
  const lines = [
    "# Quest Spatial Runtime",
    "",
    `Generated for city: \`${runtime.cityId}\``,
    "",
    `- Total scenes: ${runtime.scenes.length}`,
    `- Hero scenes: ${heroSceneCount}`,
    `- Source tours: ${runtime.tours.length}`,
    `- Generated file: \`quest-scenes.json\``,
    `- Hero-first file: \`quest-hero-scenes.json\``,
    "",
    "Build command:",
    "",
    "```bash",
    `CITY=${runtime.cityId} npm run spatial:quest:build`,
    "```",
    "",
    "Recommended Unity import path:",
    "",
    "```text",
    "spatial/quest-unity/Assets/StreamingAssets/quest-hero-scenes.json",
    "```",
    "",
    "Hero-first launch defaults:",
    "",
    `- Default launch tour: ${heroRuntime.defaults.launchTourId || "none"}`,
    `- Default launch scene: ${heroRuntime.defaults.launchSceneId || "none"}`,
    "",
    "Tour coverage:"
  ];

  for (const tour of runtime.tours) {
    lines.push(`- ${tour.title}: ${tour.arSceneCount} scenes, ${tour.heroSceneCount} hero scenes`);
  }

  return `${lines.join("\n")}\n`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const runtime = buildQuestRuntime();
  const heroRuntime = buildHeroRuntime(runtime);

  fs.mkdirSync(args.outDir, { recursive: true });
  fs.writeFileSync(path.join(args.outDir, "quest-scenes.json"), `${JSON.stringify(runtime, null, 2)}\n`);
  fs.writeFileSync(path.join(args.outDir, "quest-hero-scenes.json"), `${JSON.stringify(heroRuntime, null, 2)}\n`);
  fs.writeFileSync(path.join(args.outDir, "README.md"), buildReadme(runtime, heroRuntime));

  console.log(
    `Built ${runtime.scenes.length} Quest spatial scenes (${heroRuntime.scenes.length} hero-first) for ${runtime.cityId}.`
  );
}

main();
