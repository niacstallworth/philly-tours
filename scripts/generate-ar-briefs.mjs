import fs from "node:fs";
import path from "node:path";
import { readCatalogCsv } from "./lib/arAssetCatalogCsv.mjs";

const rootDir = process.cwd();
const csvPath = path.join(rootDir, "docs", "ar-asset-catalog.csv");
const outputDir = path.join(rootDir, "docs", "ar-briefs");

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

function slugFileName(value) {
  return `${value}.md`;
}

function relativeImagePathFromBrief(imagePath) {
  const absoluteImagePath = path.join(rootDir, imagePath);
  return path.relative(outputDir, absoluteImagePath).split(path.sep).join("/");
}

function briefHeadline(record) {
  switch ((record.arType || "").trim()) {
    case "portal_reconstruction":
      return "Build a hero portal reconstruction scene with strong environmental depth.";
    case "historical_figure_presence":
      return "Build a respectful figure-led scene with strong silhouette and historical context.";
    case "before_after_overlay":
      return "Build a facade-accurate overlay optimized for before/after comparison.";
    case "object_on_plinth":
      return "Build a museum-style hero object scene with clean educational framing.";
    case "animated_diagram":
      return "Build an explanatory 3D diagram scene focused on clear mechanism storytelling.";
    case "floating_story_card":
      return "Build a lightweight editorial AR card experience optimized for readability.";
    case "route_ghost":
      return "Build a lightweight AR wayfinding overlay with clear directional readability.";
    default:
      return "Build a historically grounded AR scene for this stop.";
  }
}

function recommendedDeliverables(record) {
  switch ((record.arType || "").trim()) {
    case "portal_reconstruction":
      return [
        "Environment concept sheet",
        "Primary portal entrance composition",
        "1 hero scene render",
        "Foreground props list",
        "Occlusion and anchor notes"
      ];
    case "historical_figure_presence":
      return [
        "Figure silhouette concept",
        "Pose and staging sheet",
        "Supporting environment pass",
        "Wardrobe/reference notes",
        "Respect and likeness guardrails"
      ];
    case "before_after_overlay":
      return [
        "Facade match sheet",
        "Alignment reference overlay",
        "Street-view proportion notes",
        "Material palette",
        "Historic signage/details list"
      ];
    case "object_on_plinth":
      return [
        "Hero object turnaround",
        "Base/plinth design",
        "Material callouts",
        "Supporting annotation card",
        "Scale reference"
      ];
    case "animated_diagram":
      return [
        "Mechanism breakdown view",
        "Animation steps sheet",
        "Label/annotation design",
        "Readable silhouette render",
        "Narration timing note"
      ];
    default:
      return [
        "Primary concept render",
        "Supporting annotation card",
        "Environment/material notes"
      ];
  }
}

function buildBrief(record) {
  const imageSection =
    record.generatedImagePath && record.generatedImagePath.trim()
      ? `## Current Concept Image\n\n![${record.stopTitle}](${relativeImagePathFromBrief(record.generatedImagePath.trim())})\n`
      : "## Current Concept Image\n\nNo generated concept image linked yet.\n";

  const deliverables = recommendedDeliverables(record).map((item) => `- ${item}`).join("\n");

  return `# ${record.stopTitle}

${briefHeadline(record)}

## Production Summary

- Tour: ${record.tourTitle}
- Stop ID: \`${record.stopId}\`
- Priority: ${record.arPriority}
- AR Type: \`${record.arType}\`
- Planned provider: \`${record.imageProvider}\`
- Fallback provider: \`${record.fallbackImageProvider}\`
- Current generated provider: \`${record.generatedImageProvider || "none"}\`
- Effort: \`${record.estimatedEffort || "n/a"}\`
- Coordinate quality: \`${record.coordQuality}\`
- Trigger radius: ${record.triggerRadiusM}m
- Historical era: ${record.historicalEra || "n/a"}
- Style preset: \`${record.stylePreset || "n/a"}\`
- Visual priority: \`${record.visualPriority || "n/a"}\`

## Scene Intent

${record.assetNeeded || "No asset brief entered yet."}

## Visual Direction

- Anchor style: \`${record.anchorStyle}\`
- Fallback type: \`${record.fallbackType}\`
- Scale: ${record.scale}
- Rotation: ${record.rotationYDeg}deg
- Negative prompt / avoid list: ${record.negativePrompt || "n/a"}

## 3D / Art Deliverables

${deliverables}

## Runtime Assets

- iOS target asset: \`${record.iosAsset}\`
- Android target asset: \`${record.androidAsset}\`
- Web target asset: \`${record.webAsset}\`
- Current concept image path: \`${record.generatedImagePath || "n/a"}\`

${imageSection}

## Prompt Inputs

### Replicate
\`\`\`
${record.replicatePrompt || "n/a"}
\`\`\`

### Stability
\`\`\`
${record.stabilityPrompt || "n/a"}
\`\`\`

### fal
\`\`\`
${record.falPrompt || "n/a"}
\`\`\`

## Notes

${record.notes || "No additional notes."}
`;
}

function buildIndex(records) {
  const lines = [
    "# AR Production Briefs",
    "",
    `Generated from \`docs/ar-asset-catalog.csv\`. Total briefs: ${records.length}`,
    ""
  ];

  for (const record of records) {
    lines.push(
      `- P${record.arPriority} [${record.stopTitle}](./${slugFileName(record.stopId)}) - ${record.tourTitle} - provider ${record.imageProvider} - generated ${record.generatedImageProvider || "none"}`
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

  for (const record of selected) {
    const briefPath = path.join(outputDir, slugFileName(record.stopId));
    fs.writeFileSync(briefPath, buildBrief(record));
  }

  fs.writeFileSync(path.join(outputDir, "README.md"), buildIndex(selected));
  console.log(`Generated ${selected.length} AR production brief(s).`);
}

main();
