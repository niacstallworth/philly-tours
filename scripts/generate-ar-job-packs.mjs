import fs from "node:fs";
import path from "node:path";
import { readCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";
import { resolveStylePreset, resolveVisualPriority } from "./lib/arPromptBuilder.mjs";

const rootDir = process.cwd();
const csvPath = path.join(rootDir, "docs", "ar-asset-catalog.csv");
const defaultOutputDir = path.join(rootDir, "docs", "ar-job-packs");

function parseArgs(argv) {
  const args = {
    stopId: "",
    limit: Number.POSITIVE_INFINITY,
    outputDir: defaultOutputDir
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
      continue;
    }
    if (value === "--output-dir") {
      const next = argv[index + 1] || "";
      if (!next.trim()) {
        throw new Error("--output-dir requires a value");
      }
      args.outputDir = path.resolve(rootDir, next);
      index += 1;
    }
  }

  return args;
}

function relativeRepoPath(absolutePath) {
  return path.relative(rootDir, absolutePath).replace(/\\/g, "/");
}

function asNumber(value, fieldName, rowNumber) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Row ${rowNumber}: ${fieldName} must be a number`);
  }
  return parsed;
}

function required(value, fieldName, rowNumber) {
  if (!String(value || "").trim()) {
    throw new Error(`Row ${rowNumber}: ${fieldName} is required`);
  }
  return String(value).trim();
}

function optionalNumber(value, fieldName, rowNumber) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return 0;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Row ${rowNumber}: ${fieldName} must be a number when provided`);
  }
  return parsed;
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

function conceptGoalForType(arType) {
  switch ((arType || "").trim()) {
    case "portal_reconstruction":
      return "Create a spatially convincing reconstruction with foreground depth and a clear portal framing moment.";
    case "historical_figure_presence":
      return "Stage a respectful figure-led scene with strong silhouette clarity and restrained supporting context.";
    case "before_after_overlay":
      return "Create a proportionally accurate architectural overlay optimized for comparison against the real site.";
    case "object_on_plinth":
      return "Create a clean hero object presentation with museum-style framing and minimal clutter.";
    case "animated_diagram":
      return "Create a readable explanatory object or mechanism scene where motion supports understanding.";
    case "floating_story_card":
      return "Create an editorial story-card scene that privileges readability over spectacle.";
    case "route_ghost":
      return "Create a directional guidance overlay with immediate legibility and minimal visual noise.";
    default:
      return "Create a historically grounded AR scene that feels precise, premium, and spatially readable.";
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
  const base = String(assetNeeded || "")
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
      return ["Define asset scope", "Validate runtime placement"];
  }
}

function recommendedApiStagesForType(arType) {
  switch ((arType || "").trim()) {
    case "floating_story_card":
      return ["text_brief", "concept_image"];
    case "animated_diagram":
      return ["text_brief", "concept_image", "rough_mesh"];
    default:
      return ["text_brief", "concept_image", "rough_mesh"];
  }
}

function readCatalogRows() {
  const { records } = readCatalogCsv(csvPath);

  return records.map((record, index) => {
    const rowNumber = index + 2;

    return {
      tourId: required(record.tourId, "tourId", rowNumber),
      tourTitle: required(record.tourTitle, "tourTitle", rowNumber),
      stopId: required(record.stopId, "stopId", rowNumber),
      stopTitle: required(record.stopTitle, "stopTitle", rowNumber),
      arPriority: asNumber(required(record.arPriority, "arPriority", rowNumber), "arPriority", rowNumber),
      arType: required(record.arType, "arType", rowNumber),
      assetStatus: required(record.assetStatus, "assetStatus", rowNumber),
      iosAsset: required(record.iosAsset, "iosAsset", rowNumber),
      androidAsset: required(record.androidAsset, "androidAsset", rowNumber),
      webAsset: required(record.webAsset, "webAsset", rowNumber),
      scale: asNumber(required(record.scale, "scale", rowNumber), "scale", rowNumber),
      rotationYDeg: asNumber(required(record.rotationYDeg, "rotationYDeg", rowNumber), "rotationYDeg", rowNumber),
      verticalOffsetM: optionalNumber(record.verticalOffsetM, "verticalOffsetM", rowNumber),
      anchorStyle: required(record.anchorStyle, "anchorStyle", rowNumber),
      fallbackType: required(record.fallbackType, "fallbackType", rowNumber),
      coordQuality: required(record.coordQuality, "coordQuality", rowNumber),
      triggerRadiusM: asNumber(required(record.triggerRadiusM, "triggerRadiusM", rowNumber), "triggerRadiusM", rowNumber),
      assetNeeded: String(record.assetNeeded || "").trim(),
      estimatedEffort: String(record.estimatedEffort || "").trim(),
      notes: String(record.notes || "").trim(),
      stylePreset: resolveStylePreset(record),
      visualPriority: resolveVisualPriority(record),
      historicalEra: String(record.historicalEra || "").trim() || "historic Philadelphia",
      negativePrompt: String(record.negativePrompt || "").trim() || "none"
    };
  });
}

function buildPromptPack(record) {
  const contentLayers = contentLayersForType(record.arType, record.assetNeeded);
  const productionChecklist = checklistForType(record.arType);
  const placementNote = placementNoteForAnchor(record.anchorStyle, record.triggerRadiusM);
  const sceneHeadline = headlineForType(record.arType);
  const apiStages = recommendedApiStagesForType(record.arType);

  const sharedContext = [
    `Stop: ${record.stopTitle}`,
    `Tour: ${record.tourTitle}`,
    `AR type: ${record.arType}`,
    `Scene goal: ${conceptGoalForType(record.arType)}`,
    `Historical era: ${record.historicalEra}`,
    `Style preset: ${record.stylePreset}`,
    `Visual priority: ${record.visualPriority}`,
    `Runtime placement: ${placementNote}`,
    `Requested content layers: ${contentLayers.join(", ") || "none specified"}`,
    `Fallback type: ${record.fallbackType}`,
    `Negative prompt / avoid list: ${record.negativePrompt}`
  ].join("\n");

  const textBriefPrompt = [
    "You are preparing an internal production brief for a mobile AR scene.",
    "The output should help a human artist or producer create a historically grounded 3D asset.",
    "Do not describe final app UI, dashboards, or developer tooling.",
    "",
    sharedContext,
    "",
    `Asset request from catalog: ${record.assetNeeded || "No specific asset request supplied."}`,
    `Producer notes: ${record.notes || "None."}`,
    "",
    "Return:",
    "1. A concise scene concept paragraph.",
    "2. A composition breakdown with foreground, midground, and background.",
    "3. A material/reference checklist.",
    "4. A risk list covering historical accuracy, readability, and placement drift concerns.",
    "5. Recommended reference imagery or archival material to gather before modeling."
  ].join("\n");

  const conceptImagePrompt = [
    "Generate an internal concept image only. This is not the final runtime asset.",
    "The image should help art direction, lighting, composition, and texture planning for a future 3D model.",
    "Preserve historical plausibility and avoid speculative sci-fi embellishment.",
    "",
    sharedContext,
    "",
    `Scene headline: ${sceneHeadline}`,
    `Desired visual emphasis: ${record.visualPriority}`,
    `Target atmosphere: ${record.stylePreset}`,
    "",
    "Requirements:",
    "- Keep the scene legible as a single clear AR moment.",
    "- Avoid crowded compositions and complex HUD overlays.",
    "- Bias toward forms that can be translated cleanly into a 3D asset.",
    `- Avoid: ${record.negativePrompt}`
  ].join("\n");

  const roughMeshPrompt = [
    "Generate a rough 3D blockout or starting geometry only.",
    "This output will be cleaned manually before becoming a production AR asset.",
    "Do not assume the generated mesh is final quality.",
    "",
    sharedContext,
    "",
    `Primary asset request: ${record.assetNeeded || "No specific asset request supplied."}`,
    `Expected runtime targets: iOS ${record.iosAsset}, Android ${record.androidAsset}, Web ${record.webAsset}`,
    "",
    "Requirements:",
    "- Prioritize silhouette, scale, and spatial readability over decorative detail.",
    "- Preserve clean separable geometry for manual cleanup in Blender or similar tools.",
    "- Favor historically plausible massing and proportions.",
    `- Avoid: ${record.negativePrompt}`
  ].join("\n");

  return {
    textBriefPrompt,
    conceptImagePrompt,
    roughMeshPrompt,
    apiStages
  };
}

function buildJobPack(record, outputDir) {
  const contentLayers = contentLayersForType(record.arType, record.assetNeeded);
  const productionChecklist = checklistForType(record.arType);
  const placementNote = placementNoteForAnchor(record.anchorStyle, record.triggerRadiusM);
  const promptPack = buildPromptPack(record);
  const stopOutputDir = path.join(outputDir, record.stopId);

  return {
    schemaVersion: 1,
    jobId: `ar-job-${record.stopId}`,
    status: "planned",
    stop: {
      stopId: record.stopId,
      stopTitle: record.stopTitle,
      tourId: record.tourId,
      tourTitle: record.tourTitle,
      arPriority: record.arPriority,
      arType: record.arType,
      assetStatus: record.assetStatus
    },
    sourceFiles: {
      catalogCsv: "docs/ar-asset-catalog.csv",
      productionBrief: `docs/ar-briefs/${record.stopId}.md`,
      sceneManifest: `docs/ar-scene-manifests/${record.stopId}.json`
    },
    runtimeTargets: {
      iosAsset: record.iosAsset,
      androidAsset: record.androidAsset,
      webAsset: record.webAsset
    },
    placement: {
      anchorStyle: record.anchorStyle,
      coordQuality: record.coordQuality,
      triggerRadiusM: record.triggerRadiusM,
      placementNote,
      fallbackType: record.fallbackType,
      scale: record.scale,
      rotationYDeg: record.rotationYDeg,
      verticalOffsetM: record.verticalOffsetM
    },
    creativeDirection: {
      headline: headlineForType(record.arType),
      conceptGoal: conceptGoalForType(record.arType),
      assetNeeded: record.assetNeeded,
      historicalEra: record.historicalEra,
      stylePreset: record.stylePreset,
      visualPriority: record.visualPriority,
      estimatedEffort: record.estimatedEffort || "unspecified",
      notes: record.notes,
      negativePrompt: record.negativePrompt
    },
    scenePlan: {
      contentLayers,
      productionChecklist
    },
    aiGuardrails: [
      "Use AI for concept ideation, moodboards, references, and rough starting geometry only.",
      "Do not treat 2D image output as the final AR object.",
      "Final user-facing output must become a cleaned 3D asset packaged as .usdz for iOS and .glb for Android/web.",
      "Favor historically grounded scenes over speculative spectacle.",
      "Optimize for one clear AR moment at a time rather than layered clutter."
    ],
    pipeline: {
      apiStages: promptPack.apiStages,
      workingDirectory: relativeRepoPath(stopOutputDir),
      expectedOutputs: {
        conceptBrief: `${relativeRepoPath(stopOutputDir)}/prompts.md#text-brief-prompt`,
        conceptImagePrompt: `${relativeRepoPath(stopOutputDir)}/prompts.md#concept-image-prompt`,
        roughMeshPrompt: `${relativeRepoPath(stopOutputDir)}/prompts.md#rough-mesh-prompt`,
        draftAssetWorkspace: `generated/ar/${record.stopId}/`,
        finalRuntimeAssets: {
          ios: record.iosAsset,
          android: record.androidAsset,
          web: record.webAsset
        }
      }
    }
  };
}

function buildPromptMarkdown(jobPack) {
  return `# ${jobPack.stop.stopTitle}

Provider-agnostic AR generation job pack for \`${jobPack.stop.stopId}\`.

## Stop Summary

- Tour: ${jobPack.stop.tourTitle}
- Priority: ${jobPack.stop.arPriority}
- AR Type: \`${jobPack.stop.arType}\`
- Asset status: \`${jobPack.stop.assetStatus}\`
- Runtime targets:
  - iOS: \`${jobPack.runtimeTargets.iosAsset}\`
  - Android: \`${jobPack.runtimeTargets.androidAsset}\`
  - Web: \`${jobPack.runtimeTargets.webAsset}\`

## Creative Direction

- Headline: ${jobPack.creativeDirection.headline}
- Concept goal: ${jobPack.creativeDirection.conceptGoal}
- Historical era: ${jobPack.creativeDirection.historicalEra}
- Style preset: \`${jobPack.creativeDirection.stylePreset}\`
- Visual priority: \`${jobPack.creativeDirection.visualPriority}\`
- Asset request: ${jobPack.creativeDirection.assetNeeded || "No asset request supplied."}
- Placement note: ${jobPack.placement.placementNote}
- Negative prompt / avoid list: ${jobPack.creativeDirection.negativePrompt}

## AI Guardrails

${jobPack.aiGuardrails.map((item) => `- ${item}`).join("\n")}

## Suggested API Stages

${jobPack.pipeline.apiStages.map((item) => `- \`${item}\``).join("\n")}

## Text Brief Prompt

\`\`\`
${jobPack.promptPack.textBriefPrompt}
\`\`\`

## Concept Image Prompt

\`\`\`
${jobPack.promptPack.conceptImagePrompt}
\`\`\`

## Rough Mesh Prompt

\`\`\`
${jobPack.promptPack.roughMeshPrompt}
\`\`\`
`;
}

function buildIndex(jobPacks, outputDir) {
  const lines = [
    "# AR Job Packs",
    "",
    "Generated from `docs/ar-asset-catalog.csv`.",
    "",
    `Output folder: \`${relativeRepoPath(outputDir)}\``,
    `Generated packs: ${jobPacks.length}`,
    "",
    "Each stop gets:",
    "- `job.json` for structured metadata and pipeline stages",
    "- `prompts.md` for provider-ready prompts and guardrails",
    ""
  ];

  for (const jobPack of jobPacks) {
    lines.push(
      `- P${jobPack.stop.arPriority} [${jobPack.stop.stopTitle}](./${jobPack.stop.stopId}/prompts.md) - \`${jobPack.stop.stopId}\``
    );
  }

  return `${lines.join("\n")}\n`;
}

function writeJobPack(jobPack, outputDir) {
  const stopOutputDir = path.join(outputDir, jobPack.stop.stopId);
  fs.mkdirSync(stopOutputDir, { recursive: true });

  fs.writeFileSync(
    path.join(stopOutputDir, "job.json"),
    `${JSON.stringify(
      {
        ...jobPack,
        promptPack: {
          textBriefPrompt: jobPack.promptPack.textBriefPrompt,
          conceptImagePrompt: jobPack.promptPack.conceptImagePrompt,
          roughMeshPrompt: jobPack.promptPack.roughMeshPrompt
        }
      },
      null,
      2
    )}\n`
  );
  fs.writeFileSync(path.join(stopOutputDir, "prompts.md"), buildPromptMarkdown(jobPack));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const rows = readCatalogRows()
    .sort((left, right) => left.arPriority - right.arPriority || left.stopTitle.localeCompare(right.stopTitle))
    .filter((record) => !args.stopId || record.stopId === args.stopId)
    .slice(0, args.limit);

  fs.mkdirSync(args.outputDir, { recursive: true });

  const jobPacks = rows.map((record) => {
    const jobPack = buildJobPack(record, args.outputDir);
    jobPack.promptPack = buildPromptPack(record);
    return jobPack;
  });

  for (const jobPack of jobPacks) {
    writeJobPack(jobPack, args.outputDir);
  }

  fs.writeFileSync(path.join(args.outputDir, "README.md"), buildIndex(jobPacks, args.outputDir));
  console.log(`Generated ${jobPacks.length} AR job pack(s) in ${relativeRepoPath(args.outputDir)}.`);
}

main();
